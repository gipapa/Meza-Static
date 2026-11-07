import Phaser from 'phaser';
import CinematicScene from './CinematicScene';
import { PETAL_DANCE_TIMELINE } from './petalDanceTimeline';
import { resolveBattleLayout } from '../BattleScene';
import {
  DESIGN_H as H, DESIGN_W as W, FONT_TC, TEX,
  burst, concentrationLines, converge, cutIn, emitter, every, eyeCatch, floatNumber,
  hexToNum, letterbox, onFrame, pick, rand, randInt, ring, screenFlash, slash, spin, stamp, txt,
} from './fx';

/* ────────────────────────────────────────────────────────────────────
 *  花瓣舞 (Petal Dance) — advanced cinematic, 60 s.
 *
 *  Shot list (see petalDanceTimeline.ts for exact phase lengths):
 *   intro      two-shot establishing + ATTACK warning band
 *   cutin      pilot cut-in with dialogue → move title card
 *   charge     attacker close-up: converging petals, aura, 集中線, gauge,
 *              eye-catch, white-out
 *   release    petal burst + shockwave → petal river in the two-shot
 *   storm      target close-up: petal storm, orbiting blades, 4 hit waves,
 *              dutch angles, a mid-attack cut back to the attacker
 *   finale     giant flower forms over the target, finisher title,
 *              eye-catch, slam + full-screen impact
 *   aftermath  falling petals, damage reveal, FINISH, fade out
 *  ──────────────────────────────────────────────────────────────────── */

export const PETAL_DANCE_SCENE_KEY = 'PetalDanceScene';

const PETAL_TINTS = [0xffb7d5, 0xff8fc0, 0xffd6e8, 0xff6fae, 0xfff0f6, 0xffa3c8] as const;
const PINK = 0xff6fae;

/** World x offsets of the three sets. */
const SET_A = 0;     // attacker close-up
const SET_B = 1000;  // target close-up
const SET_C = 2000;  // two-shot (enemy top, ally bottom — same as the simple animation)

const A_POS = { x: SET_A + W / 2, y: 400 };
const B_POS = { x: SET_B + W / 2, y: 330 };
const C_ENEMY_Y = 170;
const C_ALLY_Y = 500;

export default class PetalDanceScene extends CinematicScene {
  protected readonly timeline = PETAL_DANCE_TIMELINE;

  private typeColor = PINK;
  private atkSprite!: Phaser.GameObjects.Text;
  private defSprite!: Phaser.GameObjects.Text;
  private twoAtk!: Phaser.GameObjects.Text;
  private twoDef!: Phaser.GameObjects.Text;
  private aura!: Phaser.GameObjects.Image;
  private hitText!: Phaser.GameObjects.Text;
  private hits = 0;
  private stops: Array<() => void> = [];
  private retractLetterbox: () => void = () => {};

  constructor() {
    super(PETAL_DANCE_SCENE_KEY);
  }

  /* ───────────────────────────── sets ───────────────────────────── */

