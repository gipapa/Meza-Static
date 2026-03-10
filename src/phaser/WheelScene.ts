import Phaser from 'phaser';
import type { BallType } from '../types';

/* ────────────────────────────────────────────────────────────────────
 *  WheelScene — Phaser 3 scene for the ball roulette wheel
 *
 *  Features vs old CSS/conic-gradient version:
 *  - Smooth physics-based spin with real deceleration curves
 *  - Particle trail behind the pointer
 *  - Flash + particles on result
 *  - Camera micro-shakes on stop
 *  ──────────────────────────────────────────────────────────────────── */

export interface WheelSceneData {
  onResult: (ball: BallType) => void;
}

interface Segment {
  type: BallType;
  label: string;
  emoji: string;
  degrees: number;
  color: number;
}

const SEGMENTS: Segment[] = [
  { type: 'poke',   label: '精靈球', emoji: '⚪', degrees: 144, color: 0xef4444 },
  { type: 'great',  label: '超級球', emoji: '🔵', degrees: 108, color: 0x3b82f6 },
  { type: 'ultra',  label: '高級球', emoji: '🟡', degrees: 72,  color: 0xfbbf24 },
  { type: 'master', label: '大師球', emoji: '🟣', degrees: 36,  color: 0x7c3aed },
];

function rollBall(): BallType {
  const r = Math.random();
  if (r < 0.40) return 'poke';
  if (r < 0.70) return 'great';
  if (r < 0.90) return 'ultra';
  return 'master';
}

/* ── Module-level data hand-off ── */
let _pendingData: WheelSceneData | null = null;

/** Call this BEFORE creating the Phaser.Game that uses WheelScene. */
export function setWheelSceneData(data: WheelSceneData) {
  _pendingData = data;
}

