import Phaser from 'phaser';
import type { BallType } from '../types';

/* ────────────────────────────────────────────────────────────────────
 *  MultiCatchScene — Phaser 3 scene: throw 3 balls at 3 monsters
 *
 *  Shows 3 columns side-by-side. Each column runs the catch sequence:
 *  throw → absorb → shake (1-3×) → result (success / escape)
 *  Uses native setTimeout (Phaser 3.90.0 timing bug workaround)
 *  ──────────────────────────────────────────────────────────────────── */

export interface MultiCatchTarget {
  emoji: string;      // type emoji e.g. 🔥
  name: string;       // display name
  success: boolean;
  shakeCount: number; // 1-3
}

export interface MultiCatchSceneData {
  ballType: BallType;
  targets: MultiCatchTarget[];
  onComplete: () => void;
}

const BALL_CFG: Record<BallType, { emoji: string; color: number; colorStr: string }> = {
  poke:   { emoji: '⚪', color: 0xef4444, colorStr: '#EF4444' },
  great:  { emoji: '🔵', color: 0x3b82f6, colorStr: '#3B82F6' },
  ultra:  { emoji: '🟡', color: 0xfbbf24, colorStr: '#FBBF24' },
  master: { emoji: '🟣', color: 0x8b5cf6, colorStr: '#8B5CF6' },
};

/* ── Module-level data hand-off ── */
let _pendingData: MultiCatchSceneData | null = null;
export function setMultiCatchSceneData(data: MultiCatchSceneData) {
  _pendingData = data;
}

const at = (ms: number, fn: () => void) => setTimeout(fn, ms);

export default class MultiCatchScene extends Phaser.Scene {
  private d!: MultiCatchSceneData;
  private W = 0;
  private H = 0;

  constructor() {
    super({ key: 'MultiCatchScene' });
  }

  create() {
    if (_pendingData) this.d = _pendingData;
    this.W = Number(this.game.config.width);
    this.H = Number(this.game.config.height);

    const bc = BALL_CFG[this.d.ballType];
    const count = this.d.targets.length;
    const colW = this.W / count;

    this.cameras.main.setBackgroundColor(0x0a0a14);

    /* Textures */
    this.makeCircleTexture('particle', 0xffffff, 4);
    this.makeCircleTexture('ballParticle', bc.color, 5);
    this.makeCircleTexture('sparkTex', 0xffd700, 3);

    /* Dividers between columns */
    for (let i = 1; i < count; i++) {
      const x = colW * i;
      const line = this.add.graphics();
      line.lineStyle(1, 0xffffff, 0.08);
      line.lineBetween(x, 20, x, this.H - 20);
    }

    /* Max shake for sync timing */
    const maxShakes = Math.max(...this.d.targets.map(t => t.shakeCount));

    /* Create each column */
    this.d.targets.forEach((target, i) => {
      const cx = colW * i + colW / 2;
      const cy = this.H * 0.38;
      this.createColumn(cx, cy, target, bc, maxShakes, i);
    });

    /* onComplete after all animations finish */
    const shakeStartMs = 1800;
    const shakeDuration = 700;
    const resultMs = shakeStartMs + maxShakes * shakeDuration + 200;
    const endMs = resultMs + 1600;
    at(endMs, () => this.d.onComplete());
  }

