import Phaser from 'phaser';
import CinematicScene from './CinematicScene';
import { BRICK_BREAK_TIMELINE } from './brickBreakTimeline';
import { resolveBattleLayout } from '../BattleScene';
import { addActorSprite, baseScale } from '../actorArt';
import type { ActorSprite } from '../actorArt';
import * as energy from './energyFx';
import {
  DESIGN_W as W, DESIGN_H as H, FONT_TC, concentrationLines, cutIn, emitter,
  eyeCatch, floatNumber, hexToNum, letterbox, ring, screenFlash, slash, stamp, txt,
} from './fx';

/**
 * 劈瓦 / brick-break — Codex; catalog type fighting, primary TYPE_COLORS[fighting].
 * Brief: 瓦層破碎. Accent ACCENT; sets A/B/C: 擂台／岩山／競技場.
 * Actors are portraits only; the attack is procedural light and geometric particles.
 * White core + tapered type-color volume + radial falloff + independently flowing
 * threads leave visible afterglow. The local strike() composes this move's signature.
 * Reference: Petal Dance's depth layers and impact rhythm; no borrowed petal attack.
 *
 * Shot / silent SFX cue sheet (no audio subsystem):
 * intro 5s: enemy-above-ally two-shot, ATTACK 300ms, push 2600ms (alarm).
 * cutin 8s: directional portrait/dialogue, title 4300ms (鼓點、風切、重擊).
 * charge 11s: inward threads, meter MAX, eye-catch 7400–9500; contract 10300.
 * release 4s: two-shot; 350 contraction, 850 flow source→target, 2500 impact.
 * brick-break-assault 16s: signature waves hit 2300/5300/10900/13900;
 *   attacker cut-back 6800–9300; each wave includes flow, core and dissipation.
 * finale 9s: 碎壁掌刃 title, eye-catch #2 2400–4200,
 *   4600 contraction, 5100 signature release, 6100 maximum local impact.
 * aftermath 7s: fading motes, tilt, TOTAL DAMAGE, FINISH, bars retract, fade.
 * Inspect moving release at 25.8s, body hit 30.3s, maximum impact 50.1s.
 * All phase starts: 0/5/13/24/28/44/53 seconds. Base finishes at 60s.
 * Budget: three baked backdrops, <=10 ambient motes/set; finite pooled VFX.
 * Reduced motion: no shake/dutch angle, slower faint flash; direction retained.
 */
export const BRICK_BREAK_SCENE_KEY = 'BrickBreakScene';
const ACCENT = 0xffdc9e, WIDTH = 19;
const A = { x: W / 2, y: 390 }, B = { x: 1000 + W / 2, y: 330 };
const CX = 2000 + W / 2, ENEMY_Y = 170, ALLY_Y = 500;

export default class BrickBreakScene extends CinematicScene {
  protected readonly timeline = BRICK_BREAK_TIMELINE;
  private color = 0xffffff;
  private atkSprite!: ActorSprite;
  private defSprite!: ActorSprite;
  private twoAtk!: ActorSprite;
  private aura!: Phaser.GameObjects.Image;
  private hits!: Phaser.GameObjects.Text;
  private hitCount = 0;
  private stops: Array<() => void> = [];
  private retract = () => {};

  constructor() { super(BRICK_BREAK_SCENE_KEY); }

