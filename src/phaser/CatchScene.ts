import Phaser from 'phaser';
import type { BallType } from '../types';

/* ────────────────────────────────────────────────────────────────────
 *  CatchScene — Phaser 3 scene for the catch animation
 *
 *  Flow: throw ball → absorb monster → zoom in → shake 1-3× → result
 *  Uses native setTimeout for timing (Phaser 3.90.0 timing bug workaround)
 *  ──────────────────────────────────────────────────────────────────── */

export interface CatchSceneData {
  ballType: BallType;
  monsterEmoji: string;
  monsterName: string;
  success: boolean;
  shakeCount: number; // 1-3
  onComplete: () => void;
}

const BALL_CONFIG: Record<BallType, { emoji: string; color: number; colorStr: string }> = {
  poke:   { emoji: '⚪', color: 0xef4444, colorStr: '#EF4444' },
  great:  { emoji: '🔵', color: 0x3b82f6, colorStr: '#3B82F6' },
  ultra:  { emoji: '🟡', color: 0xfbbf24, colorStr: '#FBBF24' },
  master: { emoji: '🟣', color: 0x8b5cf6, colorStr: '#8B5CF6' },
};

/* ── Module-level data hand-off ── */
let _pendingData: CatchSceneData | null = null;

export function setCatchSceneData(data: CatchSceneData) {
  _pendingData = data;
}

const at = (ms: number, fn: () => void) => setTimeout(fn, ms);

export default class CatchScene extends Phaser.Scene {
  private d!: CatchSceneData;
  private W = 0;
  private H = 0;

  constructor() {
    super({ key: 'CatchScene' });
  }

