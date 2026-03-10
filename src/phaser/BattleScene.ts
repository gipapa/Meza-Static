import Phaser from 'phaser';

/* ────────────────────────────────────────────────────────────────────
 *  BattleScene — Phaser 3 scene that replaces BattleOverlayAnimation
 *
 *  Features vs old CSS version:
 *  - Camera zoom / pan / shake
 *  - Particle emitters with physics (burst, trail, collision feel)
 *  - Type-specific projectile paths
 *  - Damage numbers with physics-based pop
 *  ──────────────────────────────────────────────────────────────────── */

/** Data passed via scene init() */
export interface BattleSceneData {
  isPlayerAttacking: boolean;
  moveType: string;
  moveName: string;
  damage: number;
  attackerName: string;
  defenderName: string;
  attackerEmoji: string;
  defenderEmoji: string;
  typeColor: string; // hex like '#F97316'
  onComplete: () => void;
}

/* ── Type-specific projectile configs ── */

interface ProjConfig {
  speed: number;
  scale: number;
  pathTween?: 'arc' | 'zigzag' | 'wobble' | 'curve-s';
  particleTint: number;
  trailAlpha: number;
  burstCount: number;
}

const TYPE_CONFIG: Record<string, Partial<ProjConfig>> = {
  fire: { speed: 500, particleTint: 0xff6600, burstCount: 30, trailAlpha: 0.6 },
  water: { speed: 480, particleTint: 0x3b82f6, burstCount: 25, trailAlpha: 0.5 },
  grass: { speed: 420, particleTint: 0x22c55e, burstCount: 20, pathTween: 'arc', trailAlpha: 0.4 },
  electric: { speed: 700, particleTint: 0xfbbf24, burstCount: 35, pathTween: 'zigzag', trailAlpha: 0.8 },
  psychic: { speed: 400, particleTint: 0xec4899, burstCount: 25, trailAlpha: 0.6 },
  dark: { speed: 350, particleTint: 0x6b7280, burstCount: 15, trailAlpha: 0.3 },
  dragon: { speed: 500, particleTint: 0x7c3aed, burstCount: 35, trailAlpha: 0.7 },
  fairy: { speed: 400, particleTint: 0xf9a8d4, burstCount: 20, pathTween: 'arc', trailAlpha: 0.5 },
  fighting: { speed: 600, particleTint: 0xdc2626, burstCount: 25, trailAlpha: 0.6 },
  normal: { speed: 450, particleTint: 0xa8a29e, burstCount: 15, trailAlpha: 0.4 },
  ice: { speed: 400, particleTint: 0x67e8f9, burstCount: 20, pathTween: 'wobble', trailAlpha: 0.5 },
  ghost: { speed: 350, particleTint: 0x8b5cf6, burstCount: 20, pathTween: 'curve-s', trailAlpha: 0.4 },
  steel: { speed: 650, particleTint: 0x94a3b8, burstCount: 20, trailAlpha: 0.5 },
  poison: { speed: 400, particleTint: 0xa855f7, burstCount: 25, trailAlpha: 0.5 },
  ground: { speed: 420, particleTint: 0xd97706, burstCount: 25, pathTween: 'arc', trailAlpha: 0.5 },
  flying: { speed: 500, particleTint: 0x93c5fd, burstCount: 20, pathTween: 'arc', trailAlpha: 0.4 },
  bug: { speed: 450, particleTint: 0x84cc16, burstCount: 15, pathTween: 'wobble', trailAlpha: 0.4 },
  rock: { speed: 380, particleTint: 0xa16207, burstCount: 25, pathTween: 'arc', trailAlpha: 0.5 },
};

const DEFAULT_CONFIG: ProjConfig = {
  speed: 450,
  scale: 1,
  particleTint: 0xa78bfa,
  trailAlpha: 0.5,
  burstCount: 20,
};