  protected build() {
    this.color = hexToNum(this.d.typeColor); this.hitCount = 0; this.stops = [];
    energy.ensureEnergyTextures(this);
    for (const ox of [0, 1000, 2000]) {
      energy.energyBackdrop(this, ox, `brick-break-bg-${ox}`, '#25121b', this.d.typeColor, 1.3);
      const ambient = emitter(this, ox + W / 2, H + 20, energy.LIGHT.thread, {
        x: { min: -170, max: 170 }, speedY: { min: -60, max: -25 }, lifespan: 3500, frequency: 400,
        scaleX: { start: 0.16, end: 0.03 }, scaleY: 0.12, alpha: { start: 0.4, end: 0 },
        tint: [this.color, ACCENT], blendMode: 'ADD',
      });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => ambient.destroy());
    }
    this.aura = energy.softLight(this, A, this.color, 260, 0.16);
    this.atkSprite = addActorSprite(this, A.x, A.y, this.attacker, 128, { resolution: 2 }).setDepth(2);
    this.defSprite = addActorSprite(this, B.x, B.y, this.defender, 112, { resolution: 2 }).setDepth(2);
    const enemy = addActorSprite(this, CX, ENEMY_Y, this.d.enemy, 72, { resolution: 2 });
    const ally = addActorSprite(this, CX, ALLY_Y, this.d.ally, 72, { resolution: 2 });
    this.twoAtk = this.d.isPlayerAttacking ? ally : enemy;
    txt(this, CX, ENEMY_Y + 64, `敵方｜${this.d.enemy.name}`, { fontSize: '14px' });
    txt(this, CX, ALLY_Y + 64, `我方｜${this.d.ally.name}`, { fontSize: '14px' });
    this.hits = txt(this, W - 18, 86, '', { fontSize: '25px', color: '#ffe6aa', stroke: '#080a14', strokeThickness: 4 }).setOrigin(1, 0.5);
    this.uiMid.add(this.hits);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopAll());
  }

  private stopAll() { this.stops.forEach(stop => stop()); this.stops = []; }

  private label(text: string, y: number, size = 30, life = 2200) {
    const t = txt(this, W / 2, y, text, { fontFamily: FONT_TC, fontSize: `${size}px`, fontStyle: 'bold',
      stroke: this.d.typeColor, strokeThickness: 5 });
    this.uiMid.add(t); stamp(this, t, 0, this.reduceMotion ? 1.1 : 1.6);
    energy.fadeObject(this, t, life); return t;
  }

  private flash() {
    screenFlash(this, this.uiTop, ACCENT, this.reduceMotion ? 200 : 60, 30, 500, this.reduceMotion ? 0.08 : 0.32);
  }

  /** 瓦層破碎: move-local paths, geometry, density and impact scale. */
  private strike(from: energy.Point, to: energy.Point, size: number, wave = 0) {
    const s = size, aim = { x: to.x + (wave % 2 ? -8 : 8), y: to.y };
    energy.lightFlow(this, from, aim, this.color, ACCENT, { width: 6 * s, life: 1400, strands: 14 });
    energy.lightFlow(this, { x: aim.x - 40, y: aim.y - 220 }, { x: aim.x + 35, y: aim.y + 120 },
      this.color, ACCENT, { width: WIDTH * s, life: 1600, strands: 18 });
    slash(this, aim.x, aim.y, 78, ACCENT, 600, 290 * s);
  }

  private impact(final = false) {
    this.hitCount += final ? 4 : 1; this.hits.setText(`${this.hitCount} HIT!`);
    energy.lightBloom(this, B, this.color, ACCENT, final ? 1.5 : 0.8);
    ring(this, B.x, B.y, ACCENT, 12, final ? 230 : 115, 1100, 3);
    this.shake(final ? 850 : 250, final ? 0.025 : 0.01);
    this.tweens.add({ targets: this.defSprite, x: B.x + 10, duration: 75, yoyo: true, repeat: final ? 3 : 1 });
    floatNumber(this, B.x + 55, B.y - 85, `${Math.max(1, Math.round(this.d.damage * (final ? 0.4 : 0.15)))}`, '#ffe6aa', 24);
  }

  protected direct() {
    let closeCut = () => {}, closeEye = () => {};
    this.phase('intro', 0, () => {
      this.cut(CX, H / 2, 1); this.cameras.main.fadeIn(this.ms(600));
      this.retract = letterbox(this, this.uiTop);
    });
    this.phase('intro', 300, () => {
      const band = this.add.container(0, H / 2);
      const frame = this.add.rectangle(W / 2, 0, W + 20, 70, 0x070b14, 0.95).setStrokeStyle(2, ACCENT);
      const stripes = this.add.graphics().fillStyle(ACCENT, 0.75);
      for (let x = -20; x < W + 20; x += 24) {
        stripes.fillTriangle(x, -34, x + 12, -34, x - 8, -25);
        stripes.fillTriangle(x, 34, x + 12, 34, x + 32, 25);
      }
      band.add([frame, stripes, txt(this, W / 2, 0, 'ATTACK', { fontSize: '30px' })]);
      this.uiMid.add(band); energy.fadeObject(this, band, 2100);
    });
    this.phase('intro', 2600, () => { this.pan(CX, this.twoAtk.y, 1800); this.zoomTo(1.45, 1800); });
    this.phase('cutin', 0, () => {
      this.cut(A.x, A.y - 25, 1);
      closeCut = cutIn(this, this.uiMid, { ...this.attacker, color: this.color, fromLeft: this.d.isPlayerAttacking,
        lines: ['「瓦層破碎！」', '「一決勝負！」', '「劈瓦！」'], y: H * 0.44 });
    });
    this.phase('cutin', 4000, () => closeCut());
    this.phase('cutin', 4300, () => {
      this.label('劈瓦', H * 0.45, 60, 3300);
      this.label('BRICK BREAK', H * 0.54, 14, 3300);
    });
    this.phase('charge', 0, () => {
      this.cut(A.x, A.y - 20, 1.05); this.zoomTo(1.25, 9500);
      this.stops.push(energy.gatherLight(this, A, this.color, ACCENT, 160, -0.6));
      this.stops.push(concentrationLines(this, this.uiBack, W / 2, H * 0.58, { color: this.color, alpha: this.reduceMotion ? 0.08 : 0.18, count: 22 }));
      this.tweens.add({ targets: this.aura, alpha: 0.7, displayWidth: 440, displayHeight: 440, duration: 9000 });
      energy.lightOrbit(this, A, this.color, ACCENT, 100, 10000, 1.2);
      const gauge = this.add.container(0, H - 98);
      const frame = this.add.rectangle(W / 2, 0, 242, 14).setStrokeStyle(1, ACCENT);
      const fill = this.add.rectangle(61, 0, 238, 10, this.color).setOrigin(0, 0.5).setScale(0, 1);
      const pct = txt(this, W / 2, 28, 'CHARGE', { fontSize: '18px' });
      gauge.add([frame, fill, pct]); this.uiMid.add(gauge);
      this.tweens.add({ targets: fill, scaleX: 1, duration: 8600 });
      this.cue(8600, () => pct.setText('MAX!'));
      energy.fadeObject(this, gauge, 10200);
    });
    this.phase('charge', 7400, () => { closeEye = eyeCatch(this, this.uiMid, { ...this.attacker, color: this.color, shout: '全力！', y: H * 0.28 }); });
    this.phase('charge', 9500, () => closeEye());
    this.phase('charge', 10300, () => {
      this.stopAll(); this.tweens.add({ targets: this.aura, displayWidth: 65, displayHeight: 65, alpha: 0.9, duration: 450 });
    });
    this.phase('release', 0, () => {
      this.stopAll(); this.cut(CX, H / 2, 1);
      this.tweens.add({ targets: this.atkSprite, scale: baseScale(this.atkSprite) * 1.12, duration: 200, yoyo: true });
    });
    this.phase('release', 350, () => ring(this, CX, this.twoAtk.y, this.color, 100, 10, 450, 2));
    this.phase('release', 850, () => {
      const layout = resolveBattleLayout(this.d.isPlayerAttacking, ENEMY_Y, ALLY_Y);
      this.strike({ x: CX, y: layout.attackerY }, { x: CX, y: layout.defenderY }, 0.85);
    });
    this.phase('release', 2500, () => {
      const layout = resolveBattleLayout(this.d.isPlayerAttacking, ENEMY_Y, ALLY_Y);
      energy.lightBloom(this, { x: CX, y: layout.defenderY }, this.color, ACCENT, 0.8); this.shake(350, 0.01);
    });
    this.phase('brick-break-assault', 0, () => this.cut(B.x, B.y, 1.05));
    [2300, 5300, 10900, 13900].forEach((at, i) => {
      this.phase('brick-break-assault', at - 1100, () => this.strike({ x: B.x + (i % 2 ? 190 : -190), y: B.y + (this.d.isPlayerAttacking ? 180 : -180) }, B, 0.9 + i * 0.08, i));
      this.phase('brick-break-assault', at, () => {
        this.impact();
        if (!this.reduceMotion) this.rotateTo(i % 2 ? -0.035 : 0.035, 180);
        this.cue(500, () => this.rotateTo(0, 350));
      });
    });
    this.phase('brick-break-assault', 6800, () => {
      this.cut(A.x, A.y, 1.12); this.label('瓦層破碎！', H * 0.25, 30, 2200);
      this.stops.push(energy.gatherLight(this, A, this.color, ACCENT, 100, -0.6));
    });
    this.phase('brick-break-assault', 9300, () => { this.stopAll(); this.cut(B.x, B.y, 1.05); });
    this.phase('finale', 0, () => {
      this.cut(A.x, A.y, 1); this.label('碎壁掌刃', H * 0.74, 48, 2200);
      this.stops.push(energy.gatherLight(this, A, this.color, ACCENT, 100, -0.6));
      energy.lightOrbit(this, A, this.color, ACCENT, 130, 4500, 1.2);
    });
    this.phase('finale', 2400, () => { closeEye = eyeCatch(this, this.uiMid, { ...this.attacker, color: this.color, shout: '決勝！', y: H * 0.6 }); });
    this.phase('finale', 4200, () => closeEye());
    this.phase('finale', 4600, () => {
      this.stopAll();
      const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55); this.uiBack.add(dim);
      this.cue(500, () => dim.destroy());
    });
    this.phase('finale', 5100, () => {
      this.cut(B.x, B.y, 0.95);
      this.strike({ x: B.x, y: B.y + (this.d.isPlayerAttacking ? 300 : -300) }, B, 1.5, 4);
    });
    this.phase('finale', 6100, () => { this.impact(true); this.flash(); this.zoomTo(1.05, 1800); });
    this.phase('aftermath', 0, () => {
      this.stopAll(); this.cut(B.x, B.y, 1);
      this.tweens.add({ targets: this.defSprite, y: B.y + 20, angle: this.d.isPlayerAttacking ? 16 : -16, alpha: 0.65, duration: 1100 });
      energy.lightOrbit(this, B, this.color, ACCENT, 100, 4800, 0.3, 16);
      this.label('TOTAL DAMAGE', H * 0.23, 18, 5300);
      this.label(`-${this.d.damage}`, H * 0.34, 58, 5300);
    });
    this.phase('aftermath', 1900, () => { this.label('FINISH!', H * 0.66, 48, 3400); this.hits.setAlpha(0); });
    this.phase('aftermath', 4500, () => this.retract());
    this.phase('aftermath', 5600, () => {
      this.cameras.main.fadeOut(this.ms(1200));
      this.tweens.add({ targets: [this.uiBack, this.uiMid], alpha: 0, duration: 1200 });
    });
  }
}
