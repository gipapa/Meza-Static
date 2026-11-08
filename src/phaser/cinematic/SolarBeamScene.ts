import Phaser from 'phaser';
import CinematicScene from './CinematicScene';
import { SOLAR_BEAM_TIMELINE } from './solarBeamTimeline';
import { resolveBattleLayout } from '../BattleScene';
import { addActorSprite, baseScale } from '../actorArt';
import type { ActorSprite } from '../actorArt';
import {
  DESIGN_H as H, DESIGN_W as W, FONT_TC, TEX,
  burst, concentrationLines, converge, cutIn, emitter, every, eyeCatch, floatNumber,
  hexToNum, letterbox, ring, screenFlash, stamp, txt,
} from './fx';

/**
 * Design brief — 日光束 / solar-beam, grass (#22C55E), default user: 妙蛙花 #003.
 * Motif: canopy sunbeams → photosynthetic motes → a gold-cored green laser.
 * Accents: pale green, warm gold, white. No petal storm or flower finisher.
 * Sets: A = dawn canopy / charging attacker, B = shadowed forest clearing /
 * target, C = sunlit forest corridor / enemy above ally, independent of who fires.
 * Cut-in: 「日光啊，匯聚於此！」「日光束！」; subtitle SOLAR BEAM.
 * Finisher: 日輪貫星 / SOLAR BREAKER. Cinematic SFX remain silent.
 *
 * Shot list / cue sheet (phase-relative ms; suggested sound only):
 * intro 5s: 0 two-shot + letterbox; 400 ATTACK band (warning chime);
 *   2600 push toward attacker (wind through leaves).
 * cutin 8s: 0 directional portrait + 3 dialogue lines; 4100 close portrait;
 *   4350 stamped title (three metallic chimes), held until 7650.
 * charge 11s: 0 stable attacker close-up, solar lens + converging motes;
 *   1200 sun shafts / charge gauge (ascending harmonic); 7500 eye-catch #1;
 *   9500 MAX; 10500 lens contraction / soft white transition.
 * release 4s: 0 stable two-shot; 550 growing beam from attacker toward target
 *   (low laser swell), 2200 impact ring. Never reverse or flip actor artwork.
 * solar-barrage 16s: 0 target close-up; hits at 2000/5000/10800/13500
 *   (four beam pulses); 6800 attacker cut-back held 2400ms, 9200 back to target;
 *   optical rings, HIT count, floating damage, small dutch angles.
 * finale 9s: 0 attacker + giant solar lens; 500 finisher title; 2600
 *   eye-catch #2; 4700 contract/dim for 500ms; 5200 target cut; 5600 maximum
 *   beam piercing + white impact (bass strike), no camera cut for final 3800ms.
 * aftermath 7s: 0 fading light/dust + defender tilt; 300 TOTAL DAMAGE;
 *   2000 FINISH; 4600 retract bars; 5600 fade. Base finishes exactly at 60s.
 *
 * Budget: 3 baked backdrop textures, <=12 ambient motes per set, <250 live
 * particles/motes at peak. Optical geometry is built once, then tweened;
 * no per-frame Graphics creation, asynchronous loads, or wall-clock timers.
 */
export const SOLAR_BEAM_SCENE_KEY = 'SolarBeamScene';

const GOLD = 0xffe7a0;
const TINTS = [0xd9ffab, GOLD, 0xffffff, 0x86efac] as const;
const SET_A = 0, SET_B = 1000, SET_C = 2000;
const A = { x: SET_A + W / 2, y: 400 };
const B = { x: SET_B + W / 2, y: 330 };
const ORB_Y = A.y - 94;
const ENEMY_Y = 170, ALLY_Y = 500;

export default class SolarBeamScene extends CinematicScene {
  protected readonly timeline = SOLAR_BEAM_TIMELINE;
  private color = 0x22c55e;
  private atkSprite!: ActorSprite;
  private defSprite!: ActorSprite;
  private twoAtk!: ActorSprite;
  private twoDef!: ActorSprite;
  private orb!: Phaser.GameObjects.Container;
  private aura!: Phaser.GameObjects.Image;
  private hitText!: Phaser.GameObjects.Text;
  private hits = 0;
  private stops: Array<() => void> = [];
  private retractLetterbox: () => void = () => {};