  protected build() {
    this.typeColor = hexToNum(this.d.typeColor);
    this.hits = 0;
    this.stops = [];

    // Set A — attacker close-up: dusk garden.
    this.backdrop(SET_A, 0x0b2a1c, 0x3b0f30, 70);
    this.add.ellipse(A_POS.x, A_POS.y + 70, 260, 50, 0x000000, 0.4);
    this.aura = this.add.image(A_POS.x, A_POS.y, TEX.glow).setTint(this.typeColor).setScale(4)
      .setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
    this.atkSprite = txt(this, A_POS.x, A_POS.y, this.attacker.emoji, { fontSize: '128px' });
    this.namePlate(A_POS.x, A_POS.y + 112, this.attacker.name, this.d.isPlayerAttacking ? '我方' : '敵方');

    // Set B — target close-up: night sky.
    this.backdrop(SET_B, 0x1c0b33, 0x05050f, 90);
    this.add.ellipse(B_POS.x, B_POS.y + 64, 220, 44, 0x000000, 0.45);
    this.defSprite = txt(this, B_POS.x, B_POS.y, this.defender.emoji, { fontSize: '112px' });
    this.namePlate(B_POS.x, B_POS.y + 104, this.defender.name, this.d.isPlayerAttacking ? '敵方' : '我方');

    // Set C — two-shot, positions fixed by side like the simple BattleScene.
    this.backdrop(SET_C, 0x101034, 0x2a0b26, 50);
    const cx = SET_C + W / 2;
    const enemy = txt(this, cx, C_ENEMY_Y, this.d.enemy.emoji, { fontSize: '72px' });
    const ally = txt(this, cx, C_ALLY_Y, this.d.ally.emoji, { fontSize: '72px' });
    this.namePlate(cx, C_ENEMY_Y + 62, this.d.enemy.name, '敵方');
    this.namePlate(cx, C_ALLY_Y + 62, this.d.ally.name, '我方');
    this.twoAtk = this.d.isPlayerAttacking ? ally : enemy;
    this.twoDef = this.d.isPlayerAttacking ? enemy : ally;

    // Ambient drifting petals on every set (cheap: ~20 particles each).
    for (const ox of [SET_A, SET_B, SET_C]) {
      emitter(this, ox + W / 2, -20, TEX.petal, {
        x: { min: -W / 2 - 40, max: W / 2 + 40 }, speedY: { min: 30, max: 70 }, speedX: { min: -30, max: 20 },
        lifespan: 9000, frequency: 420, quantity: 1, scale: { min: 0.35, max: 0.6 },
        alpha: { start: 0.7, end: 0.2 }, tint: [...PETAL_TINTS], rotate: spin(2),
      });
    }

    // Hit counter (screen space, hidden until the storm).
    this.hitText = this.add.text(18, 70, '', {
      fontFamily: '"Russo One", sans-serif', fontSize: '26px', color: '#ffe066', resolution: 2,
      stroke: '#7a1040', strokeThickness: 6, fontStyle: 'italic',
    }).setAlpha(0);
    this.uiMid.add(this.hitText);
  }