function getCfg(type: string): ProjConfig {
  return { ...DEFAULT_CONFIG, ...(TYPE_CONFIG[type] || {}) };
}

function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/* ── Module-level data hand-off ── */
let _pendingData: BattleSceneData | null = null;

/** Call this BEFORE creating the Phaser.Game that uses BattleScene. */
export function setBattleSceneData(data: BattleSceneData) {
  _pendingData = data;
}

/* ── Scene ── */

export default class BattleScene extends Phaser.Scene {
  private data_!: BattleSceneData;
  private W = 0;
  private H = 0;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create() {
    if (_pendingData) {
      this.data_ = _pendingData;
    }
    if (!this.data_) return;
    const { isPlayerAttacking, moveType, moveName, damage,
            attackerName, defenderName, attackerEmoji, defenderEmoji,
            typeColor, onComplete } = this.data_;

    this.W = Number(this.game.config.width);
    this.H = Number(this.game.config.height);
    const cx = this.W / 2;

    const cfg = getCfg(moveType);
    const tintInt = hexToInt(typeColor);

    /* ── Background ── */
    this.cameras.main.setBackgroundColor(0x0a0a14);
    // Subtle radial gradient via filled circles
    const bg = this.add.graphics();
    bg.fillStyle(tintInt, 0.06);
    bg.fillCircle(cx, this.H / 2, 200);
    bg.fillStyle(tintInt, 0.03);
    bg.fillCircle(cx, this.H / 2, 350);

    // grid lines for arena feel
    const gridG = this.add.graphics();
    gridG.lineStyle(1, 0xffffff, 0.04);
    for (let y = 0; y < this.H; y += 40) gridG.lineBetween(0, y, this.W, y);
    for (let x = 0; x < this.W; x += 40) gridG.lineBetween(x, 0, x, this.H);

    /* ── Positions ── */
    // enemy always top, ally always bottom
    const enemyY = 80;
    const allyY = this.H - 100;
    const attackerY = isPlayerAttacking ? allyY : enemyY;
    const defenderY = isPlayerAttacking ? enemyY : allyY;

    /* ── Sprites (emoji text objects) ── */
    const atkSprite = this.add.text(cx, attackerY, isPlayerAttacking ? attackerEmoji : defenderEmoji, {
      fontSize: '48px',
    }).setOrigin(0.5);

    const defSprite = this.add.text(cx, defenderY, isPlayerAttacking ? defenderEmoji : attackerEmoji, {
      fontSize: '48px',
    }).setOrigin(0.5);

    /* ── Name labels ── */
    const atkLabel = this.add.text(cx, attackerY + 38, attackerName, {
      fontSize: '14px', fontFamily: '"Russo One", sans-serif', color: '#e2e8f0',
    }).setOrigin(0.5);

    const defLabel = this.add.text(cx, defenderY + 38, defenderName, {
      fontSize: '14px', fontFamily: '"Russo One", sans-serif', color: '#e2e8f0',
    }).setOrigin(0.5);

    /* ── Move name display ── */
    const moveText = this.add.text(cx, this.H / 2 + 60, `${attackerName} 使用了 ${moveName}！`, {
      fontSize: '13px', fontFamily: '"Chakra Petch", sans-serif',
      color: typeColor, align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    /* ── Particle texture (generated on-the-fly) ── */
    this.createParticleTexture('particle', cfg.particleTint);
    this.createGlowTexture('glow', cfg.particleTint);
    this.createSparkTexture('spark', cfg.particleTint);

    /* ── Projectile body ── */
    const projGfx = this.add.graphics();
    projGfx.fillStyle(cfg.particleTint, 1);
    projGfx.fillCircle(0, 0, 10);
    projGfx.generateTexture('projBody', 20, 20);
    projGfx.destroy();

    const projectile = this.add.image(cx, attackerY, 'projBody').setAlpha(0).setScale(0.8);

    /* ── Trail emitter following projectile ── */
    const trailEmitter = this.add.particles(0, 0, 'particle', {
      follow: projectile,
      frequency: 20,
      lifespan: 300,
      scale: { start: 0.6, end: 0 },
      alpha: { start: cfg.trailAlpha, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });

    /* ── Animation sequence ── */
    const at = (ms: number, fn: () => void) => setTimeout(fn, ms);

    /* 1. INTRO — fade in */
    this.tweens.add({ targets: [atkSprite, defSprite, atkLabel, defLabel], alpha: { from: 0, to: 1 }, duration: 350, ease: 'Power2' });

    /* 2. CAMERA ZOOM to attacker (at 400ms) */
    at(400, () => {
      this.cameras.main.zoomTo(1.3, 300, 'Power2');
      this.cameras.main.pan(cx, attackerY, 300, 'Power2');
      moveText.setAlpha(1);
      this.tweens.add({ targets: moveText, alpha: { from: 0, to: 1 }, duration: 200 });
    });

    /* 3. LUNGE — attacker moves toward defender (at 750ms) */
    at(750, () => {
      const lungeY = attackerY + (isPlayerAttacking ? -60 : 60);
      this.tweens.add({
        targets: atkSprite,
        y: lungeY,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 250,
        ease: 'Back.easeOut',
        yoyo: true,
        yoyoDelay: 50,
      });
      this.tweens.add({
        targets: atkLabel,
        y: lungeY + 38,
        duration: 250,
        ease: 'Back.easeOut',
        yoyo: true,
        yoyoDelay: 50,
      });
    });

    /* 4. PROJECTILE LAUNCH (at 1050ms) */
    at(1050, () => {
      projectile.setPosition(cx, attackerY).setAlpha(1).setScale(0.8);
      trailEmitter.start();

      this.cameras.main.pan(cx, this.H / 2, 300, 'Power2');
      this.cameras.main.zoomTo(1.1, 300, 'Power2');

      const pathDuration = (Math.abs(defenderY - attackerY) / cfg.speed) * 1000;

      if (cfg.pathTween === 'zigzag') {
        const steps = 6;
        const stepDur = pathDuration / steps;
        const stepDy = (defenderY - attackerY) / steps;
        this.tweens.chain({
          targets: projectile,
          tweens: Array.from({ length: steps }, (_, i) => ({
            x: cx + (i % 2 === 0 ? 30 : -30),
            y: attackerY + stepDy * (i + 1),
            duration: stepDur,
            ease: 'Linear',
          })),
        });
      } else if (cfg.pathTween === 'arc') {
        const midX = cx + 60;
        const midY = (attackerY + defenderY) / 2;
        this.tweens.add({
          targets: projectile,
          x: midX,
          y: midY,
          duration: pathDuration * 0.5,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: projectile,
              x: cx,
              y: defenderY,
              duration: pathDuration * 0.5,
              ease: 'Sine.easeIn',
            });
          },
        });
      } else if (cfg.pathTween === 'wobble') {
        this.tweens.add({
          targets: projectile,
          y: defenderY,
          duration: pathDuration,
          ease: 'Linear',
        });
        this.tweens.add({
          targets: projectile,
          x: { from: cx - 15, to: cx + 15 },
          yoyo: true,
          repeat: 4,
          duration: pathDuration / 8,
          ease: 'Sine.easeInOut',
        });
      } else if (cfg.pathTween === 'curve-s') {
        const q1Y = attackerY + (defenderY - attackerY) * 0.33;
        const q2Y = attackerY + (defenderY - attackerY) * 0.66;
        this.tweens.chain({
          targets: projectile,
          tweens: [
            { x: cx + 50, y: q1Y, duration: pathDuration * 0.33, ease: 'Sine.easeOut' },
            { x: cx - 50, y: q2Y, duration: pathDuration * 0.33, ease: 'Sine.easeInOut' },
            { x: cx, y: defenderY, duration: pathDuration * 0.34, ease: 'Sine.easeIn' },
          ],
        });
      } else {
        this.tweens.add({
          targets: projectile,
          y: defenderY,
          duration: pathDuration,
          ease: 'Power1',
        });
      }
    });

    /* 5. IMPACT (at 1550ms) */
    at(1550, () => {
      trailEmitter.stop();
      projectile.setAlpha(0);

      this.cameras.main.shake(400, 0.025);
      this.cameras.main.flash(150, ...this.hexToRGB(typeColor), true);

      const burstEmitter = this.add.particles(cx, defenderY, 'particle', {
        speed: { min: 80, max: 280 },
        angle: { min: 0, max: 360 },
        lifespan: { min: 300, max: 600 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
        quantity: cfg.burstCount,
      });
      burstEmitter.explode(cfg.burstCount);

      const glowEmitter = this.add.particles(cx, defenderY, 'glow', {
        speed: { min: 30, max: 120 },
        angle: { min: 0, max: 360 },
        lifespan: { min: 200, max: 400 },
        scale: { start: 1.2, end: 0 },
        alpha: { start: 0.7, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
        quantity: 8,
      });
      glowEmitter.explode(8);

      const sparkEmitter = this.add.particles(cx, defenderY, 'spark', {
        speed: { min: 150, max: 350 },
        angle: { min: 0, max: 360 },
        lifespan: 400,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
        quantity: 12,
      });
      sparkEmitter.explode(12);

      const ring = this.add.graphics();
      ring.lineStyle(3, cfg.particleTint, 0.9);
      ring.strokeCircle(0, 0, 20);
      ring.setPosition(cx, defenderY);
      this.tweens.add({
        targets: ring,
        scaleX: 4,
        scaleY: 4,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
      });

      this.tweens.add({
        targets: defSprite,
        x: cx + 8,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Linear',
      });
      this.tweens.add({
        targets: defSprite,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
        repeat: 2,
      });
    });

    /* 6. DAMAGE NUMBER (at 1750ms) */
    at(1750, () => {
      this.cameras.main.zoomTo(1.0, 400, 'Power2');
      this.cameras.main.pan(cx, this.H / 2, 400, 'Power2');

      const dmgText = this.add.text(cx, defenderY - 30, `-${damage}`, {
        fontSize: '32px',
        fontFamily: '"Russo One", sans-serif',
        color: '#FF6B6B',
        stroke: '#000',
        strokeThickness: 3,
      }).setOrigin(0.5).setAlpha(0).setScale(0.3);

      this.tweens.add({
        targets: dmgText,
        alpha: 1,
        scaleX: 1.3,
        scaleY: 1.3,
        y: defenderY - 55,
        duration: 200,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: dmgText,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Power2',
          });
        },
      });

      moveText.setText(`造成 ${damage} 點傷害！`);
      moveText.setColor('#FF6B6B');
    });

    /* 7. OUTRO — fade out and callback (at 2400ms) */
    at(2400, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      at(450, () => {
        onComplete();
      });
    });
  }

  /* ── Helpers ── */

  private createParticleTexture(key: string, tint: number) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.fillStyle(tint, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture(key, 16, 16);
    g.destroy();
  }

  private createGlowTexture(key: string, tint: number) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.fillStyle(tint, 0.5);
    g.fillCircle(16, 16, 16);
    g.fillStyle(tint, 0.3);
    g.fillCircle(16, 16, 12);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(16, 16, 4);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }

  private createSparkTexture(key: string, tint: number) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.fillStyle(tint, 1);
    // Small diamond shape
    g.fillTriangle(4, 0, 8, 4, 4, 8);
    g.fillTriangle(4, 0, 0, 4, 4, 8);
    g.generateTexture(key, 8, 8);
    g.destroy();
  }

  private hexToRGB(hex: string): [number, number, number] {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  }
}