  constructor() { super(SOLAR_BEAM_SCENE_KEY); }

  protected build() {
    this.color = hexToNum(this.d.typeColor);
    this.hits = 0;
    this.stops = [];
    this.backdrop(SET_A, '#214d38', '#071b18', true);
    this.backdrop(SET_B, '#102b2b', '#030d12', false);
    this.backdrop(SET_C, '#36583a', '#0a1c1c', true);
    this.aura = this.add.image(A.x, A.y, TEX.glow).setTint(this.color)
      .setScale(4).setAlpha(0.2).setBlendMode(Phaser.BlendModes.ADD);
    this.add.ellipse(A.x, A.y + 72, 230, 40, 0x020b09, 0.65);
    this.atkSprite = addActorSprite(this, A.x, A.y, this.attacker, 128, { resolution: 2 });
    this.defSprite = addActorSprite(this, B.x, B.y, this.defender, 112, { resolution: 2 }).setDepth(1);
    this.namePlate(A.x, A.y + 108, this.attacker.name, this.d.isPlayerAttacking ? '我方' : '敵方');
    this.namePlate(B.x, B.y + 102, this.defender.name, this.d.isPlayerAttacking ? '敵方' : '我方');
    const cx = SET_C + W / 2;
    const enemy = addActorSprite(this, cx, ENEMY_Y, this.d.enemy, 72, { resolution: 2 });
    const ally = addActorSprite(this, cx, ALLY_Y, this.d.ally, 72, { resolution: 2 });
    this.namePlate(cx, ENEMY_Y + 64, this.d.enemy.name, '敵方');
    this.namePlate(cx, ALLY_Y + 64, this.d.ally.name, '我方');
    this.twoAtk = this.d.isPlayerAttacking ? ally : enemy;
    this.twoDef = this.d.isPlayerAttacking ? enemy : ally;
    this.orb = this.solarLens(A.x, ORB_Y).setScale(0.12).setAlpha(0);
    for (const ox of [SET_A, SET_B, SET_C]) {
      emitter(this, ox + W / 2, H + 15, TEX.dot, {
        x: { min: -W / 2, max: W / 2 }, speedY: { min: -48, max: -22 },
        speedX: { min: -12, max: 12 }, lifespan: 4400, frequency: 400,
        scale: { start: 0.45, end: 0 }, alpha: { start: 0.7, end: 0 },
        tint: [...TINTS], blendMode: 'ADD',
      });
    }
    this.hitText = txt(this, W - 22, 86, '', {
      fontSize: '26px', color: '#ffe7a0', stroke: '#153e26', strokeThickness: 5, fontStyle: 'italic',
    }).setOrigin(1, 0.5).setAlpha(0);
    this.uiMid.add(this.hitText);
  }

