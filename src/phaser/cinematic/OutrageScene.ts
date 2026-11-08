import Phaser from 'phaser';
import CinematicScene from './CinematicScene';
import { OUTRAGE_TIMELINE } from './outrageTimeline';
import { resolveBattleLayout } from '../BattleScene';
import { addActorSprite, baseScale } from '../actorArt';
import type { ActorSprite } from '../actorArt';
import {
  DESIGN_H as H, DESIGN_W as W, FONT_TC,
  burst, concentrationLines, cutIn, emitter, every, eyeCatch, floatNumber,
  hexToNum, letterbox, ring, screenFlash, slash, stamp, txt,
} from './fx';

/**
 * 逆鱗 / outrage — Codex, re-directed after user review.
 * Reference: PetalDanceScene's layered particles, orbiting depth, hit bursts
 * and camera rhythm. Actors use addActorSprite; attack VFX are procedural
 * light only. No emoji projectile, solid dragon face or badge-shaped scales.
 * Palette: dragon type violet, icy white cores, crimson fury, sparse gold.
 * Three dark storm-temple sets keep the luminous action readable.
 *
 * Shot list / sound direction (silent; no new audio system):
 * intro 5s: two-shot, warning at 400ms, attacker push at 2600 (low alarm).
 * cutin 8s: directional portrait; at 4350 stamped OUTRAGE title (metal hit).
 * charge 11s: rising plasma corona, spiral glints, inward light threads;
 *   7400 eye-catch, 8500 MAX, 10400 contraction (building roar).
 * release 4s: 500 a tapered, white-cored ribbon flows between the two actors;
 *   2300 shockwave and sparks. Stable two-shot, never launch an actor glyph.
 * rampage 16s: a rotating particle vortex surrounds the target; four curved
 *   energy sweeps hit at 2200/5100/10800/13700 (heavy layered strikes);
 *   attacker cut-back 6600–9200, then return to target. Trails persist behind
 *   every strike instead of translating one intact icon across the screen.
 * finale 9s: bright plasma corona; 400 怒龍崩天 / DRAGON RAMPAGE title;
 *   2600 eye-catch #2; 4700 darkness / contraction; 5200 converging light
 *   streams; 5600 radial blast, sparks and expanding pressure rings.
 * aftermath 7s: fading embers, defender tilt, 300 TOTAL DAMAGE, 2000 FINISH,
 *   4600 retract letterbox, 5600 fade; the base finishes at exactly 60s.
 *
 * Budget: three baked backgrounds, <=12 ambient motes/set, <300 particles
 * and pooled light sprites at peak. Ribbon triangles are built once; flow
 * updates reuse images. All timing uses tween clocks, including cleanup.
 */
export const OUTRAGE_SCENE_KEY = 'OutrageScene';

const GOLD = 0xffd778, BLUE = 0x8ecaff, CRIMSON = 0xff587b;
const SET_A = 0, SET_B = 1000, SET_C = 2000;
const A = { x: SET_A + W / 2, y: 390 };
const B = { x: SET_B + W / 2, y: 330 };
const ENEMY_Y = 170, ALLY_Y = 500;
const SOFT = 'outrage-soft', THREAD = 'outrage-thread';

export default class OutrageScene extends CinematicScene {
  protected readonly timeline = OUTRAGE_TIMELINE;
  private color = 0x7038f8;
  private atkSprite!: ActorSprite;
  private defSprite!: ActorSprite;
  private twoAtk!: ActorSprite;
  private twoDef!: ActorSprite;
  private seal!: Phaser.GameObjects.Container;
  private aura!: Phaser.GameObjects.Image;
  private hitText!: Phaser.GameObjects.Text;
  private hits = 0;
  private stops: Array<() => void> = [];
  private retractLetterbox: () => void = () => {};

  constructor() { super(OUTRAGE_SCENE_KEY); }