export default class WheelScene extends Phaser.Scene {
  private data_!: WheelSceneData;
  private W = 0;
  private H = 0;
  private wheelContainer!: Phaser.GameObjects.Container;
  private phase: 'idle' | 'spinning' | 'stopping' | 'done' = 'idle';
  private angularSpeed = 0;
  private targetAngle = 0;
  private currentRotation = 0;
  private resultBall: BallType | null = null;
  private pointerTrail!: Phaser.GameObjects.Particles.ParticleEmitter;
  private statusText!: Phaser.GameObjects.Text;
  private btnText!: Phaser.GameObjects.Text;
  private btnBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'WheelScene' });
  }

  create() {
    if (_pendingData) {
      this.data_ = _pendingData;
    }
    this.W = Number(this.game.config.width);
    this.H = Number(this.game.config.height);
    const cx = this.W / 2;
    const cy = this.H / 2 - 20;
    const radius = Math.min(this.W, this.H) * 0.34;

    this.cameras.main.setBackgroundColor(0x0a0a14);

    /* ── Draw wheel segments ── */
    this.wheelContainer = this.add.container(cx, cy);

    const wheelGfx = this.add.graphics();
    let startAngle = 0;
    for (const seg of SEGMENTS) {
      const startRad = Phaser.Math.DegToRad(startAngle);
      const endRad = Phaser.Math.DegToRad(startAngle + seg.degrees);

      // Filled arc
      wheelGfx.fillStyle(seg.color, 0.85);
      wheelGfx.beginPath();
      wheelGfx.moveTo(0, 0);
      wheelGfx.arc(0, 0, radius, startRad, endRad, false);
      wheelGfx.closePath();
      wheelGfx.fill();

      // Segment border
      wheelGfx.lineStyle(2, 0xffffff, 0.3);
      wheelGfx.beginPath();
      wheelGfx.moveTo(0, 0);
      wheelGfx.lineTo(Math.cos(startRad) * radius, Math.sin(startRad) * radius);
      wheelGfx.stroke();

      // Label position (midpoint of arc)
      const midRad = Phaser.Math.DegToRad(startAngle + seg.degrees / 2);
      const lx = Math.cos(midRad) * radius * 0.6;
      const ly = Math.sin(midRad) * radius * 0.6;

      const emojiText = this.add.text(lx, ly, seg.emoji, { fontSize: '20px' }).setOrigin(0.5);
      const labelText = this.add.text(lx, ly + 18, seg.label, {
        fontSize: '10px', fontFamily: '"Russo One", sans-serif',
        color: '#ffffff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
      this.wheelContainer.add([emojiText, labelText]);

      startAngle += seg.degrees;
    }

    // Outer ring
    wheelGfx.lineStyle(4, 0xffffff, 0.2);
    wheelGfx.strokeCircle(0, 0, radius);

    // Center dot
    wheelGfx.fillStyle(0x1a1a2e, 1);
    wheelGfx.fillCircle(0, 0, 18);
    wheelGfx.lineStyle(2, 0xffffff, 0.3);
    wheelGfx.strokeCircle(0, 0, 18);

    this.wheelContainer.add(wheelGfx);
    // Move graphics behind labels
    this.wheelContainer.sendToBack(wheelGfx);

    /* ── Pointer (triangle above the wheel) ── */
    const pointerGfx = this.add.graphics();
    pointerGfx.fillStyle(0x22d3ee, 1);
    pointerGfx.fillTriangle(cx - 12, cy - radius - 20, cx + 12, cy - radius - 20, cx, cy - radius + 2);
    pointerGfx.lineStyle(2, 0xffffff, 0.5);
    pointerGfx.strokeTriangle(cx - 12, cy - radius - 20, cx + 12, cy - radius - 20, cx, cy - radius + 2);

    // Glow effect on pointer
    const pointerGlow = this.add.graphics();
    pointerGlow.fillStyle(0x22d3ee, 0.3);
    pointerGlow.fillCircle(cx, cy - radius - 8, 15);
    this.tweens.add({
      targets: pointerGlow,
      alpha: { from: 0.3, to: 0.8 },
      yoyo: true,
      repeat: -1,
      duration: 600,
    });

    /* ── Particle texture for trail ── */
    if (!this.textures.exists('wheelParticle')) {
      const pg = this.add.graphics();
      pg.fillStyle(0x22d3ee, 1);
      pg.fillCircle(4, 4, 4);
      pg.generateTexture('wheelParticle', 8, 8);
      pg.destroy();
    }

    /* ── Pointer trail particle (active during spin) ── */
    this.pointerTrail = this.add.particles(cx, cy - radius, 'wheelParticle', {
      speed: { min: 10, max: 40 },
      angle: { min: 80, max: 100 },
      lifespan: 300,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      frequency: 30,
    });

    /* ── Status text ── */
    this.statusText = this.add.text(cx, this.H - 30, '', {
      fontSize: '16px', fontFamily: '"Russo One", sans-serif',
      color: '#e2e8f0', align: 'center',
    }).setOrigin(0.5);

    /* ── Action button ── */
    const btnY = this.H - 65;
    this.btnBg = this.add.graphics();
    this.drawButton(this.btnBg, cx, btnY, '旋轉！', 0x8b5cf6);
    this.btnText = this.add.text(cx, btnY, '旋轉！', {
      fontSize: '16px', fontFamily: '"Russo One", sans-serif', color: '#ffffff',
    }).setOrigin(0.5);

    // Make the entire area clickable
    const hitArea = this.add.rectangle(cx, btnY, 140, 40, 0x000000, 0).setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => this.handleClick());

    // Also make wheel clickable
    const wheelHit = this.add.circle(cx, cy, radius, 0x000000, 0).setInteractive({ useHandCursor: true });
    wheelHit.on('pointerdown', () => this.handleClick());
  }

  update(_time: number, delta: number) {
    if (this.phase === 'spinning') {
      this.currentRotation += this.angularSpeed * (delta / 1000);
      this.wheelContainer.setAngle(this.currentRotation);
    } else if (this.phase === 'stopping') {
      const remaining = this.targetAngle - this.currentRotation;

      if (remaining <= 0.3) {
        // Snap to final target
        this.currentRotation = this.targetAngle;
        this.phase = 'done';
        this.onDone();
      } else {
        // Smoothly decelerate: speed proportional to remaining distance,
        // clamped so it never re-accelerates beyond current speed.
        const proportionalSpeed = remaining * 2.5;
        this.angularSpeed = Math.min(this.angularSpeed, proportionalSpeed);
        this.angularSpeed = Math.max(this.angularSpeed, 8); // minimum creep speed
        this.currentRotation += this.angularSpeed * (delta / 1000);
        // Prevent overshoot
        if (this.currentRotation > this.targetAngle) {
          this.currentRotation = this.targetAngle;
        }
      }
      this.wheelContainer.setAngle(this.currentRotation);
    }
  }

  private handleClick() {
    if (this.phase === 'idle') {
      this.phase = 'spinning';
      this.angularSpeed = 600; // degrees/sec
      this.pointerTrail.start();
      this.btnText.setText('停止！');
      this.drawButton(this.btnBg, this.W / 2, this.H - 65, '', 0x22c55e);
      this.statusText.setText('');
    } else if (this.phase === 'spinning') {
      this.resultBall = rollBall();
      const targetSeg = this.getAngleForBall(this.resultBall);
      // We need pointer (top, -90°) to land on the target segment
      // Wheel rotation is clockwise, so add extra spins
      const extraSpins = 2 * 360;
      const currentMod = ((this.currentRotation % 360) + 360) % 360;
      // Pointer is at -90° relative to wheel's 0, so target on wheel = (360 - targetSeg - 90)
      const targetOnWheel = ((360 - targetSeg + 270) % 360);
      const delta = ((targetOnWheel - currentMod) % 360 + 360) % 360;
      this.targetAngle = this.currentRotation + extraSpins + delta;

      this.phase = 'stopping';
      this.btnText.setText('');
      this.btnBg.clear();
      this.statusText.setText('轉盤減速中...');
      this.tweens.add({
        targets: this.statusText,
        alpha: { from: 0.5, to: 1 },
        yoyo: true,
        repeat: -1,
        duration: 400,
      });
    }
  }

  private getAngleForBall(ball: BallType): number {
    let start = 0;
    for (const seg of SEGMENTS) {
      if (seg.type === ball) {
        // Random position within the segment
        return start + Math.random() * seg.degrees * 0.7 + seg.degrees * 0.15;
      }
      start += seg.degrees;
    }
    return 0;
  }

  private onDone() {
    this.pointerTrail.stop();
    this.tweens.killTweensOf(this.statusText);

    if (!this.resultBall) return;

    const seg = SEGMENTS.find(s => s.type === this.resultBall);
    if (!seg) return;

    // Camera shake on stop
    this.cameras.main.shake(200, 0.01);

    // Flash with segment color
    const r = (seg.color >> 16) & 0xff;
    const g = (seg.color >> 8) & 0xff;
    const b = seg.color & 0xff;
    this.cameras.main.flash(300, r, g, b, true);

    // Celebration particles
    const cx = this.W / 2;
    const cy = this.H / 2 - 20;

    if (!this.textures.exists('celebParticle')) {
      const pg = this.add.graphics();
      pg.fillStyle(seg.color, 1);
      pg.fillCircle(5, 5, 5);
      pg.generateTexture('celebParticle', 10, 10);
      pg.destroy();
    }

    const celebEmitter = this.add.particles(cx, cy, 'celebParticle', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
      quantity: 20,
    });
    celebEmitter.explode(20);

    // Result text
    this.statusText.setText(`${seg.label}！`);
    this.statusText.setColor(`#${seg.color.toString(16).padStart(6, '0')}`);
    this.statusText.setAlpha(1);

    this.tweens.add({
      targets: this.statusText,
      scaleX: { from: 0.5, to: 1.2 },
      scaleY: { from: 0.5, to: 1.2 },
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.statusText,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
        });
      },
    });

    // Delay then callback
    setTimeout(() => {
      this.data_.onResult(this.resultBall!);
    }, 800);
  }

  private drawButton(g: Phaser.GameObjects.Graphics, x: number, y: number, _label: string, color: number) {
    g.clear();
    g.fillStyle(color, 0.85);
    g.fillRoundedRect(x - 65, y - 18, 130, 36, 10);
    g.lineStyle(2, 0xffffff, 0.2);
    g.strokeRoundedRect(x - 65, y - 18, 130, 36, 10);
  }
}