  /** One baked quad: dawn sun, canopy silhouettes, god rays and forest floor. */
  private backdrop(ox: number, top: string, bottom: string, sunlit: boolean) {
    const key = `solar-bg-${ox}`;
    const bw = W + 520, bh = H + 520;
    if (!this.textures.exists(key)) {
      const texture = this.textures.createCanvas(key, bw, bh);
      const ctx = texture?.getContext();
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, bh);
        gradient.addColorStop(0, top);
        gradient.addColorStop(1, bottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, bw, bh);
        const sx = bw * 0.54, sy = 290;
        const light = ctx.createRadialGradient(sx, sy, 8, sx, sy, 340);
        light.addColorStop(0, sunlit ? '#fff4bbaa' : '#9feab822');
        light.addColorStop(1, '#efffb000');
        ctx.fillStyle = light;
        ctx.fillRect(0, 0, bw, bh);
        if (sunlit) {
          ctx.fillStyle = '#fff4ba';
          ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff1b414';
          for (let i = 0; i < 7; i++) {
            ctx.beginPath(); ctx.moveTo(sx - 20 + i * 9, sy);
            ctx.lineTo(70 + i * 120, bh); ctx.lineTo(145 + i * 120, bh); ctx.fill();
          }
        }
        // Tree trunks and branches framing a clear corridor in the design viewport.
        ctx.fillStyle = '#061b16';
        for (const x of [170, 215, bw - 200, bw - 160]) {
          ctx.fillRect(x, 180, 17, bh);
          for (let i = 0; i < 5; i++) {
            ctx.beginPath(); ctx.ellipse(x + (i % 2 ? 32 : -25), 250 + i * 85, 70, 35, i * 0.2, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.fillStyle = '#08271d';
        for (let i = 0; i < 18; i++) {
          const x = (i / 17) * bw;
          ctx.beginPath(); ctx.ellipse(x, 205 + Math.sin(i) * 20, 64, 42, i, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = '#c6f6a81c'; ctx.lineWidth = 1;
        for (let i = 0; i < 14; i++) {
          ctx.beginPath(); ctx.moveTo(bw / 2, 650); ctx.lineTo(i * bw / 13, bh); ctx.stroke();
        }
        texture?.refresh();
      }
    }
    this.add.image(ox - 260, -260, key).setOrigin(0).setDepth(-10);
  }

  private namePlate(x: number, y: number, name: string, side: string) {
    txt(this, x, y, `${side}｜${name}`, {
      fontFamily: FONT_TC, fontSize: '14px', color: '#e6ffcb',
      backgroundColor: '#04120ccc', padding: { x: 8, y: 4 },
    });
  }

  /** Solar aperture: fixed geometry; rotation/expansion are handled by tweens. */
  private solarLens(x: number, y: number) {
    const lens = this.add.container(x, y).setDepth(3);
    const glow = this.add.image(0, 0, TEX.glow).setTint(this.color).setScale(3.4)
      .setAlpha(0.8).setBlendMode(Phaser.BlendModes.ADD);
    const crown = this.add.graphics();
    crown.lineStyle(2, GOLD, 0.9); crown.strokeCircle(0, 0, 48);
    crown.lineStyle(1.5, this.color, 1); crown.strokeCircle(0, 0, 62);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      crown.lineBetween(Math.cos(a) * 66, Math.sin(a) * 66, Math.cos(a) * 80, Math.sin(a) * 80);
    }
    const core = this.add.image(0, 0, TEX.glow).setTint(GOLD).setScale(1.3)
      .setBlendMode(Phaser.BlendModes.ADD);
    const white = this.add.circle(0, 0, 10, 0xffffe5, 0.95);
    lens.add([glow, crown, core, white]);
    this.tweens.add({ targets: crown, angle: 360, duration: this.reduceMotion ? 20000 : 10000, repeat: -1 });
    return lens;
  }

  /** A layered laser grows from its source; its orientation follows source → target. */
  private beam(x1: number, y1: number, x2: number, y2: number, width: number, life: number) {
    const length = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    const beam = this.add.container(x1, y1).setRotation(Math.atan2(y2 - y1, x2 - x1)).setDepth(2);
    for (const [factor, tint, alpha] of [[1.8, this.color, 0.22], [1, this.color, 0.8], [0.5, GOLD, 0.95], [0.16, 0xffffff, 1]]) {
      beam.add(this.add.image(length / 2, 0, TEX.streak).setDisplaySize(length, width * factor)
        .setTint(tint).setAlpha(alpha).setBlendMode(Phaser.BlendModes.ADD));
    }
    beam.setScale(0, 0.5);
    this.tweens.add({ targets: beam, scaleX: 1, scaleY: 1, duration: 320, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: beam, scaleY: 0.83, duration: 180, delay: 320, yoyo: true, repeat: -1 });
    this.cue(life - 300, () => {
      this.tweens.killTweensOf(beam);
      this.tweens.add({ targets: beam, alpha: 0, scaleY: 0.1, duration: 280, onComplete: () => beam.destroy() });
    });
    return beam;
  }

  private impact(power = 1) {
    this.hits += power === 1 ? 4 : 12;
    this.hitText.setText(`${this.hits} HIT!`).setAlpha(1);
    stamp(this, this.hitText, 0, 1.5);
    ring(this, B.x, B.y, GOLD, 12, 150 * power, 650, 4);
    burst(this, B.x, B.y, TEX.spark, Math.round(24 * power), {
      speed: { min: 90, max: 330 }, lifespan: 850,
      scale: { start: 0.55, end: 0 }, tint: [...TINTS], blendMode: 'ADD',
    });
    this.tweens.add({ targets: this.defSprite, x: B.x + 10, duration: 65, yoyo: true, repeat: 3 });
    this.shake(300, 0.012 * power);
    floatNumber(this, B.x + 64, B.y - 76, `${Math.max(1, Math.round(this.d.damage * 0.12 * power))}`, '#ffe7a0', 22);
  }

  private flash(color = 0xffffff, peak = 0.85, outMs = 450) {
    screenFlash(this, this.uiTop, color, this.reduceMotion ? 180 : 70, 60, outMs,
      this.reduceMotion ? Math.min(peak, 0.12) : peak);
  }

  private stopAll() { this.stops.forEach(stop => stop()); this.stops = []; }

  protected direct() {
    this.directIntro(); this.directCutIn(); this.directCharge(); this.directRelease();
    this.directBarrage(); this.directFinale(); this.directAftermath();
  }

  private directIntro() {
    const cx = SET_C + W / 2;
    this.phase('intro', 0, () => {
      this.cut(cx, H / 2, 1);
      this.cameras.main.fadeIn(this.ms(700));
      this.retractLetterbox = letterbox(this, this.uiTop);
    });
    this.phase('intro', 400, () => {
      const band = this.add.container(0, H / 2);
      const bg = this.add.rectangle(W / 2, 0, W + 40, 62, 0x102d20, 0.96).setStrokeStyle(2, GOLD);
      const stripes = this.add.graphics().fillStyle(GOLD, 0.8);
      for (let x = -30; x < W + 30; x += 28) {
        stripes.fillTriangle(x, -30, x + 16, -30, x - 8, -22);
        stripes.fillTriangle(x, 30, x + 16, 30, x + 36, 22);
      }
      const label = txt(this, W / 2, 0, 'ATTACK / SOLAR', { fontSize: '24px', color: '#fff3b0' });
      band.add([bg, stripes, label]); this.uiMid.add(band);
      this.tweens.add({ targets: band, scaleY: { from: 0, to: 1 }, duration: 250 });
      this.tweens.add({ targets: band, alpha: 0, duration: 250, delay: 1800, onComplete: () => band.destroy() });
    });
    this.phase('intro', 2600, () => {
      this.pan(cx, this.twoAtk.y, 1800); this.zoomTo(1.5, 1800);
      const label = txt(this, W / 2, H - 90, '日輪甦醒・光能匯聚', { fontFamily: FONT_TC, fontSize: '21px', color: '#e9ffc1' });
      this.uiMid.add(label);
      this.tweens.add({ targets: label, alpha: 0, duration: 250, delay: 1700, onComplete: () => label.destroy() });
    });
    this.phase('intro', 4550, () => this.flash(GOLD, 0.45, 220));
  }

  private directCutIn() {
    let close = () => {};
    this.phase('cutin', 0, () => {
      this.cut(A.x, A.y - 60, 1);
      close = cutIn(this, this.uiMid, {
        ...this.attacker, color: this.color, fromLeft: this.d.isPlayerAttacking,
        lines: ['「日光啊，', '　匯聚於此！」', '「日光束！」'], y: H * 0.44,
      });
    });
    this.phase('cutin', 4100, () => close());
    this.phase('cutin', 4350, () => {
      const card = this.add.container(0, H * 0.45);
      card.add(this.add.rectangle(W / 2, 0, W + 30, 160, 0x06140c, 0.92).setStrokeStyle(2, GOLD));
      const chars = this.d.moveName.split('');
      const step = Math.min(86, (W - 50) / chars.length);
      chars.forEach((char, i) => {
        const title = txt(this, W / 2 + (i - (chars.length - 1) / 2) * step, -10, char, {
          fontFamily: FONT_TC, fontSize: '72px', fontStyle: 'bold', stroke: this.d.typeColor, strokeThickness: 8,
        });
        card.add(title); stamp(this, title, 150 + i * 260, 2.8);
      });
      card.add(txt(this, W / 2, 53, '─  S O L A R   B E A M  ─', { fontSize: '13px', color: '#ffe7a0' }));
      card.add(txt(this, W / 2, -112, '草屬性・日光轉換', { fontFamily: FONT_TC, fontSize: '18px', color: '#d9ffab' }));
      this.uiMid.add(card);
      this.tweens.add({ targets: card, alpha: 0, duration: 300, delay: 3000, onComplete: () => card.destroy() });
    });
  }

  private directCharge() {
    let gauge: Phaser.GameObjects.Container;
    let closeEye = () => {};
    this.phase('charge', 0, () => {
      this.cut(A.x, A.y - 38, 1.05); this.zoomTo(1.35, 10000);
      this.tweens.add({ targets: this.atkSprite, scale: baseScale(this.atkSprite) * 1.05,
        duration: 900, yoyo: true, repeat: 4, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: this.orb, alpha: 1, scale: 1.05, duration: 9400, ease: 'Sine.easeIn' });
      this.tweens.add({ targets: this.aura, alpha: 0.7, scale: 6, duration: 9400 });
      this.stops.push(converge(this, A.x, ORB_Y, { tints: TINTS, perTick: 2, intervalMs: 85, rMin: 150, rMax: 235 }));
      this.stops.push(every(this, 1250, () => ring(this, A.x, ORB_Y, GOLD, 170, 34, 1100, 2)));
      gauge = this.add.container(0, H - 94);
      const fill = this.add.rectangle(61, 0, 238, 10, this.color).setOrigin(0, 0.5).setScale(0, 1);
      const frame = this.add.rectangle(W / 2, 0, 242, 14).setStrokeStyle(1.5, GOLD);
      const label = txt(this, W / 2, -24, '日光吸收 / SOLAR CHARGE', { fontFamily: FONT_TC, fontSize: '15px', color: '#e9ffc1' });
      const pct = txt(this, W / 2, 24, '0%', { fontSize: '18px', color: '#ffe7a0' });
      gauge.add([frame, fill, label, pct]); this.uiMid.add(gauge);
      this.tweens.addCounter({ from: 0, to: 100, duration: 9200, ease: 'Sine.easeIn',
        onUpdate: tw => { const n = tw.getValue() ?? 0; fill.setScale(n / 100, 1); pct.setText(`${Math.floor(n)}%`); },
        onComplete: () => pct.setText('MAX / 日光充填完畢'),
      });
    });
    this.phase('charge', 1200, () => {
      const sunlight = emitter(this, A.x, 20, TEX.streak, {
        x: { min: -135, max: 135 }, speedY: { min: 130, max: 220 }, lifespan: 1650, frequency: 90,
        rotate: 90, scaleX: { min: 0.35, max: 0.6 }, scaleY: { min: 0.3, max: 0.5 },
        alpha: { start: 0.8, end: 0 }, tint: [GOLD, 0xe7ffb4], blendMode: 'ADD',
      });
      this.stops.push(() => sunlight.stop());
      this.stops.push(concentrationLines(this, this.uiBack, W / 2, H * 0.42, { color: GOLD, alpha: this.reduceMotion ? 0.08 : 0.22, count: 24 }));
    });
    this.phase('charge', 7500, () => {
      closeEye = eyeCatch(this, this.uiMid, { ...this.attacker, color: this.color, shout: '聚光！', y: H * 0.25 });
    });
    this.phase('charge', 9500, () => {
      closeEye();
      this.tweens.add({ targets: gauge, alpha: 0, duration: 300, delay: 500, onComplete: () => gauge.destroy() });
    });
    this.phase('charge', 10500, () => {
      this.stopAll();
      this.tweens.add({ targets: this.orb, scale: 0.45, duration: 350, ease: 'Cubic.easeIn' });
      this.flash(0xffffff, 0.7, 220);
    });
  }

  private directRelease() {
    this.phase('release', 0, () => {
      const cx = SET_C + W / 2;
      this.cut(cx, H / 2, 1);
      this.tweens.add({ targets: this.orb, alpha: 0, duration: 200 });
      this.aura.setAlpha(0.2);
      ring(this, cx, this.twoAtk.y, GOLD, 8, 120, 500, 4);
    });
    this.phase('release', 550, () => {
      const cx = SET_C + W / 2;
      const layout = resolveBattleLayout(this.d.isPlayerAttacking, ENEMY_Y, ALLY_Y);
      this.beam(cx, layout.attackerY + layout.dir * 28, cx, layout.defenderY + layout.dir * 55, 36, 3100);
      this.tweens.add({ targets: this.twoAtk, scale: baseScale(this.twoAtk) * 1.12, duration: 250, yoyo: true });
    });
    this.phase('release', 2200, () => {
      ring(this, this.twoDef.x, this.twoDef.y, GOLD, 12, 105, 700, 4);
      this.shake(400, 0.008);
      burst(this, this.twoDef.x, this.twoDef.y, TEX.spark, 24, {
        speed: { min: 70, max: 210 }, lifespan: 800, tint: [...TINTS], scale: { start: 0.45, end: 0 },
      });
    });
  }

  private directBarrage() {
    const dir = this.d.isPlayerAttacking ? -1 : 1;
    const incomingY = this.d.isPlayerAttacking ? H + 100 : -100;
    const outgoingY = this.d.isPlayerAttacking ? -100 : H + 100;
    this.phase('solar-barrage', 0, () => {
      this.cut(B.x, B.y, 1.1);
      this.beam(B.x, incomingY, B.x, outgoingY, 34, 6400);
      const dust = emitter(this, B.x, B.y, TEX.dot, {
        speedX: { min: -100, max: 100 }, speedY: { min: -75, max: 75 }, lifespan: 900,
        frequency: 70, quantity: 2, scale: { start: 0.55, end: 0 }, tint: [...TINTS], blendMode: 'ADD',
      });
      this.stops.push(() => dust.stop());
    });
    [2000, 5000, 10800, 13500].forEach((at, i) => this.phase('solar-barrage', at, () => {
      this.impact();
      this.beam(B.x, incomingY, B.x, outgoingY, 45 + i * 6, 1700);
      if (!this.reduceMotion) this.rotateTo(i % 2 ? -0.035 : 0.035, 200);
      this.cue(600, () => this.rotateTo(0, 500));
    }));
    this.phase('solar-barrage', 6800, () => {
      this.stopAll(); this.cut(A.x, A.y - 35, 1.2);
      this.orb.setAlpha(1).setScale(0.9);
      this.stops.push(converge(this, A.x, ORB_Y, { tints: TINTS, perTick: 2, intervalMs: 90 }));
      const shout = txt(this, W / 2, H * 0.2, '將日光，化為力量！', {
        fontFamily: FONT_TC, fontSize: '28px', fontStyle: 'bold', stroke: '#042610', strokeThickness: 6,
      });
      this.uiMid.add(shout); stamp(this, shout, 0, 1.7);
      this.cue(2150, () => this.tweens.add({ targets: shout, alpha: 0, duration: 200, onComplete: () => shout.destroy() }));
    });
    this.phase('solar-barrage', 9200, () => {
      this.stopAll(); this.cut(B.x, B.y, 1.1);
      this.beam(B.x, incomingY, B.x, outgoingY, 48, 6200);
      const trail = emitter(this, B.x, B.y + dir * 28, TEX.streak, {
        x: { min: -70, max: 70 }, speedY: dir * 250, lifespan: 800, frequency: 65,
        rotate: 90, scaleX: 0.7, scaleY: 0.6, alpha: { start: 0.8, end: 0 }, tint: [...TINTS], blendMode: 'ADD',
      });
      this.stops.push(() => trail.stop());
    });
    this.phase('solar-barrage', 15500, () => { this.stopAll(); this.rotateTo(0, 300); });
  }

  private directFinale() {
    let closeEye = () => {};
    this.phase('finale', 0, () => {
      this.cut(A.x, A.y - 55, 1);
      this.orb.setAlpha(1).setScale(0.7);
      this.tweens.add({ targets: this.orb, scale: 1.7, duration: 4300, ease: 'Sine.easeIn' });
      this.stops.push(converge(this, A.x, ORB_Y, { tints: TINTS, perTick: 3, intervalMs: 85 }));
    });
    this.phase('finale', 500, () => {
      const title = this.add.container(0, H * 0.75);
      title.add(this.add.rectangle(W / 2, 0, W + 30, 95, 0x05100b, 0.85));
      const name = txt(this, W / 2, -10, '日輪貫星', {
        fontFamily: FONT_TC, fontSize: '52px', fontStyle: 'bold', color: '#fff6ce', stroke: '#23713f', strokeThickness: 7,
      });
      title.add([name, txt(this, W / 2, 34, '─ SOLAR BREAKER ─', { fontSize: '14px', color: '#ffe7a0' })]);
      this.uiMid.add(title); stamp(this, name, 0, 2.1);
      this.tweens.add({ targets: title, alpha: 0, duration: 250, delay: 2000, onComplete: () => title.destroy() });
    });
    this.phase('finale', 2600, () => {
      closeEye = eyeCatch(this, this.uiMid, { ...this.attacker, color: this.color, shout: '貫穿！', y: H * 0.62 });
    });
    this.phase('finale', 4300, () => closeEye());
    this.phase('finale', 4700, () => {
      this.stopAll();
      this.tweens.add({ targets: this.orb, scale: 0.35, duration: 450, ease: 'Cubic.easeIn' });
      const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65);
      this.uiBack.add(dim);
      this.cue(500, () => dim.destroy());
    });
    this.phase('finale', 5200, () => {
      this.cut(B.x, B.y, 0.95);
      this.orb.setAlpha(0);
    });
    this.phase('finale', 5600, () => {
      const incoming = this.d.isPlayerAttacking ? H + 140 : -140;
      const outgoing = this.d.isPlayerAttacking ? -140 : H + 140;
      this.beam(B.x, incoming, B.x, outgoing, 116, 2500);
      this.impact(2);
      this.flash(0xffffff, 0.95, 780);
      this.zoomTo(1.12, 1600);
      for (let i = 0; i < 3; i++) ring(this, B.x, B.y, i % 2 ? this.color : GOLD, 16, 280, 950, 5, i * 150);
      burst(this, B.x, B.y, TEX.glow, 18, {
        speed: { min: 45, max: 140 }, lifespan: 1700, tint: [GOLD, this.color],
        scale: { start: 0.5, end: 1.4 }, alpha: { start: 0.5, end: 0 }, blendMode: 'ADD',
      });
    });
  }

  private directAftermath() {
    this.phase('aftermath', 0, () => {
      this.stopAll(); this.cut(B.x, B.y - 10, 1);
      this.tweens.add({ targets: this.defSprite, y: B.y + 22, angle: this.d.isPlayerAttacking ? 18 : -18,
        alpha: 0.65, duration: 1200, ease: 'Sine.easeOut' });
      const motes = emitter(this, B.x, -20, TEX.spark, {
        x: { min: -150, max: 150 }, speedY: { min: 25, max: 60 }, lifespan: 2500, frequency: 140,
        scale: { start: 0.3, end: 0 }, tint: [...TINTS], alpha: { start: 0.6, end: 0 }, blendMode: 'ADD',
      });
      this.stops.push(() => motes.stop());
    });
    this.phase('aftermath', 300, () => {
      const label = txt(this, W / 2, H * 0.26, 'TOTAL DAMAGE', { fontSize: '16px', color: '#d9ffab' });
      const damage = txt(this, W / 2, H * 0.34, `-${this.d.damage}`, {
        fontSize: '64px', color: '#fff3b0', stroke: '#226b36', strokeThickness: 7,
      });
      this.uiMid.add([label, damage]); stamp(this, damage, 0, 2.4);
    });
    this.phase('aftermath', 2000, () => {
      const finish = txt(this, W / 2, H * 0.65, 'FINISH!', {
        fontSize: '50px', color: '#ffe7a0', stroke: '#123a25', strokeThickness: 7, fontStyle: 'italic',
      });
      this.uiMid.add(finish); stamp(this, finish, 0, 2.5);
      this.tweens.add({ targets: this.hitText, alpha: 0, duration: 400, delay: 600 });
    });
    this.phase('aftermath', 4600, () => this.retractLetterbox());
    this.phase('aftermath', 5600, () => {
      this.stopAll();
      this.cameras.main.fadeOut(this.ms(1300));
      this.tweens.add({ targets: [this.uiBack, this.uiMid], alpha: 0, duration: 1300 });
    });
  }
}