  protected build() {
    this.color = hexToNum(this.d.typeColor);
    this.hits = 0; this.stops = [];
    this.makeLightTextures();
    this.backdrop(SET_A, '#080b1c', '#030610');
    this.backdrop(SET_B, '#070c1d', '#03040b');
    this.backdrop(SET_C, '#0b1028', '#030710');
    this.aura = this.add.image(A.x, A.y, SOFT).setTint(this.color)
      .setScale(4).setAlpha(0.2).setBlendMode(Phaser.BlendModes.ADD);
    this.seal = this.plasmaCorona(A.x, A.y - 10).setAlpha(0.2).setScale(0.8);
    this.atkSprite = addActorSprite(this, A.x, A.y, this.attacker, 128, { resolution: 2 }).setDepth(2);
    this.defSprite = addActorSprite(this, B.x, B.y, this.defender, 112, { resolution: 2 }).setDepth(2);
    this.namePlate(A.x, A.y + 105, this.attacker.name);
    this.namePlate(B.x, B.y + 100, this.defender.name);
    const cx = SET_C + W / 2;
    const enemy = addActorSprite(this, cx, ENEMY_Y, this.d.enemy, 72, { resolution: 2 });
    const ally = addActorSprite(this, cx, ALLY_Y, this.d.ally, 72, { resolution: 2 });
    this.namePlate(cx, ENEMY_Y + 65, `敵方｜${this.d.enemy.name}`);
    this.namePlate(cx, ALLY_Y + 65, `我方｜${this.d.ally.name}`);
    this.twoAtk = this.d.isPlayerAttacking ? ally : enemy;
    this.twoDef = this.d.isPlayerAttacking ? enemy : ally;
    for (const ox of [SET_A, SET_B, SET_C]) {
      emitter(this, ox + W / 2, H + 20, THREAD, {
        x: { min: -W / 2, max: W / 2 }, speedY: { min: -65, max: -35 },
        speedX: { min: -12, max: 12 }, lifespan: 4200, frequency: 420,
        scaleX: { start: 0.24, end: 0.06 }, scaleY: 0.3, alpha: { start: 0.6, end: 0 },
        rotate: { min: -30, max: 30 }, tint: [this.color, GOLD, BLUE], blendMode: 'ADD',
      });
    }
    this.hitText = txt(this, W - 20, 88, '', {
      fontSize: '26px', color: '#ffd778', stroke: '#160b2b', strokeThickness: 5,
    }).setOrigin(1, 0.5).setAlpha(0);
    this.uiMid.add(this.hitText);
  }

