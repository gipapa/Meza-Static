import Phaser from 'phaser';
import TimedScene from '../TimedScene';
import { DESIGN_H, DESIGN_W, ensureFxTextures } from './fx';
import { getPhase } from './timeline';
import type { CinematicTimeline } from './timeline';
import type { ActorArt } from '../actorArt';

/* ────────────────────────────────────────────────────────────────────
 *  CinematicScene — base class for advanced (long-form) move animations.
 *
 *  Architecture
 *  - Fixed 360×640 portrait design space, rendered at RENDER_SCALE (2×) into
 *    a 720×1280 canvas that Phaser's Scale.FIT fits to the phone screen.
 *  - The world holds several "sets" side by side (attacker close-up, target
 *    close-up, two-shot…). The main camera *cuts* or *pans* between them,
 *    like the shot list of a Super Robot Wars attack.
 *  - A second camera (`uiCam`) renders a screen-space UI layer (`ui*`
 *    containers) placed far away in the world: cut-ins, titles, letterbox,
 *    flashes. It never moves, shakes or zooms with the main camera.
 *  - Timing is a list of named phases (timeline.ts). Subclasses schedule cues
 *    relative to a phase: `this.phase('charge', 2500, () => …)`.
 *  - Cues run on the *tween clock*: a linear counter tween in the scene's own
 *    TweenManager, so cues and tweens share timeScale and lag smoothing
 *    exactly. A wall-clock timer would drift ahead of tweens whenever frames
 *    drop (common on phones) and could destroy objects mid-tween; this clock
 *    also pauses with the game loop when the tab is hidden.
 *    `speed` (tweens.timeScale) lets QA preview the whole cinematic at 10×.
 *  ──────────────────────────────────────────────────────────────────── */

export const RENDER_SCALE = 2;
export const CINEMATIC_CANVAS = { width: DESIGN_W * RENDER_SCALE, height: DESIGN_H * RENDER_SCALE } as const;

/** Where the screen-space UI layer lives in world coordinates. */
const UI_ORIGIN = { x: -5000, y: -5000 } as const;

/** emoji is the fallback; `art` (optional) is the custom image. */
export interface CinematicActor extends ActorArt {
  name: string;
}

export interface MoveCinematicData {
  /** Always the opponent's monster (top of the simple layout). */
  enemy: CinematicActor;
  /** Always the player's monster (bottom of the simple layout). */
  ally: CinematicActor;
  isPlayerAttacking: boolean;
  moveName: string;
  moveType: string;
  /** Type color, e.g. '#22C55E'. */
  typeColor: string;
  /** Localised type label, e.g. '草'. */
  typeLabel?: string;
  damage: number;
  /** Playback speed multiplier (QA/test pages). Default 1. */
  speed?: number;
  /** Called at the start of every timeline phase (test pages / analytics). */
  onPhase?: (id: string, label: string) => void;
  onComplete: () => void;
}

export default abstract class CinematicScene extends TimedScene {
  protected abstract readonly timeline: CinematicTimeline;

  protected d!: MoveCinematicData;
  protected speed = 1;
  /** Screen-space layers, back to front. */
  protected uiBack!: Phaser.GameObjects.Container;
  protected uiMid!: Phaser.GameObjects.Container;
  protected uiTop!: Phaser.GameObjects.Container;
  protected uiCam!: Phaser.Cameras.Scene2D.Camera;

  private finished = false;
  /** prefers-reduced-motion: no camera shake. */
  protected reduceMotion = false;
  /** Design-time ms elapsed on the tween clock. */
  private clock = 0;
  private clockTween: Phaser.Tweens.Tween | null = null;
  private cues: { t: number; seq: number; fn: () => void }[] = [];
  private seq = 0;

  /** Design-time ms elapsed since create() (the tween clock). Used by verification tools. */
  get elapsedMs(): number { return this.clock; }

  get attacker(): CinematicActor { return this.d.isPlayerAttacking ? this.d.ally : this.d.enemy; }
  get defender(): CinematicActor { return this.d.isPlayerAttacking ? this.d.enemy : this.d.ally; }

  /** Build the sets (world objects). Called once before cues are scheduled. */
  protected abstract build(): void;
  /** Schedule all cues with `phase()` / `cue()`. */
  protected abstract direct(): void;