  private createColumn(
    cx: number, cy: number,
    target: MultiCatchTarget,
    bc: { emoji: string; color: number; colorStr: string },
    maxShakes: number,
    _idx: number,
  ) {
    /* ── Monster emoji ── */
    const monster = this.add.text(cx, cy - 30, target.emoji, {
      fontSize: '42px',
    }).setOrigin(0.5);

    /* Monster name */
    const nameText = this.add.text(cx, cy + 10, target.name, {
      fontSize: '11px',
      fontFamily: '"Russo One", sans-serif',
      color: '#e2e8f0',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0.8);

    /* ── Ball ── */
    const ballContainer = this.add.container(cx, this.H + 30);
    const ballGfx = this.add.graphics();
    this.drawBall(ballGfx, bc.color, 16);
    const ballEmoji = this.add.text(0, 0, bc.emoji, { fontSize: '16px' }).setOrigin(0.5);
    ballContainer.add([ballGfx, ballEmoji]);

    /* Status text */
    const statusText = this.add.text(cx, this.H - 18, '投擲中...', {
      fontSize: '10px',
      fontFamily: '"Russo One", sans-serif',
      color: '#94a3b8',
    }).setOrigin(0.5);

    /* Shadow */
    const shadow = this.add.ellipse(cx, cy + 22, 36, 9, 0x000000, 0.3).setAlpha(0);

    /* ═══ Stage 1: THROW (0→600ms) ═══ */
    this.tweens.add({
      targets: ballContainer,
      x: cx, y: cy,
      duration: 500,
      ease: 'Cubic.easeOut',
      onUpdate: (_tw: Phaser.Tweens.Tween, obj: Phaser.GameObjects.Container) => {
        obj.angle = Phaser.Math.Linear(0, -12, _tw.progress);
      },
    });
    this.tweens.add({
      targets: ballContainer,
      scaleX: { from: 0.3, to: 1 },
      scaleY: { from: 0.3, to: 1 },
      duration: 500,
      ease: 'Cubic.easeOut',
    });

    /* ═══ Stage 2: ABSORB (600ms→1200ms) ═══ */
    at(600, () => {
      statusText.setText('吸入！');
      statusText.setColor(bc.colorStr);

      this.tweens.add({ targets: ballContainer, angle: 0, duration: 150 });

      this.tweens.add({
        targets: monster,
        scaleX: 0, scaleY: 0, y: cy, alpha: 0,
        duration: 400,
        ease: 'Back.easeIn',
      });
      this.tweens.add({ targets: nameText, alpha: 0, duration: 250 });

      const emitter = this.add.particles(cx, cy - 30, 'ballParticle', {
        speed: { min: 40, max: 80 },
        angle: { min: 60, max: 120 },
        lifespan: 350,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
      emitter.explode(10);
    });

    /* ═══ Stage 3: SETTLE (1200ms→1800ms) ═══ */
    at(1200, () => {
      statusText.setText('');
      this.tweens.add({ targets: shadow, alpha: 1, duration: 250 });
      this.tweens.add({
        targets: ballContainer,
        y: cy + 2,
        duration: 120,
        yoyo: true,
        ease: 'Sine.easeOut',
      });
    });

    /* ═══ Stage 4: SHAKE (1800ms → 1800 + maxShakes*700ms) ═══ */
    const shakeStartMs = 1800;
    const shakeDuration = 700;

    for (let s = 0; s < target.shakeCount; s++) {
      const startMs = shakeStartMs + s * shakeDuration;
      at(startMs, () => {
        statusText.setText('● '.repeat(s + 1) + '○ '.repeat(target.shakeCount - s - 1));
        statusText.setColor('#94a3b8');

        this.tweens.add({
          targets: ballContainer,
          angle: { from: 0, to: 10 },
          duration: 90,
          yoyo: true,
          repeat: 1,
          ease: 'Sine.easeInOut',
          onYoyo: () => {
            this.tweens.add({
              targets: ballContainer, angle: -10, duration: 90,
              yoyo: true, ease: 'Sine.easeInOut',
            });
          },
          onComplete: () => {
            this.tweens.add({
              targets: ballContainer, angle: 0, duration: 60,
              ease: 'Sine.easeOut',
            });
          },
        });
      });
    }

    /* ═══ Stage 5: RESULT ═══ */
    const resultMs = shakeStartMs + maxShakes * shakeDuration + 200;

    at(resultMs, () => {
      statusText.setText('● '.repeat(target.shakeCount));

      if (target.success) {
        this.showSuccess(ballContainer, cx, cy, statusText);
      } else {
        this.showEscape(ballContainer, monster, cx, cy, bc.color, statusText);
      }
    });
  }

  /* ── Success ── */
  private showSuccess(
    ball: Phaser.GameObjects.Container,
    cx: number, cy: number,
    statusText: Phaser.GameObjects.Text,
  ) {
    this.tweens.add({
      targets: ball,
      scaleX: 1.25, scaleY: 1.25,
      duration: 180,
      yoyo: true,
      ease: 'Sine.easeOut',
    });

    const sparkEmitter = this.add.particles(cx, cy, 'sparkTex', {
      speed: { min: 50, max: 140 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    sparkEmitter.explode(15);

    const stars = ['✨', '⭐', '🌟'];
    stars.forEach((s, i) => {
      const angle = (i / stars.length) * Math.PI * 2;
      const star = this.add.text(
        cx + Math.cos(angle) * 4,
        cy + Math.sin(angle) * 4,
        s, { fontSize: '14px' },
      ).setOrigin(0.5).setAlpha(0).setScale(0.2);

      this.tweens.add({
        targets: star,
        x: cx + Math.cos(angle) * 35,
        y: cy + Math.sin(angle) * 35,
        alpha: { from: 0, to: 1 },
        scaleX: 1, scaleY: 1,
        duration: 400,
        delay: i * 60,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({ targets: star, alpha: 0, duration: 250 });
        },
      });
    });

    statusText.setText('捕獲！🎉');
    statusText.setColor('#22c55e');
    statusText.setFontSize(12);
    this.tweens.add({
      targets: statusText,
      scaleX: { from: 0.4, to: 1.1 },
      scaleY: { from: 0.4, to: 1.1 },
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: statusText, scaleX: 1, scaleY: 1, duration: 80 });
      },
    });
  }

  /* ── Escape ── */
  private showEscape(
    ball: Phaser.GameObjects.Container,
    monster: Phaser.GameObjects.Text,
    cx: number, cy: number,
    color: number,
    statusText: Phaser.GameObjects.Text,
  ) {
    this.tweens.add({
      targets: ball,
      y: cy + 40, alpha: 0, scaleX: 0.3, scaleY: 0.3,
      duration: 350,
      ease: 'Cubic.easeIn',
    });

    const breakEmitter = this.add.particles(cx, cy, 'ballParticle', {
      speed: { min: 60, max: 140 },
      angle: { min: 0, max: 360 },
      lifespan: 400,
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      tint: color,
    });
    breakEmitter.explode(10);

    at(180, () => {
      monster.setPosition(cx, cy - 20);
      this.tweens.add({
        targets: monster,
        scaleX: { from: 0, to: 1.15 },
        scaleY: { from: 0, to: 1.15 },
        alpha: { from: 0, to: 1 },
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({ targets: monster, scaleX: 1, scaleY: 1, duration: 120 });
        },
      });
    });

    at(550, () => {
      this.tweens.add({
        targets: monster,
        x: cx + 60, y: cy - 50, alpha: 0,
        duration: 300,
        ease: 'Cubic.easeIn',
      });
    });

    statusText.setText('逃跑💨');
    statusText.setColor('#ef4444');
    statusText.setFontSize(12);
    this.tweens.add({
      targets: statusText,
      scaleX: { from: 0.4, to: 1.1 },
      scaleY: { from: 0.4, to: 1.1 },
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: statusText, scaleX: 1, scaleY: 1, duration: 80 });
      },
    });
  }

  /* ── Helpers ── */
  private drawBall(gfx: Phaser.GameObjects.Graphics, color: number, r: number) {
    gfx.fillStyle(color, 0.2);
    gfx.fillCircle(0, 0, r + 4);
    gfx.fillStyle(color, 0.4);
    gfx.fillCircle(0, 0, r);
    gfx.lineStyle(2, color, 0.9);
    gfx.strokeCircle(0, 0, r);
    gfx.lineStyle(1.5, 0xffffff, 0.4);
    gfx.lineBetween(-r, 0, r, 0);
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(0, 0, 4);
    gfx.lineStyle(1.5, color, 0.9);
    gfx.strokeCircle(0, 0, 4);
  }

  private makeCircleTexture(key: string, color: number, radius: number) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillCircle(radius, radius, radius);
    g.generateTexture(key, radius * 2, radius * 2);
    g.destroy();
  }
}