  create() {
    if (_pendingData) this.d = _pendingData;

    this.W = Number(this.game.config.width);
    this.H = Number(this.game.config.height);

    const cx = this.W / 2;
    const cy = this.H / 2;
    const bc = BALL_CONFIG[this.d.ballType];

    this.cameras.main.setBackgroundColor(0x0a0a14);

    /* ── Textures ── */
    this.makeCircleTexture('particle', 0xffffff, 4);
    this.makeCircleTexture('ballParticle', bc.color, 5);
    this.makeCircleTexture('sparkTex', 0xffd700, 3);

    /* ── Monster emoji ── */
    const monster = this.add.text(cx, cy - 40, this.d.monsterEmoji, {
      fontSize: '64px',
    }).setOrigin(0.5).setAlpha(1);

    /* Monster name */
    const nameText = this.add.text(cx, cy + 10, this.d.monsterName, {
      fontSize: '14px',
      fontFamily: '"Russo One", sans-serif',
      color: '#e2e8f0',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0.8);

    /* ── Ball ── */
    const ballContainer = this.add.container(cx, this.H + 40);
    const ballCircle = this.add.graphics();
    this.drawBall(ballCircle, bc.color);
    const ballEmoji = this.add.text(0, 0, bc.emoji, {
      fontSize: '24px',
    }).setOrigin(0.5);
    ballContainer.add([ballCircle, ballEmoji]);

    /* ── Status text ── */
    const statusText = this.add.text(cx, this.H - 25, '投擲中...', {
      fontSize: '13px',
      fontFamily: '"Russo One", sans-serif',
      color: '#94a3b8',
    }).setOrigin(0.5);

    /* ── Ground shadow under ball's landing spot ── */
    const shadow = this.add.ellipse(cx, cy + 28, 50, 12, 0x000000, 0.3)
      .setAlpha(0);

    /* ═══════════════════════════════════════════════
     *  Stage 1: THROW  (0ms → 700ms)
     *  Ball arcs up from bottom to center
     * ═══════════════════════════════════════════════ */
    this.tweens.add({
      targets: ballContainer,
      x: cx,
      y: cy,
      duration: 600,
      ease: 'Cubic.easeOut',
      onUpdate: (_tw, target) => {
        // Slight rotation during throw
        target.angle = Phaser.Math.Linear(0, -15, _tw.progress);
      },
    });

    // Ball grows during throw
    this.tweens.add({
      targets: ballContainer,
      scaleX: { from: 0.4, to: 1 },
      scaleY: { from: 0.4, to: 1 },
      duration: 600,
      ease: 'Cubic.easeOut',
    });

    /* ═══════════════════════════════════════════════
     *  Stage 2: ABSORB  (700ms → 1400ms)
     *  Monster shrinks and gets sucked into ball
     * ═══════════════════════════════════════════════ */
    at(700, () => {
      statusText.setText('吸入中！');
      statusText.setColor(bc.colorStr);

      // Ball reset rotation
      this.tweens.add({ targets: ballContainer, angle: 0, duration: 200 });

      // Flash the ball
      this.cameras.main.flash(200,
        (bc.color >> 16) & 0xff,
        (bc.color >> 8) & 0xff,
        bc.color & 0xff, true);

      // Monster shrinks toward ball position
      this.tweens.add({
        targets: monster,
        scaleX: 0,
        scaleY: 0,
        y: cy,
        alpha: 0,
        duration: 500,
        ease: 'Back.easeIn',
      });

      // Name fades out
      this.tweens.add({
        targets: nameText,
        alpha: 0,
        duration: 300,
      });

      // Absorption particle burst from monster to ball
      const absorbEmitter = this.add.particles(cx, cy - 40, 'ballParticle', {
        speed: { min: 60, max: 120 },
        angle: { min: 60, max: 120 },
        lifespan: 400,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      });
      absorbEmitter.explode(15);
    });

    /* ═══════════════════════════════════════════════
     *  Stage 3: ZOOM IN  (1400ms → 2000ms)
     *  Camera zooms into the ball, shadow appears
     * ═══════════════════════════════════════════════ */
    at(1400, () => {
      statusText.setText('');

      // Show shadow
      this.tweens.add({ targets: shadow, alpha: 1, duration: 300 });

      // Camera zoom-in on ball
      this.cameras.main.zoomTo(1.8, 600, 'Cubic.easeInOut');
      this.cameras.main.pan(cx, cy, 600, 'Cubic.easeInOut');

      // Ball slight "settle" bounce
      this.tweens.add({
        targets: ballContainer,
        y: cy + 2,
        duration: 150,
        yoyo: true,
        ease: 'Sine.easeOut',
      });
    });

    /* ═══════════════════════════════════════════════
     *  Stage 4: SHAKE  (2000ms → 2000 + shakeCount*800ms)
     *  Ball wobbles left/right, 1-3 times
     * ═══════════════════════════════════════════════ */
    const shakeStartMs = 2000;
    const shakeDuration = 700; // per shake

    for (let i = 0; i < this.d.shakeCount; i++) {
      const startMs = shakeStartMs + i * shakeDuration;

      at(startMs, () => {
        statusText.setText('● '.repeat(i + 1) + '○ '.repeat(this.d.shakeCount - i - 1));
        statusText.setColor('#94a3b8');

        // Camera micro-shake
        this.cameras.main.shake(100, 0.005);

        // Ball wobble animation
        this.tweens.add({
          targets: ballContainer,
          angle: { from: 0, to: 12 },
          duration: 100,
          yoyo: true,
          repeat: 1,
          ease: 'Sine.easeInOut',
          onYoyo: () => {
            this.tweens.add({
              targets: ballContainer,
              angle: -12,
              duration: 100,
              yoyo: true,
              ease: 'Sine.easeInOut',
            });
          },
          onComplete: () => {
            this.tweens.add({
              targets: ballContainer,
              angle: 0,
              duration: 80,
              ease: 'Sine.easeOut',
            });
          },
        });
      });
    }

    /* ═══════════════════════════════════════════════
     *  Stage 5: RESULT
     * ═══════════════════════════════════════════════ */
    const resultMs = shakeStartMs + this.d.shakeCount * shakeDuration + 200;

    at(resultMs, () => {
      statusText.setText('● '.repeat(this.d.shakeCount));

      if (this.d.success) {
        this.showSuccess(ballContainer, cx, cy, bc.color, statusText);
      } else {
        this.showEscape(ballContainer, monster, cx, cy, bc.color, statusText);
      }
    });

    // Final callback
    const endMs = resultMs + 1400;
    at(endMs, () => {
      this.d.onComplete();
    });
  }

  /* ── Success animation ── */
  private showSuccess(
    ball: Phaser.GameObjects.Container,
    cx: number, cy: number,
    color: number,
    statusText: Phaser.GameObjects.Text,
  ) {
    // Camera flash
    this.cameras.main.flash(250,
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff, true);

    // Ball pulse
    this.tweens.add({
      targets: ball,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeOut',
    });

    // Sparkle burst
    const sparkEmitter = this.add.particles(cx, cy, 'sparkTex', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      lifespan: 800,
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      quantity: 25,
    });
    sparkEmitter.explode(25);

    // Stars around ball
    const starEmojis = ['✨', '⭐', '🌟', '✨'];
    starEmojis.forEach((s, i) => {
      const angle = (i / starEmojis.length) * Math.PI * 2;
      const starText = this.add.text(
        cx + Math.cos(angle) * 5,
        cy + Math.sin(angle) * 5,
        s, { fontSize: '20px' },
      ).setOrigin(0.5).setAlpha(0).setScale(0.3);

      this.tweens.add({
        targets: starText,
        x: cx + Math.cos(angle) * 50,
        y: cy + Math.sin(angle) * 50,
        alpha: { from: 0, to: 1 },
        scaleX: 1,
        scaleY: 1,
        duration: 500,
        delay: i * 80,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: starText,
            alpha: 0,
            duration: 300,
          });
        },
      });
    });

    statusText.setText('捕獲成功！🎉');
    statusText.setColor('#22c55e');
    this.tweens.add({
      targets: statusText,
      scaleX: { from: 0.5, to: 1.1 },
      scaleY: { from: 0.5, to: 1.1 },
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: statusText, scaleX: 1, scaleY: 1, duration: 100,
        });
      },
    });
  }

  /* ── Escape animation ── */
  private showEscape(
    ball: Phaser.GameObjects.Container,
    monster: Phaser.GameObjects.Text,
    cx: number, cy: number,
    color: number,
    statusText: Phaser.GameObjects.Text,
  ) {
    // Camera shake on break-out
    this.cameras.main.shake(300, 0.015);

    // Ball opens — split effect: ball flies down and fades
    this.tweens.add({
      targets: ball,
      y: cy + 60,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 400,
      ease: 'Cubic.easeIn',
    });

    // Break-out particles
    const breakEmitter = this.add.particles(cx, cy, 'ballParticle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      lifespan: 500,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      quantity: 15,
      tint: color,
    });
    breakEmitter.explode(15);

    // Monster reappears
    at(200, () => {
      monster.setPosition(cx, cy - 30);
      this.tweens.add({
        targets: monster,
        scaleX: { from: 0, to: 1.2 },
        scaleY: { from: 0, to: 1.2 },
        alpha: { from: 0, to: 1 },
        duration: 350,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: monster,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
          });
        },
      });
    });

    // Escape dash — monster flies away
    at(700, () => {
      this.tweens.add({
        targets: monster,
        x: cx + 120,
        y: cy - 80,
        alpha: 0,
        duration: 350,
        ease: 'Cubic.easeIn',
      });
    });

    statusText.setText('逃跑了！💨');
    statusText.setColor('#ef4444');
    this.tweens.add({
      targets: statusText,
      scaleX: { from: 0.5, to: 1.1 },
      scaleY: { from: 0.5, to: 1.1 },
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: statusText, scaleX: 1, scaleY: 1, duration: 100,
        });
      },
    });
  }

  /* ── Helpers ── */
  private drawBall(gfx: Phaser.GameObjects.Graphics, color: number) {
    // Outer ring
    gfx.fillStyle(color, 0.2);
    gfx.fillCircle(0, 0, 28);
    // Inner fill
    gfx.fillStyle(color, 0.4);
    gfx.fillCircle(0, 0, 22);
    // Border
    gfx.lineStyle(3, color, 0.9);
    gfx.strokeCircle(0, 0, 22);
    // Dividing line
    gfx.lineStyle(2, 0xffffff, 0.4);
    gfx.lineBetween(-22, 0, 22, 0);
    // Center button
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(0, 0, 6);
    gfx.lineStyle(2, color, 0.9);
    gfx.strokeCircle(0, 0, 6);
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