  /**
   * Static set background baked once into a canvas texture (gradient + stars),
   * so it costs one quad per frame instead of re-tessellating ~100 shapes.
   */
  private backdrop(ox: number, top: number, bottom: number, stars: number) {
    const key = `petal-bg-${ox}`;
    const bw = W + 520, bh = H + 520;
    if (!this.textures.exists(key)) {
      const tex = this.textures.createCanvas(key, bw, bh);
      const ctx = tex?.getContext();
      if (ctx) {
        const css = (n: number) => '#' + n.toString(16).padStart(6, '0');
        const grad = ctx.createLinearGradient(0, 0, 0, bh);
        grad.addColorStop(0, css(top));
        grad.addColorStop(1, css(bottom));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, bw, bh);
        for (let i = 0; i < stars; i++) {
          ctx.globalAlpha = rand(0.15, 0.7);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(rand(60, bw - 60), rand(60, bh * 0.75), rand(0.4, 1.4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        tex?.refresh();
      }
    }
    this.add.image(ox - 260, -260, key).setOrigin(0).setDepth(-10);
  }

  private namePlate(x: number, y: number, name: string, side: string) {
    const sideColor = side === '我方' ? '#22d3ee' : '#fb7185';
    txt(this, x, y, `${side}｜${name}`, {
      fontFamily: FONT_TC, fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#000000aa', padding: { x: 8, y: 3 }, stroke: sideColor, strokeThickness: 1,
    });
  }

  private hit(n: number) {
    this.hits += n;
    this.hitText.setText(`${this.hits} HIT!`).setAlpha(1).setScale(1.5);
    this.tweens.add({ targets: this.hitText, scale: 1, duration: 140, ease: 'Back.easeOut' });
  }

  private stopAll() {
    this.stops.forEach(s => s());
    this.stops = [];
  }

  /* ──────────────────────────── direction ─────────────────────────── */

  protected direct() {
    this.directIntro();
    this.directCutIn();
    this.directCharge();
    this.directRelease();
    this.directStorm();
    this.directFinale();
    this.directAftermath();
  }

  /** Two-shot establishing shot + warning band. */
  private directIntro() {
    const cx = SET_C + W / 2;
    this.phase('intro', 0, () => {
      this.cut(cx, H / 2, 1.08);
      this.cameras.main.fadeIn(this.ms(800));
      this.retractLetterbox = letterbox(this, this.uiTop);
    });
    this.phase('intro', 400, () => {
      const band = this.add.container(0, H * 0.5);
      const bg = this.add.rectangle(W / 2, 0, W + 40, 64, 0x9f1239, 0.92);
      const stripes = this.add.graphics();
      stripes.fillStyle(0xfacc15, 1);
      for (let x = -80; x < W + 80; x += 28) stripes.fillTriangle(x, -32, x + 14, -32, x - 10, -22);
      for (let x = -80; x < W + 80; x += 28) stripes.fillTriangle(x, 32, x + 14, 32, x + 38, 22);
      const label = txt(this, W + 200, 0, '⚠  ATTACK  ⚠  ATTACK  ⚠', { fontSize: '30px', color: '#fff7d6' });
      band.add([bg, stripes, label]);
      this.uiMid.add(band);
      band.setScale(1, 0);
      this.tweens.add({ targets: band, scaleY: 1, duration: 180, ease: 'Back.easeOut' });
      this.tweens.add({ targets: label, x: -200, duration: 2000, ease: 'Linear' });
      this.tweens.add({ targets: bg, alpha: 0.6, duration: 200, yoyo: true, repeat: 4 });
      this.tweens.add({ targets: band, scaleY: 0, duration: 160, delay: 2000, onComplete: () => band.destroy() });
    });
    this.phase('intro', 2600, () => {
      const vs = txt(this, W / 2, H - 92, `${this.attacker.name}  ▶▶  ${this.defender.name}`, {
        fontFamily: FONT_TC, fontSize: '18px', fontStyle: 'bold', stroke: '#000000', strokeThickness: 5,
      });
      this.uiMid.add(vs);
      this.tweens.add({ targets: vs, x: { from: -W, to: W / 2 }, duration: 350, ease: 'Cubic.easeOut' });
      this.tweens.add({ targets: vs, alpha: 0, duration: 250, delay: 1700, onComplete: () => vs.destroy() });
      this.pan(cx, this.twoAtk.y, 2000);
      this.zoomTo(1.7, 2000);
      this.tweens.add({ targets: this.twoAtk, scale: 1.12, duration: 300, yoyo: true, repeat: 2 });
    });
    this.phase('intro', 4650, () => screenFlash(this, this.uiTop, 0xffffff, 120, 80, 300));
  }

  /** Pilot cut-in with dialogue, then the move title card. */
  private directCutIn() {
    let dim: Phaser.GameObjects.Rectangle;
    let closeCutIn: () => void = () => {};
    let stopConc: () => void = () => {};
    this.phase('cutin', 0, () => {
      this.cut(A_POS.x, A_POS.y - 40, 1);
      dim = this.add.rectangle(W / 2, H / 2, W + 40, H + 40, 0x000000, 0.55);
      this.uiBack.add(dim);
      stopConc = concentrationLines(this, this.uiBack, W / 2, H * 0.45, { alpha: 0.18, inner: 150 });
      closeCutIn = cutIn(this, this.uiMid, {
        emoji: this.attacker.emoji,
        name: this.attacker.name,
        lines: ['「花之舞者，', '　聽我號令——」', '「綻放吧！」'],
        color: this.typeColor,
        fromLeft: this.d.isPlayerAttacking,
        y: H * 0.45,
      });
    });
    this.phase('cutin', 3800, () => closeCutIn());
    this.phase('cutin', 4000, () => {
      screenFlash(this, this.uiTop, this.typeColor, 40, 40, 260, 0.6);
      const card = this.add.container(0, H * 0.42);
      const band = this.add.graphics();
      band.fillStyle(0x000000, 0.85);
      band.fillPoints([
        new Phaser.Math.Vector2(-20, -70), new Phaser.Math.Vector2(W + 20, -95),
        new Phaser.Math.Vector2(W + 20, 75), new Phaser.Math.Vector2(-20, 100),
      ], true);
      band.lineStyle(4, this.typeColor, 1);
      band.lineBetween(-20, -70, W + 20, -95);
      band.lineBetween(-20, 100, W + 20, 75);
      card.add(band);
      const chars = this.d.moveName.split('');
      const step = Math.min(96, (W - 40) / Math.max(1, chars.length));
      chars.forEach((ch, i) => {
        const t = txt(this, W / 2 + (i - (chars.length - 1) / 2) * step, -6, ch, {
          fontFamily: FONT_TC, fontSize: '84px', fontStyle: 'bold', color: '#ffffff',
          stroke: '#' + this.typeColor.toString(16).padStart(6, '0'), strokeThickness: 10,
          shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true, stroke: true },
        });
        card.add(t);
        stamp(this, t, 150 + i * 260, 3.2);
        this.cue(150 + i * 260, () => this.shake(120, 0.01));
      });
      const sub = txt(this, W / 2, 62, `─  P E T A L   D A N C E  ─`, { fontSize: '14px', color: '#ffd6e8' }).setAlpha(0);
      const badge = txt(this, W / 2, -78, `${this.d.typeLabel ?? this.d.moveType}屬性 ★ 威力全開`, {
        fontFamily: FONT_TC, fontSize: '13px', fontStyle: 'bold', color: '#0b0b18',
        backgroundColor: '#' + this.typeColor.toString(16).padStart(6, '0'), padding: { x: 10, y: 3 },
      }).setAlpha(0);
      card.add([sub, badge]);
      this.tweens.add({ targets: [sub, badge], alpha: 1, duration: 300, delay: 150 + chars.length * 260 });
      this.uiMid.add(card);
      this.tweens.add({
        targets: card, scale: 1.25, alpha: 0, duration: 300, delay: 3300, ease: 'Cubic.easeIn',
        onComplete: () => card.destroy(),
      });
      // Sweep of petals across the title.
      burst(this, A_POS.x - 220, A_POS.y - 40, TEX.petal, 40, {
        speedX: { min: 300, max: 600 }, speedY: { min: -80, max: 80 }, lifespan: 1600,
        scale: { min: 0.5, max: 1 }, tint: [...PETAL_TINTS], rotate: spin(8), alpha: { start: 1, end: 0 },
      });
    });
    this.phase('cutin', 7400, () => {
      stopConc();
      this.tweens.add({ targets: dim, alpha: 0, duration: 400, onComplete: () => dim.destroy() });
    });
  }

  /** Attacker close-up: power gathers. */
  private directCharge() {
    let gauge: Phaser.GameObjects.Container;
    let stopConc: () => void = () => {};
    let closeEye: () => void = () => {};
    this.phase('charge', 0, () => {
      this.cut(A_POS.x, A_POS.y, 1);
      this.zoomTo(1.45, 10000);
      this.stops.push(converge(this, A_POS.x, A_POS.y, { tints: PETAL_TINTS }));
      this.tweens.add({ targets: this.aura, scale: 6.5, alpha: 0.75, duration: 10000, ease: 'Sine.easeIn' });
      this.tweens.add({ targets: this.atkSprite, y: A_POS.y - 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      // Contracting rings every 0.9 s.
      this.stops.push(every(this, 900, () => ring(this, A_POS.x, A_POS.y, this.typeColor, 220, 40, 800, 3)));

      // Charge gauge.
      gauge = this.add.container(0, H - 96);
      const label = txt(this, 52, 0, 'CHARGE', { fontSize: '14px', color: '#ffd6e8' });
      const frame = this.add.rectangle(W / 2 + 34, 0, 220, 14).setStrokeStyle(2, 0xffffff, 0.9);
      const fill = this.add.rectangle(W / 2 + 34 - 108, 0, 216, 10, this.typeColor).setOrigin(0, 0.5).setScale(0, 1);
      const pct = txt(this, W / 2 + 34, -18, '0%', { fontSize: '12px' });
      gauge.add([label, frame, fill, pct]);
      this.uiMid.add(gauge);
      this.tweens.add({ targets: gauge, alpha: { from: 0, to: 1 }, duration: 300 });
      this.tweens.addCounter({
        from: 0, to: 100, duration: 9400, ease: 'Sine.easeIn',
        onUpdate: tw => {
          const v = tw.getValue() ?? 0;
          fill.setScale(v / 100, 1);
          pct.setText(`${Math.floor(v)}%`);
        },
        onComplete: () => {
          pct.setText('MAX!!').setColor('#ffe066');
          this.tweens.add({ targets: [pct, fill], alpha: 0.4, duration: 90, yoyo: true, repeat: 6 });
        },
      });
    });
    this.phase('charge', 1500, () => {
      // Petals spiral up from the ground.
      const em = emitter(this, A_POS.x, A_POS.y + 70, TEX.petal, {
        x: { min: -130, max: 130 }, speedY: { min: -260, max: -140 }, speedX: { min: -40, max: 40 },
        lifespan: 2200, frequency: 45, quantity: 2, scale: { min: 0.4, max: 0.9 },
        alpha: { start: 1, end: 0 }, tint: [...PETAL_TINTS], rotate: spin(9), blendMode: 'ADD',
      });
      this.stops.push(() => em.stop());
    });
    this.phase('charge', 3000, () => {
      stopConc = concentrationLines(this, this.uiBack, W / 2, H / 2, { alpha: 0.45, inner: 130 });
    });
    this.phase('charge', 5000, () => this.shake(5000, 0.0025));
    this.phase('charge', 7500, () => {
      closeEye = eyeCatch(this, this.uiMid, {
        emoji: this.attacker.emoji, color: this.typeColor, shout: '喝啊——！', y: H * 0.3,
      });
    });
    this.phase('charge', 9500, () => {
      closeEye();
      this.tweens.add({ targets: gauge, alpha: 0, duration: 300, delay: 600, onComplete: () => gauge.destroy() });
    });
    this.phase('charge', 10500, () => {
      stopConc();
      this.stopAll();
      screenFlash(this, this.uiTop, 0xffffff, 450, 150, 250);
    });
  }

  /** Burst, then the petal river crosses the two-shot. */
  private directRelease() {
    this.phase('release', 0, () => {
      this.cut(A_POS.x, A_POS.y - 20, 1.2);
      this.zoomTo(0.95, 500, 'Cubic.easeOut');
      this.shake(700, 0.02);
      this.tweens.killTweensOf(this.atkSprite);
      this.atkSprite.setY(A_POS.y);
      this.tweens.add({ targets: this.atkSprite, scale: 1.3, duration: 160, yoyo: true, ease: 'Back.easeOut' });
      this.tweens.add({ targets: this.aura, scale: 9, alpha: 0, duration: 900 });
      burst(this, A_POS.x, A_POS.y, TEX.petal, 140, {
        speed: { min: 250, max: 750 }, lifespan: 1700, scale: { min: 0.6, max: 1.3 },
        tint: [...PETAL_TINTS], rotate: spin(10), alpha: { start: 1, end: 0 },
      });
      burst(this, A_POS.x, A_POS.y, TEX.spark, 36, {
        speed: { min: 300, max: 900 }, lifespan: 600, scale: { start: 0.9, end: 0 },
        tint: [0xffffff, 0xfff0a0, this.typeColor], blendMode: 'ADD',
      });
      for (let i = 0; i < 3; i++) ring(this, A_POS.x, A_POS.y, i === 1 ? 0xffffff : this.typeColor, 30, 340, 700, 6 - i, i * 120);
    });
    this.phase('release', 900, () => {
      // Petals launch toward the target (up for ally attacks, down for enemy attacks).
      const angle = this.d.isPlayerAttacking ? -90 : 90;
      const em = emitter(this, A_POS.x, A_POS.y, TEX.petal, {
        angle: { min: angle - 22, max: angle + 22 }, speed: { min: 520, max: 900 }, lifespan: 1300,
        frequency: 28, quantity: 2, scale: { min: 0.5, max: 1.1 }, tint: [...PETAL_TINTS],
        rotate: spin(12), alpha: { start: 1, end: 0.3 },
      });
      this.pan(A_POS.x, A_POS.y + (this.d.isPlayerAttacking ? -160 : 160), 1300, 'Cubic.easeIn');
      this.cue(1300, () => em.stop());
    });
    this.phase('release', 2200, () => {
      // Cut to the two-shot: the river flows from attacker to defender.
      const cx = SET_C + W / 2;
      this.cut(cx, H / 2, 1);
      screenFlash(this, this.uiTop, 0xffffff, 30, 30, 200, 0.7);
      const lay = resolveBattleLayout(this.d.isPlayerAttacking, C_ENEMY_Y, C_ALLY_Y);
      const river = emitter(this, cx, lay.attackerY + lay.dir * 30, TEX.petal, {
        angle: { min: lay.dir * 90 - 10, max: lay.dir * 90 + 10 }, speed: { min: 520, max: 700 },
        lifespan: Math.abs(lay.defenderY - lay.attackerY) / 0.6, x: { min: -24, max: 24 },
        frequency: 20, quantity: 2, scale: { min: 0.5, max: 1 }, tint: [...PETAL_TINTS], rotate: spin(14),
      });
      this.tweens.add({ targets: this.twoDef, x: { from: cx - 4, to: cx + 4 }, duration: 50, yoyo: true, repeat: 12 });
      this.cue(1300, () => river.stop());
    });
  }

  /** Target close-up: the storm. */
  private directStorm() {
    const fromBelow = this.d.isPlayerAttacking; // ally attacks travel upward
    let orbit: Phaser.GameObjects.Image[] = [];
    let orbitR = 150;
    this.phase('storm', 0, () => {
      this.cut(B_POS.x, B_POS.y, 1.2);
      this.zoomTo(1.05, 2500);
      // Incoming petal stream from the attacker's side.
      const em = emitter(this, B_POS.x, fromBelow ? H + 40 : -40, TEX.petal, {
        x: { min: -W / 2, max: W / 2 },
        angle: fromBelow ? { min: -115, max: -65 } : { min: 65, max: 115 },
        speed: { min: 380, max: 640 }, lifespan: 1300, frequency: 30, quantity: 2,
        scale: { min: 0.5, max: 1.1 }, tint: [...PETAL_TINTS], rotate: spin(12), alpha: { start: 1, end: 0.2 },
      });
      this.stops.push(() => em.stop());

      // Orbiting petal blades — a flattened ring with fake depth.
      orbit = Array.from({ length: 34 }, () => this.add.image(B_POS.x, B_POS.y, TEX.petal)
        .setTint(pick(PETAL_TINTS)).setScale(rand(0.8, 1.4)));
      const phases = orbit.map(() => Math.random() * Math.PI * 2);
      let t = 0;
      this.stops.push(onFrame(this, dt => {
        t += dt / 1000;
        orbit.forEach((img, i) => {
          const a = phases[i] + t * (2.4 + (i % 3) * 0.5);
          const r = orbitR * (0.85 + (i % 5) * 0.06);
          const z = Math.sin(a);
          img.setPosition(B_POS.x + Math.cos(a) * r, B_POS.y + 10 + z * r * 0.38);
          img.setDepth(z > 0 ? 2 : -0.5).setAlpha(0.55 + z * 0.45).setAngle(Phaser.Math.RadToDeg(a) + 90);
        });
      }));
      this.defSprite.setDepth(1);
      this.tweens.addCounter({ from: 150, to: 72, duration: 14000, onUpdate: tw => { orbitR = tw.getValue() ?? orbitR; } });
    });

    const wave = (i: number) => {
      const color = pick([0xffffff, PINK, 0xffd6e8]);
      for (let k = 0; k < 3; k++) {
        slash(this, B_POS.x + rand(-30, 30), B_POS.y + rand(-30, 30), rand(-60, 60) + k * 50, color, k * 90);
      }
      burst(this, B_POS.x, B_POS.y, TEX.spark, 22, {
        speed: { min: 200, max: 600 }, lifespan: 500, scale: { start: 0.8, end: 0 },
        tint: [0xffffff, 0xffe066, PINK], blendMode: 'ADD',
      });
      burst(this, B_POS.x, B_POS.y, TEX.petal, 30, {
        speed: { min: 150, max: 450 }, lifespan: 1100, scale: { min: 0.5, max: 1 },
        tint: [...PETAL_TINTS], rotate: spin(10), alpha: { start: 1, end: 0 },
      });
      const kx = (i % 2 === 0 ? 1 : -1) * 18;
      this.tweens.add({ targets: this.defSprite, x: B_POS.x + kx, duration: 70, yoyo: true, repeat: 1 });
      this.defSprite.setTint(0xff7a9a);
      this.tweens.addCounter({ from: 0, to: 1, duration: 220, onComplete: () => this.defSprite.clearTint() });
      this.shake(260, 0.012);
      this.rotateTo((i % 2 === 0 ? 1 : -1) * 0.07, 400);
      this.zoomTo(1.05 + i * 0.06, 300, 'Back.easeOut');
      const per = Math.max(1, Math.round(this.d.damage * 0.06));
      for (let k = 0; k < 4; k++) {
        this.tweens.addCounter({
          from: 0, to: 1, duration: 1, delay: k * 110,
          onComplete: () => {
            floatNumber(this, B_POS.x + rand(-70, 70), B_POS.y + rand(-80, 20), `${per}`, '#ffe066', 16);
            this.hit(randInt(2, 4));
          },
        });
      }
    };
    [2500, 5500, 10200, 13200].forEach((ms, i) => this.phase('storm', ms, () => wave(i)));

    // Mid-attack cut back to the attacker (SRW back-and-forth).
    let closeLines: () => void = () => {};
    this.phase('storm', 7500, () => {
      this.cut(A_POS.x, A_POS.y, 1.25, -0.05);
      this.aura.setScale(5).setAlpha(0.6);
      this.tweens.add({ targets: this.atkSprite, angle: { from: -12, to: 12 }, duration: 260, yoyo: true, repeat: 3 });
      const swirl = emitter(this, A_POS.x, A_POS.y, TEX.petal, {
        emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 90), quantity: 40 },
        speed: { min: 40, max: 120 }, lifespan: 900, frequency: 20, quantity: 2,
        scale: { min: 0.5, max: 1 }, tint: [...PETAL_TINTS], rotate: spin(12), blendMode: 'ADD',
      });
      closeLines = concentrationLines(this, this.uiBack, W / 2, H / 2, { alpha: 0.35 });
      const shout = txt(this, W / 2, H * 0.22, '還沒結束！', {
        fontFamily: FONT_TC, fontSize: '34px', fontStyle: 'bold', stroke: '#000000', strokeThickness: 7,
      }).setAngle(-5);
      this.uiMid.add(shout);
      stamp(this, shout, 0, 2.4);
      this.cue(1700, () => { swirl.stop(); closeLines(); shout.destroy(); });
    });
    this.phase('storm', 9300, () => {
      this.cut(B_POS.x, B_POS.y, 1.15, 0.05);
      screenFlash(this, this.uiTop, PINK, 30, 30, 220, 0.6);
      this.tweens.killTweensOf(this.atkSprite);
      this.atkSprite.setAngle(0);
    });
    this.phase('storm', 15000, () => {
      this.stopAll();
      orbit.forEach(img => this.tweens.add({
        targets: img, x: B_POS.x, y: B_POS.y - 180, alpha: 0, duration: 700, ease: 'Cubic.easeIn',
        onComplete: () => img.destroy(),
      }));
      this.rotateTo(0, 600);
    });
  }

  /** Giant flower forms, finisher name, slam. */
  private directFinale() {
    const fy = B_POS.y - 170;
    let flower: Phaser.GameObjects.Container;
    let closeEye: () => void = () => {};
    this.phase('finale', 0, () => {
      this.cut(B_POS.x, B_POS.y - 70, 1, 0);
      flower = this.add.container(B_POS.x, fy).setDepth(3).setScale(0);
      const core = this.add.image(0, 0, TEX.glow).setTint(0xfff0a0).setScale(2.4).setBlendMode(Phaser.BlendModes.ADD);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        flower.add(this.add.image(Math.cos(a) * 44, Math.sin(a) * 44, TEX.petal)
          .setScale(3.2, 2).setRotation(a).setTint(i % 2 ? 0xff8fc0 : 0xffd6e8).setAlpha(0.95));
      }
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        flower.add(this.add.image(Math.cos(a) * 22, Math.sin(a) * 22, TEX.petal)
          .setScale(1.8, 1.2).setRotation(a).setTint(0xff6fae));
      }
      flower.add(core);
      this.tweens.add({ targets: flower, scale: 1, duration: 1800, ease: 'Back.easeOut' });
      this.tweens.add({ targets: flower, angle: 360, duration: 3200, repeat: -1 });
      this.stops.push(converge(this, B_POS.x, fy, { tints: PETAL_TINTS, rMin: 150, rMax: 230, perTick: 4, intervalMs: 60 }));
    });
    this.phase('finale', 1000, () => {
      const card = this.add.container(0, H * 0.78);
      const name = '千華繚亂'.split('');
      name.forEach((ch, i) => {
        const t = txt(this, W / 2 + (i - 1.5) * 62, 0, ch, {
          fontFamily: FONT_TC, fontSize: '54px', fontStyle: 'bold',
          stroke: '#9d174d', strokeThickness: 8,
          shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, fill: true, stroke: true },
        });
        card.add(t);
        stamp(this, t, i * 180, 2.6);
      });
      const sub = txt(this, W / 2, 44, '─ FINAL BLOOM ─', { fontSize: '14px', color: '#ffe066' });
      card.add(sub);
      this.uiMid.add(card);
      this.tweens.add({ targets: card, alpha: 0, duration: 300, delay: 2000, onComplete: () => card.destroy() });
    });
    this.phase('finale', 2600, () => {
      this.stopAll();
      closeEye = eyeCatch(this, this.uiMid, {
        emoji: this.attacker.emoji, color: this.typeColor, shout: '散華吧！', y: H * 0.62,
      });
    });
    this.phase('finale', 4100, () => closeEye());
    this.phase('finale', 4300, () => {
      this.tweens.add({ targets: flower, scale: 1.7, duration: 800, ease: 'Sine.easeInOut' });
      this.zoomTo(1.3, 800);
      this.shake(800, 0.004);
      ring(this, B_POS.x, fy, 0xffffff, 200, 60, 700, 3);
    });
    this.phase('finale', 5200, () => {
      this.tweens.add({ targets: flower, y: B_POS.y, scale: 1.2, duration: 350, ease: 'Cubic.easeIn' });
      this.pan(B_POS.x, B_POS.y, 350, 'Cubic.easeIn');
    });
    this.phase('finale', 5550, () => {
      flower.destroy();
      screenFlash(this, this.uiTop, 0xffffff, 40, 220, 900);
      this.shake(1000, 0.03);
      this.zoomTo(1.0, 1200, 'Cubic.easeOut');
      burst(this, B_POS.x, B_POS.y, TEX.petal, 160, {
        speed: { min: 200, max: 850 }, lifespan: 2000, scale: { min: 0.6, max: 1.4 },
        tint: [...PETAL_TINTS], rotate: spin(10), alpha: { start: 1, end: 0 },
      });
      burst(this, B_POS.x, B_POS.y, TEX.spark, 50, {
        speed: { min: 300, max: 1000 }, lifespan: 700, scale: { start: 1, end: 0 },
        tint: [0xffffff, 0xffe066, this.typeColor], blendMode: 'ADD',
      });
      burst(this, B_POS.x, B_POS.y, TEX.glow, 14, {
        speed: { min: 40, max: 160 }, lifespan: 1400, scale: { start: 2.5, end: 4 },
        alpha: { start: 0.6, end: 0 }, tint: [0xffd6e8, 0xffffff], blendMode: 'ADD',
      });
      for (let i = 0; i < 4; i++) ring(this, B_POS.x, B_POS.y, i % 2 ? PINK : 0xffffff, 20, 420, 900, 7 - i, i * 110);
      this.hit(30 + randInt(0, 9));
      this.tweens.add({ targets: this.defSprite, x: B_POS.x + 10, duration: 40, yoyo: true, repeat: 10 });
    });
  }

  /** Falling petals, damage reveal, fade out. */
  private directAftermath() {
    this.phase('aftermath', 0, () => {
      this.cut(B_POS.x, B_POS.y - 20, 1.05);
      this.zoomTo(1.15, 6500, 'Sine.easeOut');
      const fall = emitter(this, B_POS.x, -40, TEX.petal, {
        x: { min: -W / 2 - 30, max: W / 2 + 30 }, speedY: { min: 40, max: 110 }, speedX: { min: -40, max: 40 },
        lifespan: 7000, frequency: 40, quantity: 2, scale: { min: 0.4, max: 1 },
        alpha: { start: 1, end: 0.3 }, tint: [...PETAL_TINTS], rotate: spin(3),
      });
      this.stops.push(() => fall.stop());
    });
    this.phase('aftermath', 300, () => {
      this.tweens.add({ targets: this.defSprite, angle: this.d.isPlayerAttacking ? 22 : -22, y: B_POS.y + 18, alpha: 0.75, duration: 900, ease: 'Bounce.easeOut' });
      const dmg = txt(this, W / 2, H * 0.3, `-${this.d.damage}`, {
        fontSize: '64px', color: '#ff4d6d', stroke: '#ffffff', strokeThickness: 6,
        shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true, stroke: true },
      });
      const label = txt(this, W / 2, H * 0.3 - 52, 'TOTAL DAMAGE', { fontSize: '14px', color: '#ffd6e8' });
      this.uiMid.add([dmg, label]);
      stamp(this, dmg, 0, 3);
      stamp(this, label, 200, 1.6);
      this.shake(250, 0.01);
    });
    this.phase('aftermath', 2000, () => {
      const fin = txt(this, W / 2, H * 0.62, 'FINISH!', {
        fontSize: '52px', color: '#ffe066', stroke: '#9d174d', strokeThickness: 8, fontStyle: 'italic',
      }).setAngle(-8);
      this.uiMid.add(fin);
      stamp(this, fin, 0, 3);
      this.tweens.add({ targets: this.hitText, alpha: 0, duration: 400, delay: 1500 });
    });
    this.phase('aftermath', 4600, () => this.retractLetterbox());
    this.phase('aftermath', 5600, () => {
      this.cameras.main.fadeOut(this.ms(1300));
      this.tweens.add({ targets: [this.uiMid, this.uiBack], alpha: 0, duration: 1300 });
      this.stopAll();
    });
  }
}