  /** Smooth falloff textures, generated locally without loading external art. */
  private makeLightTextures() {
    for (const [key, w, h] of [[SOFT, 128, 128], [THREAD, 128, 32]] as const) {
      if (this.textures.exists(key)) continue;
      const texture = this.textures.createCanvas(key, w, h), ctx = texture?.getContext();
      if (!ctx) continue;
      const pixels = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const nx = (x + 0.5 - w / 2) / (w / 2), ny = (y + 0.5 - h / 2) / (h / 2);
        const a = key === SOFT
          ? Math.pow(Math.max(0, 1 - Math.hypot(nx, ny)), 2.8)
          : Math.pow(Math.max(0, 1 - Math.abs(nx)), 0.8) * Math.exp(-ny * ny * 11);
        const i = (y * w + x) * 4;
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 255;
        pixels.data[i + 3] = Math.round(255 * a);
      }
      ctx.putImageData(pixels, 0, 0); texture?.refresh();
    }
  }

  /** Thunderclouds, broken pillars and converging temple tiles baked once. */
  private backdrop(ox: number, top: string, bottom: string) {
    const key = `outrage-bg-${ox}`, bw = W + 520, bh = H + 520;
    if (!this.textures.exists(key)) {
      const texture = this.textures.createCanvas(key, bw, bh), ctx = texture?.getContext();
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, bh);
        gradient.addColorStop(0, top); gradient.addColorStop(1, bottom);
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, bw, bh);
        const glow = ctx.createRadialGradient(bw / 2, 450, 10, bw / 2, 450, 390);
        glow.addColorStop(0, '#602fa82c'); glow.addColorStop(1, '#602fa800');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, bw, bh);
        ctx.fillStyle = '#080c20';
        for (let i = 0; i < 10; i++) {
          ctx.beginPath(); ctx.ellipse(i * 105, 185 + Math.sin(i * 3) * 45, 120, 75, 0, 0, Math.PI * 2); ctx.fill();
        }
        for (const x of [285, bw - 317]) {
          ctx.fillStyle = '#0c1123'; ctx.fillRect(x, 250, 32, 570);
          ctx.fillStyle = '#303950'; ctx.fillRect(x - 7, 260, 46, 12);
          ctx.fillStyle = '#6584b033'; ctx.fillRect(x + 5, 275, 3, 520);
          ctx.strokeStyle = '#080b20'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(x + 28, 400); ctx.lineTo(x + 8, 430); ctx.lineTo(x + 24, 470); ctx.stroke();
        }
        ctx.strokeStyle = '#8bbdff20'; ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          ctx.beginPath(); ctx.moveTo(bw / 2, 720); ctx.lineTo(i * bw / 11, bh); ctx.stroke();
        }
        for (let i = 0; i < 6; i++) {
          const y = 740 + i * i * 14;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(bw, y); ctx.stroke();
        }
        ctx.strokeStyle = '#a6cfff5a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(580, 235); ctx.lineTo(555, 282); ctx.lineTo(573, 278); ctx.lineTo(545, 326); ctx.stroke();
        texture?.refresh();
      }
    }
    this.add.image(ox - 260, -260, key).setOrigin(0).setDepth(-10);
  }

  private namePlate(x: number, y: number, name: string) {
    txt(this, x, y, name, { fontFamily: FONT_TC, fontSize: '14px', color: '#e4ddff',
      backgroundColor: '#090b21cc', padding: { x: 8, y: 4 } });
  }

  /** Broken plasma arcs and lens-like glow; no ring of opaque scale icons. */
  private plasmaCorona(x: number, y: number) {
    const corona = this.add.container(x, y).setDepth(1);
    corona.add(this.add.image(0, 0, SOFT).setTint(this.color).setScale(3.3).setAlpha(0.5)
      .setBlendMode(Phaser.BlendModes.ADD));
    const arcs = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    for (let i = 0; i < 5; i++) {
      const start = i * Math.PI * 0.4;
      for (const [width, alpha] of [[14, 0.035], [6, 0.1], [1.2, 0.85]]) {
        arcs.lineStyle(width, i % 2 ? BLUE : this.color, alpha);
        arcs.beginPath(); arcs.arc(0, 0, 96 + i % 2 * 12, start, start + 0.76); arcs.strokePath();
      }
    }
    corona.add(arcs);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const glint = this.add.image(Math.cos(a) * 102, Math.sin(a) * 102, THREAD)
        .setTint(i % 3 ? this.color : CRIMSON).setRotation(a + Math.PI / 2)
        .setDisplaySize(34 + i % 3 * 9, 6).setAlpha(0.65).setBlendMode(Phaser.BlendModes.ADD);
      corona.add(glint);
    }
    this.tweens.add({ targets: arcs, angle: this.reduceMotion ? 20 : 360, duration: 12500, repeat: -1 });
    return corona;
  }

  /** Inward light streams; the shared converge helper intentionally uses petals. */
  private gatherFury(x: number, y: number, intense = false) {
    return every(this, intense ? 110 : 150, () => {
      for (let i = 0; i < 2; i++) {
        const a = Phaser.Math.FloatBetween(0, Math.PI * 2), r = Phaser.Math.Between(145, 220);
        const mote = this.add.image(x + Math.cos(a) * r, y + Math.sin(a) * r, THREAD)
          .setTint(i ? BLUE : this.color).setRotation(a).setDisplaySize(40, 6)
          .setAlpha(0).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: mote, x, y, alpha: { from: 0.9, to: 0.1 },
          displayWidth: 5, duration: intense ? 650 : 950, ease: 'Cubic.easeIn', onComplete: () => mote.destroy() });
      }
    });
  }

  /** Curved, tapered energy volume with a flowing particle core and residual haze. */
  private rush(x1: number, y1: number, x2: number, y2: number, size: number, life = 1600) {
    const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length, ny = dx / length, bend = 70 * size;
    const curve = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(x1, y1),
      new Phaser.Math.Vector2(x1 + dx * 0.3 + nx * bend, y1 + dy * 0.3 + ny * bend),
      new Phaser.Math.Vector2(x1 + dx * 0.7 - nx * bend, y1 + dy * 0.7 - ny * bend),
      new Phaser.Math.Vector2(x2, y2),
    );
    const volume = this.add.graphics().setDepth(3).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    const points = curve.getPoints(64);
    for (const [factor, color, alpha] of [[2.4, this.color, 0.025], [1.4, this.color, 0.08],
      [0.7, this.color, 0.26], [0.25, BLUE, 0.6], [0.065, 0xffffff, 0.95]]) {
      volume.fillStyle(color, alpha);
      for (let i = 0; i < points.length - 1; i++) {
        const p = points[i], q = points[i + 1];
        const tangent = curve.getTangent(i / 64), next = curve.getTangent((i + 1) / 64);
        const w1 = Math.pow(Math.sin(Math.PI * i / 64), 0.8) * 28 * size * factor;
        const w2 = Math.pow(Math.sin(Math.PI * (i + 1) / 64), 0.8) * 28 * size * factor;
        const ax = p.x - tangent.y * w1, ay = p.y + tangent.x * w1;
        const bx = p.x + tangent.y * w1, by = p.y - tangent.x * w1;
        const cx = q.x - next.y * w2, cy = q.y + next.x * w2;
        const ex = q.x + next.y * w2, ey = q.y - next.x * w2;
        volume.fillTriangle(ax, ay, bx, by, cx, cy); volume.fillTriangle(bx, by, ex, ey, cx, cy);
      }
    }
    const motes = Array.from({ length: 36 }, (_, i) => this.add.image(x1, y1, i % 5 ? THREAD : SOFT)
      .setTint(i % 4 ? BLUE : 0xffffff).setDepth(4).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD));
    this.tweens.add({ targets: volume, alpha: 1, duration: 160 });
    this.tweens.add({ targets: volume, alpha: 0, duration: 550, delay: life - 500, onComplete: () => volume.destroy() });
    this.tweens.addCounter({ from: 0, to: 1, duration: life, onUpdate: tw => {
      const progress = tw.getValue() ?? 0;
      motes.forEach((mote, i) => {
        const u = (i / motes.length + progress * 1.5) % 1;
        const p = curve.getPoint(u), tangent = curve.getTangent(u);
        const jitter = Math.sin(i * 9 + progress * 12) * 12 * size;
        mote.setPosition(p.x - tangent.y * jitter, p.y + tangent.x * jitter)
          .setRotation(Math.atan2(tangent.y, tangent.x))
          .setDisplaySize(i % 5 ? 22 + size * 14 : 32 * size, i % 5 ? 3 : 32 * size)
          .setAlpha(Math.sin(Math.PI * u) * Math.min(1, progress * 8, (1 - progress) * 5) * 0.9);
      });
    }, onComplete: () => motes.forEach(mote => mote.destroy()) });
  }

  /** Reused light sprites orbit at different depths, like Petal Dance's vortex. */
  private vortex(x: number, y: number, duration: number, radius = 112) {
    const motes = Array.from({ length: 32 }, (_, i) => this.add.image(x, y, i % 4 ? THREAD : SOFT)
      .setTint(i % 5 ? this.color : BLUE).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD));
    this.tweens.addCounter({ from: 0, to: 1, duration, onUpdate: tw => {
      const p = tw.getValue() ?? 0, fade = Math.min(1, p * 10, (1 - p) * 8);
      motes.forEach((mote, i) => {
        const a = i * 2.399 + p * (this.reduceMotion ? 0.7 : 7), z = Math.sin(a);
        const r = radius * (0.75 + i % 5 * 0.07);
        mote.setPosition(x + Math.cos(a) * r, y + z * r * 0.5 - 15)
          .setDepth(z > 0 ? 4 : 1).setRotation(a + Math.PI / 2)
          .setDisplaySize(i % 4 ? 26 + i % 3 * 12 : 38, i % 4 ? 4 : 38)
          .setAlpha(fade * (0.3 + (z + 1) * 0.25));
      });
    }, onComplete: () => motes.forEach(mote => mote.destroy()) });
  }

  private impact(final = false) {
    this.hits += final ? 8 : 3;
    this.hitText.setText(`${this.hits} HIT!`).setAlpha(1); stamp(this, this.hitText, 0, 1.5);
    for (let i = 0; i < (final ? 3 : 2); i++) {
      slash(this, B.x, B.y, -35 + i * 60, i % 2 ? GOLD : this.color, i * 100, final ? 470 : 280);
      ring(this, B.x, B.y, i % 2 ? GOLD : this.color, 12, final ? 300 : 140, 800, 4, i * 120);
    }
    burst(this, B.x, B.y, THREAD, final ? 45 : 26, {
      speed: { min: 90, max: final ? 410 : 250 }, lifespan: 1200,
      scaleX: { start: 0.5, end: 0.06 }, scaleY: { start: 0.18, end: 0 }, rotate: { min: 0, max: 360 },
      tint: [this.color, GOLD, BLUE], alpha: { start: 1, end: 0 }, blendMode: 'ADD',
    });
    this.tweens.add({ targets: this.defSprite, x: B.x + 13, duration: 65, yoyo: true, repeat: final ? 5 : 3 });
    this.shake(final ? 850 : 300, final ? 0.028 : 0.012);
    floatNumber(this, B.x + 65, B.y - 80, `${Math.max(1, Math.round(this.d.damage * (final ? 0.4 : 0.15)))}`, '#ffd778', 23);
  }

  private flash(color = GOLD, peak = 0.7, out = 400) {
    screenFlash(this, this.uiTop, color, this.reduceMotion ? 180 : 70, 60, out,
      this.reduceMotion ? Math.min(peak, 0.12) : peak);
  }

  private stopAll() { this.stops.forEach(stop => stop()); this.stops = []; }

  protected direct() {
    this.directIntro(); this.directCutIn(); this.directCharge(); this.directRelease();
    this.directRampage(); this.directFinale(); this.directAftermath();
  }

  private directIntro() {
    const cx = SET_C + W / 2;
    this.phase('intro', 0, () => {
      this.cut(cx, H / 2, 1); this.cameras.main.fadeIn(this.ms(700));
      this.retractLetterbox = letterbox(this, this.uiTop);
    });
    this.phase('intro', 400, () => {
      const band = this.add.container(0, H / 2);
      band.add(this.add.rectangle(W / 2, 0, W + 30, 68, 0x170e2b, 0.96).setStrokeStyle(2, GOLD));
      const stripes = this.add.graphics().fillStyle(GOLD, 0.8);
      for (let x = -30; x < W + 30; x += 26) {
        stripes.fillTriangle(x, -33, x + 16, -33, x - 8, -24);
        stripes.fillTriangle(x, 33, x + 16, 33, x + 36, 24);
      }
      band.add([stripes, txt(this, W / 2, 0, 'ATTACK / OUTRAGE', { fontSize: '23px', color: '#ffd778' })]);
      this.uiMid.add(band);
      this.tweens.add({ targets: band, scaleY: { from: 0, to: 1 }, duration: 250 });
      this.tweens.add({ targets: band, alpha: 0, duration: 250, delay: 1800, onComplete: () => band.destroy() });
    });
    this.phase('intro', 2600, () => {
      this.pan(cx, this.twoAtk.y, 1800); this.zoomTo(1.5, 1800);
      const label = txt(this, W / 2, H - 90, '逆鱗甦醒・龍怒將臨', { fontFamily: FONT_TC, fontSize: '22px', color: '#e4ddff' });
      this.uiMid.add(label);
      this.tweens.add({ targets: label, alpha: 0, duration: 250, delay: 1700, onComplete: () => label.destroy() });
    });
    this.phase('intro', 4550, () => this.flash(GOLD, 0.4, 220));
  }

  private directCutIn() {
    let close = () => {};
    this.phase('cutin', 0, () => {
      this.cut(A.x, A.y - 40, 1);
      close = cutIn(this, this.uiMid, { ...this.attacker, color: this.color,
        fromLeft: this.d.isPlayerAttacking, y: H * 0.44,
        lines: ['「逆鱗已醒！」', '「無人能擋！」', '「逆鱗！」'] });
    });
    this.phase('cutin', 4100, () => close());
    this.phase('cutin', 4350, () => {
      const card = this.add.container(0, H * 0.45);
      card.add(this.add.rectangle(W / 2, 0, W + 30, 164, 0x110a24, 0.94).setStrokeStyle(2, GOLD));
      this.d.moveName.split('').forEach((ch, i) => {
        const title = txt(this, W / 2 + (i - 0.5) * 96, -8, ch, { fontFamily: FONT_TC,
          fontSize: '84px', fontStyle: 'bold', stroke: this.d.typeColor, strokeThickness: 8 });
        card.add(title); stamp(this, title, 120 + i * 300, 2.5);
      });
      card.add(txt(this, W / 2, 57, '─  O U T R A G E  ─', { fontSize: '15px', color: '#ffd778' }));
      card.add(txt(this, W / 2, -111, '龍屬性・逆鱗解放', { fontFamily: FONT_TC, fontSize: '20px', color: '#e4ddff' }));
      this.uiMid.add(card);
      this.tweens.add({ targets: card, alpha: 0, duration: 300, delay: 3000, onComplete: () => card.destroy() });
    });
  }

  private directCharge() {
    let gauge: Phaser.GameObjects.Container;
    let closeEye = () => {};
    this.phase('charge', 0, () => {
      this.cut(A.x, A.y - 30, 1.05); this.zoomTo(1.28, 10000);
      this.tweens.add({ targets: this.seal, alpha: 0.95, scale: 1.25, duration: 9300 });
      this.tweens.add({ targets: this.aura, alpha: 0.65, scale: 7, duration: 9300 });
      this.tweens.add({ targets: this.atkSprite, y: A.y - 12, duration: 1200, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' });
      gauge = this.add.container(0, H - 94);
      const fill = this.add.rectangle(61, 0, 238, 10, this.color).setOrigin(0, 0.5).setScale(0, 1);
      const frame = this.add.rectangle(W / 2, 0, 242, 14).setStrokeStyle(1.5, GOLD);
      const label = txt(this, W / 2, -25, '龍怒蓄積 / FURY', { fontFamily: FONT_TC, fontSize: '18px', color: '#e4ddff' });
      const pct = txt(this, W / 2, 25, '0%', { fontFamily: FONT_TC, fontSize: '18px', color: '#ffd778' });
      gauge.add([frame, fill, label, pct]); this.uiMid.add(gauge);
      this.tweens.addCounter({ from: 0, to: 100, duration: 8500, ease: 'Sine.easeIn',
        onUpdate: tw => { const n = tw.getValue() ?? 0; fill.setScale(n / 100, 1); pct.setText(`${Math.floor(n)}%`); },
        onComplete: () => { fill.setFillStyle(CRIMSON); pct.setText('MAX / 逆鱗解鎖'); } });
    });
    this.phase('charge', 1600, () => {
      this.stops.push(this.gatherFury(A.x, A.y));
      this.vortex(A.x, A.y, 8800, 118);
      this.stops.push(concentrationLines(this, this.uiBack, W / 2, H * 0.53,
        { color: this.color, alpha: this.reduceMotion ? 0.08 : 0.24, count: 24 }));
      this.stops.push(every(this, 1350, () => ring(this, A.x, A.y, GOLD, 170, 60, 1100, 2)));
    });
    this.phase('charge', 7400, () => {
      closeEye = eyeCatch(this, this.uiMid, { ...this.attacker, color: this.color, shout: '覺醒！', y: H * 0.25 });
    });
    this.phase('charge', 9500, () => {
      closeEye(); this.tweens.add({ targets: gauge, alpha: 0, duration: 300, delay: 500, onComplete: () => gauge.destroy() });
    });
    this.phase('charge', 10400, () => {
      this.stopAll(); this.tweens.add({ targets: this.seal, scale: 0.45, duration: 450, ease: 'Cubic.easeIn' });
      this.flash(this.color, 0.55, 300);
    });
  }

  private directRelease() {
    const cx = SET_C + W / 2;
    this.phase('release', 0, () => {
      this.cut(cx, H / 2, 1); this.seal.setAlpha(0); this.aura.setAlpha(0.15);
      ring(this, cx, this.twoAtk.y, GOLD, 12, 125, 650, 5);
    });
    this.phase('release', 500, () => {
      const layout = resolveBattleLayout(this.d.isPlayerAttacking, ENEMY_Y, ALLY_Y);
      this.rush(cx, layout.attackerY, cx, layout.defenderY, 0.9, 2300);
      this.tweens.add({ targets: this.twoAtk, scale: baseScale(this.twoAtk) * 1.18, duration: 300, yoyo: true });
    });
    this.phase('release', 2300, () => {
      ring(this, cx, this.twoDef.y, this.color, 10, 120, 850, 5); this.shake(400, 0.01);
      burst(this, cx, this.twoDef.y, THREAD, 35, { speed: { min: 80, max: 210 }, lifespan: 1000,
        scale: { start: 0.5, end: 0 }, tint: [this.color, GOLD, BLUE], rotate: { min: 0, max: 360 } });
    });
  }

  private directRampage() {
    this.phase('rampage', 0, () => { this.cut(B.x, B.y, 1.1); this.vortex(B.x, B.y, 6400); });
    [2200, 5100, 10800, 13700].forEach((at, i) => {
      this.phase('rampage', at - 1150, () => {
        const side = i % 2 ? -1 : 1;
        this.rush(B.x - side * 290, B.y + 150, B.x + side * 75, B.y - 30, 1.05 + i * 0.12, 1900);
      });
      this.phase('rampage', at, () => {
        this.impact();
        if (!this.reduceMotion) this.rotateTo(i % 2 ? -0.04 : 0.04, 180);
        this.cue(550, () => this.rotateTo(0, 400));
      });
    });
    this.phase('rampage', 6600, () => {
      this.cut(A.x, A.y - 35, 1.2); this.seal.setAlpha(0.9).setScale(1.1);
      this.stops.push(this.gatherFury(A.x, A.y, true));
      const shout = txt(this, W / 2, H * 0.2, '怒氣，還在沸騰！', { fontFamily: FONT_TC,
        fontSize: '30px', stroke: '#160b2b', strokeThickness: 6, fontStyle: 'bold' });
      this.uiMid.add(shout); stamp(this, shout, 0, 1.5);
      this.tweens.add({ targets: shout, alpha: 0, duration: 250, delay: 2200, onComplete: () => shout.destroy() });
    });
    this.phase('rampage', 9200, () => { this.stopAll(); this.cut(B.x, B.y, 1.1); this.vortex(B.x, B.y, 6400, 130); });
  }

  private directFinale() {
    let closeEye = () => {};
    this.phase('finale', 0, () => {
      this.cut(A.x, A.y - 30, 1); this.seal.setAlpha(1).setScale(1.05);
      this.tweens.add({ targets: this.seal, scale: 1.65, duration: 4300, ease: 'Sine.easeIn' });
      this.stops.push(this.gatherFury(A.x, A.y, true));
      this.vortex(A.x, A.y, 4800, 145);
    });
    this.phase('finale', 400, () => {
      const title = this.add.container(0, H * 0.75);
      title.add(this.add.rectangle(W / 2, 0, W + 30, 100, 0x110a24, 0.92));
      const name = txt(this, W / 2, -12, '怒龍崩天', { fontFamily: FONT_TC, fontSize: '52px',
        color: '#fff1cc', fontStyle: 'bold', stroke: this.d.typeColor, strokeThickness: 7 });
      title.add([name, txt(this, W / 2, 35, '─ DRAGON RAMPAGE ─', { fontSize: '14px', color: '#ffd778' })]);
      this.uiMid.add(title); stamp(this, name, 0, 2);
      this.tweens.add({ targets: title, alpha: 0, duration: 250, delay: 2000, onComplete: () => title.destroy() });
    });
    this.phase('finale', 2600, () => {
      closeEye = eyeCatch(this, this.uiMid, { ...this.attacker, color: this.color, shout: '崩天！', y: H * 0.62 });
    });
    this.phase('finale', 4300, () => closeEye());
    this.phase('finale', 4700, () => {
      this.stopAll(); this.tweens.add({ targets: this.seal, scale: 0.35, duration: 450, ease: 'Cubic.easeIn' });
      const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65); this.uiBack.add(dim);
      this.cue(500, () => dim.destroy());
    });
    this.phase('finale', 5200, () => {
      this.cut(B.x, B.y, 0.95); this.seal.setAlpha(0);
      const dir = this.d.isPlayerAttacking ? -1 : 1;
      for (let i = 0; i < 3; i++) {
        this.rush(B.x + (i - 1) * 135, B.y - dir * 380, B.x + (i - 1) * 18, B.y + dir * 70, 1.3, 2200);
      }
    });
    this.phase('finale', 5600, () => {
      this.impact(true); this.flash(0xffffff, 0.9, 750); this.zoomTo(1.1, 1800);
      const cracks = this.add.graphics().setDepth(1).lineStyle(3, GOLD, 0.85);
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        cracks.beginPath(); cracks.moveTo(B.x, B.y);
        cracks.lineTo(B.x + Math.cos(a) * 90, B.y + Math.sin(a) * 75);
        cracks.lineTo(B.x + Math.cos(a + 0.18) * 280, B.y + Math.sin(a + 0.18) * 240); cracks.strokePath();
      }
      this.tweens.add({ targets: cracks, alpha: 0, duration: 2300, delay: 500, onComplete: () => cracks.destroy() });
    });
  }

  private directAftermath() {
    this.phase('aftermath', 0, () => {
      this.stopAll(); this.cut(B.x, B.y - 10, 1);
      this.tweens.add({ targets: this.defSprite, y: B.y + 22, angle: this.d.isPlayerAttacking ? 18 : -18,
        alpha: 0.65, duration: 1200, ease: 'Sine.easeOut' });
      const embers = emitter(this, B.x, -20, THREAD, {
        x: { min: -150, max: 150 }, speedY: { min: 30, max: 65 }, lifespan: 2500, frequency: 170,
        scaleX: { start: 0.15, end: 0.03 }, scaleY: 0.16, rotate: { min: -40, max: 40 },
        tint: [this.color, GOLD, BLUE], alpha: { start: 0.7, end: 0 }, blendMode: 'ADD',
      });
      this.stops.push(() => embers.stop());
    });
    this.phase('aftermath', 300, () => {
      const label = txt(this, W / 2, H * 0.26, 'TOTAL DAMAGE', { fontSize: '16px', color: '#e4ddff' });
      const damage = txt(this, W / 2, H * 0.34, `-${this.d.damage}`, { fontSize: '64px', color: '#ffd778',
        stroke: this.d.typeColor, strokeThickness: 7 });
      this.uiMid.add([label, damage]); stamp(this, damage, 0, 2.3);
    });
    this.phase('aftermath', 2000, () => {
      const finish = txt(this, W / 2, H * 0.65, 'FINISH!', { fontSize: '50px', color: '#ffd778',
        stroke: '#170d30', strokeThickness: 7, fontStyle: 'italic' });
      this.uiMid.add(finish); stamp(this, finish, 0, 2.3);
      this.tweens.add({ targets: this.hitText, alpha: 0, duration: 400, delay: 600 });
    });
    this.phase('aftermath', 4600, () => this.retractLetterbox());
    this.phase('aftermath', 5600, () => {
      this.stopAll(); this.cameras.main.fadeOut(this.ms(1300));
      this.tweens.add({ targets: [this.uiBack, this.uiMid], alpha: 0, duration: 1300 });
    });
  }
}