  create(data: MoveCinematicData) {
    if (!data?.onComplete) return;
    this.d = data;
    this.finished = false;
    this.clock = 0;
    this.cues = [];
    this.speed = Phaser.Math.Clamp(data.speed ?? 1, 0.25, 20);
    this.initTimeline();
    this.tweens.timeScale = this.speed;
    ensureFxTextures(this);

    const cam = this.cameras.main;
    cam.setBackgroundColor('#000000');
    cam.setZoom(RENDER_SCALE);

    const mk = () => this.add.container(UI_ORIGIN.x, UI_ORIGIN.y);
    this.uiBack = mk().setDepth(10_000);
    this.uiMid = mk().setDepth(10_001);
    this.uiTop = mk().setDepth(10_002);
    this.uiCam = this.cameras.add(0, 0, this.scale.width, this.scale.height)
      .setZoom(RENDER_SCALE)
      .centerOn(UI_ORIGIN.x + DESIGN_W / 2, UI_ORIGIN.y + DESIGN_H / 2);
    this.uiCam.transparent = true;
    this.reduceMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.separateCameras();

    // Linear 0 → N over N ms: its value *is* elapsed design time. Keeping
    // the tween span equal to the timeline makes a 60,000 ms design timeline
    // a 60-second real-time cinematic at speed=1 (and preserves QA speedups).
    const span = this.timeline.totalMs;
    // persist: a completed tween is otherwise destroyed and getValue() returns
    // null, freezing the clock just short of totalMs so the final cue
    // (finish → onComplete) would never fire. Keep it alive at its end value.
    this.clockTween = this.tweens.addCounter({ from: 0, to: span, duration: span, ease: 'Linear', persist: true });

    this.build();
    for (const p of this.timeline.phases) this.cue(p.start, () => this.d.onPhase?.(p.id, p.label));
    this.direct();
    this.cue(this.timeline.totalMs, () => this.finish());
  }

  /**
   * Each camera only draws its own layer: the main camera skips the UI
   * containers, and the UI camera skips every world object. Without this,
   * every object is submitted twice per frame (once per camera).
   * World objects are filtered once per frame on PRE_RENDER, after they have
   * had the chance to be moved into a UI container.
   */
  private separateCameras() {
    const uiRoots = new Set<Phaser.GameObjects.GameObject>([this.uiBack, this.uiMid, this.uiTop]);
    this.cameras.main.ignore([this.uiBack, this.uiMid, this.uiTop]);
    let pending: Phaser.GameObjects.GameObject[] = [];
    this.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, (obj: Phaser.GameObjects.GameObject) => {
      if (!uiRoots.has(obj)) pending.push(obj);
    });
    this.events.on(Phaser.Scenes.Events.PRE_RENDER, () => {
      if (pending.length === 0) return;
      const batch = pending;
      pending = [];
      for (const obj of batch) {
        if (!obj.scene) continue; // destroyed already
        let root: Phaser.GameObjects.GameObject = obj;
        while (root.parentContainer) root = root.parentContainer;
        if (!uiRoots.has(root)) this.uiCam.ignore(obj);
      }
    });
  }

  /** Schedule `ms` of design time from now (absolute when called from direct()). */
  protected cue(ms: number, fn: () => void) {
    this.cues.push({ t: this.clock + ms, seq: this.seq++, fn });
  }

  update() {
    if (!this.d || !this.clockTween) return;
    this.clock = this.clockTween.getValue() ?? this.clock;
    if (this.cues.length === 0) return;
    // Fire due cues in time order; cues may schedule further cues.
    for (;;) {
      let next = -1;
      for (let i = 0; i < this.cues.length; i++) {
        const c = this.cues[i];
        if (c.t <= this.clock && (next < 0 || c.t < this.cues[next].t || (c.t === this.cues[next].t && c.seq < this.cues[next].seq))) next = i;
      }
      if (next < 0) break;
      const [c] = this.cues.splice(next, 1);
      c.fn();
    }
  }

  /** Also drop pending cues (PhaserContainer calls this before destroy). */
  cancelTimers() {
    super.cancelTimers();
    this.cues = [];
  }

  /** Schedule at `offsetMs` into the named phase. */
  protected phase(id: string, offsetMs: number, fn: () => void) {
    this.cue(getPhase(this.timeline, id).start + offsetMs, fn);
  }

  /** Design ms → real ms for camera effects (which ignore tweens.timeScale). */
  protected ms(v: number) {
    return v / this.speed;
  }

  /* ── Camera helpers (zoom values are in design scale; 1 = full set) ── */

  protected cut(x: number, y: number, zoom = 1, rotation = 0) {
    const cam = this.cameras.main;
    cam.panEffect.reset();
    cam.zoomEffect.reset();
    cam.rotateToEffect?.reset();
    cam.shakeEffect.reset();
    cam.setRotation(rotation);
    cam.setZoom(zoom * RENDER_SCALE);
    cam.centerOn(x, y);
  }

  protected pan(x: number, y: number, ms: number, ease = 'Sine.easeInOut') {
    this.cameras.main.pan(x, y, this.ms(ms), ease, true);
  }

  protected zoomTo(zoom: number, ms: number, ease = 'Sine.easeInOut') {
    this.cameras.main.zoomTo(zoom * RENDER_SCALE, this.ms(ms), ease, true);
  }

  protected rotateTo(rad: number, ms: number, ease = 'Sine.easeInOut') {
    this.cameras.main.rotateTo(rad, false, this.ms(ms), ease, true);
  }

  protected shake(ms: number, intensity: number) {
    if (this.reduceMotion) return;
    this.cameras.main.shake(this.ms(ms), intensity, true);
  }

  /** Ends the cinematic once (timeline end or external skip via scene stop). */
  protected finish() {
    if (this.finished) return;
    this.finished = true;
    this.d.onComplete();
  }
}
