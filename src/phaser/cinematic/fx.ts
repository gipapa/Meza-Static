import Phaser from 'phaser';

/* ────────────────────────────────────────────────────────────────────
 *  Reusable cinematic effects (cut-ins, concentration lines, stamps…).
 *
 *  Every helper animates with tweens and the scene UPDATE event, never with
 *  timers, so a CinematicScene's speed factor (scene.tweens.timeScale) and
 *  scene teardown apply automatically. Coordinates are design pixels
 *  (360×640); text is rasterised at 2× so it stays sharp under the
 *  RENDER_SCALE camera zoom.
 *  ──────────────────────────────────────────────────────────────────── */

export const DESIGN_W = 360;
export const DESIGN_H = 640;

export const TEX = {
  petal: 'fx-petal',
  glow: 'fx-glow',
  spark: 'fx-spark',
  streak: 'fx-streak',
  dot: 'fx-dot',
} as const;

export const FONT_DISPLAY = '"Russo One", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
export const FONT_TC = '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';

type Layer = Phaser.GameObjects.Container;
type Text = Phaser.GameObjects.Text;

const speedOf = (scene: Phaser.Scene) => scene.tweens.timeScale || 1;
export const rand = Phaser.Math.FloatBetween;
export const randInt = Phaser.Math.Between;
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Generate the shared particle textures once per game. */
export function ensureFxTextures(scene: Phaser.Scene) {
  if (scene.textures.exists(TEX.petal)) return;
  const g = scene.make.graphics({}, false);

  // Petal: pointed ellipse with a soft highlight.
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(16, 8, 30, 13);
  g.fillTriangle(0, 8, 6, 4, 6, 12);
  g.generateTexture(TEX.petal, 32, 16);
  g.clear();

  // Glow: stacked translucent discs → radial falloff.
  for (let r = 32; r > 0; r -= 2) {
    g.fillStyle(0xffffff, 0.07);
    g.fillCircle(32, 32, r);
  }
  g.generateTexture(TEX.glow, 64, 64);
  g.clear();

  // Spark: four-point star.
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(16, 0, 19, 16, 13, 16);
  g.fillTriangle(16, 32, 19, 16, 13, 16);
  g.fillTriangle(0, 16, 16, 13, 16, 19);
  g.fillTriangle(32, 16, 16, 13, 16, 19);
  g.generateTexture(TEX.spark, 32, 32);
  g.clear();

  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 1, 64, 2);
  g.generateTexture(TEX.streak, 64, 4);
  g.clear();

  g.fillCircle(4, 4, 4);
  g.generateTexture(TEX.dot, 8, 8);
  g.destroy();
}

/** Text with sane defaults (centered, 2× raster). */
export function txt(
  scene: Phaser.Scene, x: number, y: number, s: string,
  style: Phaser.Types.GameObjects.Text.TextStyle = {},
): Text {
  return scene.add.text(x, y, s, {
    fontFamily: FONT_DISPLAY, color: '#ffffff', resolution: 2, align: 'center', ...style,
  }).setOrigin(0.5);
}

/** Run `fn` after `ms` (scaled by scene speed, cleaned up with the scene). */
export function after(scene: Phaser.Scene, ms: number, fn: () => void) {
  scene.tweens.addCounter({ from: 0, to: 1, duration: Math.max(1, ms), onComplete: fn });
}

/** Call `fn` every `intervalMs` of (speed-scaled) scene time. Returns stop(). */
export function every(scene: Phaser.Scene, intervalMs: number, fn: () => void): () => void {
  let acc = 0;
  const onUpdate = (_t: number, dt: number) => {
    acc += dt * speedOf(scene);
    let n = 0;
    while (acc >= intervalMs && n++ < 4) { acc -= intervalMs; fn(); }
    if (acc > intervalMs) acc = intervalMs; // don't spiral after a long frame
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  return () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate);
}

/** Per-frame callback receiving speed-scaled dt in ms. Returns stop(). */
export function onFrame(scene: Phaser.Scene, fn: (dt: number) => void): () => void {
  const onUpdate = (_t: number, dt: number) => fn(Math.min(dt, 50) * speedOf(scene));
  scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
  return () => scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate);
}

/** Particle emitter that follows the scene speed factor. */
export function emitter(
  scene: Phaser.Scene, x: number, y: number, texture: string,
  config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig,
) {
  const em = scene.add.particles(x, y, texture, config);
  em.timeScale = speedOf(scene);
  return em;
}

/** Fire-and-forget burst; the emitter destroys itself afterwards. */
export function burst(
  scene: Phaser.Scene, x: number, y: number, texture: string, count: number,
  config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig,
) {
  const life = typeof config.lifespan === 'number' ? config.lifespan : 1600;
  const em = emitter(scene, x, y, texture, { ...config, emitting: false });
  em.explode(count);
  after(scene, life + 200, () => em.destroy());
  return em;
}

/** Spinning-petal rotate op: random start angle, keeps turning. */
export const spin = (degPerFrame = 6): Phaser.Types.GameObjects.Particles.EmitterOpOnEmitType &
  Phaser.Types.GameObjects.Particles.EmitterOpOnUpdateType => ({
  onEmit: () => Math.random() * 360,
  onUpdate: (_p: Phaser.GameObjects.Particles.Particle, _k: string, _t: number, v: number) => v + degPerFrame,
});

/** Expanding (or contracting) ring. */
export function ring(
  scene: Phaser.Scene, x: number, y: number, color: number,
  fromR: number, toR: number, ms: number, width = 4, delay = 0,
) {
  const g = scene.add.graphics({ x, y });
  g.lineStyle(width, color, 1);
  g.strokeCircle(0, 0, 50);
  g.setScale(fromR / 50).setAlpha(0);
  scene.tweens.add({
    targets: g, scale: toR / 50, alpha: { from: 1, to: 0 }, duration: ms, delay,
    ease: fromR < toR ? 'Cubic.easeOut' : 'Cubic.easeIn',
    onComplete: () => g.destroy(),
  });
  return g;
}

/** Full-layer color flash (UI layer, screen space). */
export function screenFlash(scene: Phaser.Scene, layer: Layer, color = 0xffffff, inMs = 60, holdMs = 60, outMs = 400, peak = 1) {
  const r = scene.add.rectangle(DESIGN_W / 2, DESIGN_H / 2, DESIGN_W + 40, DESIGN_H + 40, color, 1).setAlpha(0);
  layer.add(r);
  scene.tweens.chain({
    targets: r,
    tweens: [
      { alpha: peak, duration: inMs },
      { alpha: peak, duration: holdMs },
      { alpha: 0, duration: outMs },
    ],
    onComplete: () => r.destroy(),
  });
  return r;
}

/**
 * Radial "concentration lines" (集中線) around (cx, cy), redrawn ~16×/s.
 * Returns stop(), which fades them out.
 */
export function concentrationLines(
  scene: Phaser.Scene, layer: Layer, cx: number, cy: number,
  opts: { color?: number; alpha?: number; inner?: number; count?: number } = {},
): () => void {
  const { color = 0xffffff, alpha = 0.55, inner = 120, count = 44 } = opts;
  const g = scene.add.graphics();
  layer.add(g);
  const R = 700;
  const draw = () => {
    g.clear();
    g.fillStyle(color, alpha);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const w = rand(0.006, 0.022);
      const r0 = inner * rand(0.75, 1.3);
      g.fillTriangle(
        cx + Math.cos(a) * r0, cy + Math.sin(a) * r0,
        cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R,
        cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R,
      );
    }
  };
  draw();
  g.setAlpha(0);
  scene.tweens.add({ targets: g, alpha: 1, duration: 200 });
  const stopTick = every(scene, 60, draw);
  return () => {
    stopTick();
    scene.tweens.add({ targets: g, alpha: 0, duration: 250, onComplete: () => g.destroy() });
  };
}

/** Horizontal speed lines inside a rect (local to `layer`). Returns stop(). */
export function speedLines(
  scene: Phaser.Scene, layer: Layer, rect: { x: number; y: number; w: number; h: number },
  opts: { color?: number; alpha?: number; count?: number; slant?: number } = {},
): () => void {
  const { color = 0xffffff, alpha = 0.35, count = 26, slant = 0 } = opts;
  const g = scene.add.graphics();
  layer.add(g);
  const draw = () => {
    g.clear();
    for (let i = 0; i < count; i++) {
      const y = rect.y + Math.random() * rect.h;
      const len = rand(rect.w * 0.2, rect.w * 0.7);
      const x = rect.x + Math.random() * (rect.w - len);
      g.lineStyle(rand(1, 3), color, alpha * rand(0.4, 1));
      g.lineBetween(x, y, x + len, y + slant * (len / rect.w));
    }
  };
  draw();
  const stopTick = every(scene, 50, draw);
  return () => { stopTick(); g.destroy(); };
}

/** Stamp a text in (scale 3 → 1, alpha 0 → 1) after `delay`. */
export function stamp(scene: Phaser.Scene, t: Text, delay = 0, from = 3) {
  t.setScale(from).setAlpha(0);
  scene.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 220, delay, ease: 'Back.easeOut' });
  return t;
}

/** Black cinema bars. Returns a function that retracts them. */
export function letterbox(scene: Phaser.Scene, layer: Layer, barH = 54, ms = 500): () => void {
  const top = scene.add.rectangle(DESIGN_W / 2, -barH / 2, DESIGN_W + 40, barH, 0x000000);
  const bot = scene.add.rectangle(DESIGN_W / 2, DESIGN_H + barH / 2, DESIGN_W + 40, barH, 0x000000);
  layer.add([top, bot]);
  scene.tweens.add({ targets: top, y: barH / 2, duration: ms, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: bot, y: DESIGN_H - barH / 2, duration: ms, ease: 'Cubic.easeOut' });
  return () => {
    scene.tweens.add({ targets: top, y: -barH / 2, duration: ms, ease: 'Cubic.easeIn' });
    scene.tweens.add({ targets: bot, y: DESIGN_H + barH / 2, duration: ms, ease: 'Cubic.easeIn' });
  };
}

export interface CutInOptions {
  emoji: string;
  name: string;
  lines: string[];
  /** Accent color of the band. */
  color: number;
  /** Ally portraits slide in from the left, enemy portraits from the right. */
  fromLeft: boolean;
  y?: number;
  height?: number;
}

/**
 * Pilot-style cut-in: a slanted band opens (scaleY 0 → 1) with a big portrait,
 * name plate, speed lines and dialogue lines that appear one after another.
 * Returns close(), which collapses the band and destroys it.
 */
export function cutIn(scene: Phaser.Scene, layer: Layer, o: CutInOptions): () => void {
  const y = o.y ?? DESIGN_H * 0.45;
  const h = o.height ?? 210;
  const c = scene.add.container(0, y);
  layer.add(c);
  const s = 36; // slant
  const poly = [
    new Phaser.Math.Vector2(-30 + s, -h / 2), new Phaser.Math.Vector2(DESIGN_W + 30 + s, -h / 2),
    new Phaser.Math.Vector2(DESIGN_W + 30 - s, h / 2), new Phaser.Math.Vector2(-30 - s, h / 2),
  ];
  const bg = scene.add.graphics();
  bg.fillStyle(0x07070f, 0.96);
  bg.fillPoints(poly, true);
  bg.fillStyle(o.color, 0.22);
  bg.fillPoints(poly, true);
  c.add(bg);

  const stopLines = speedLines(scene, c, { x: -20, y: -h / 2 + 8, w: DESIGN_W + 40, h: h - 16 },
    { color: 0xffffff, alpha: 0.25, count: 22 });

  const border = scene.add.graphics();
  border.lineStyle(5, o.color, 1);
  border.lineBetween(poly[0].x, poly[0].y, poly[1].x, poly[1].y);
  border.lineBetween(poly[3].x, poly[3].y, poly[2].x, poly[2].y);
  border.lineStyle(2, 0xffffff, 0.9);
  border.lineBetween(poly[0].x, poly[0].y + 7, poly[1].x, poly[1].y + 7);
  border.lineBetween(poly[3].x, poly[3].y - 7, poly[2].x, poly[2].y - 7);
  c.add(border);

  const px = o.fromLeft ? DESIGN_W * 0.27 : DESIGN_W * 0.73;
  const portraitGlow = scene.add.image(px, 0, TEX.glow).setScale(3.4).setTint(o.color).setAlpha(0.8)
    .setBlendMode(Phaser.BlendModes.ADD);
  const portrait = txt(scene, px + (o.fromLeft ? -60 : 60), 4, o.emoji, { fontSize: `${Math.round(h * 0.62)}px` });
  c.add([portraitGlow, portrait]);
  scene.tweens.add({ targets: portrait, x: px, duration: 3200, ease: 'Sine.easeOut' });
  scene.tweens.add({ targets: portraitGlow, scale: 4, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });

  const tx = o.fromLeft ? DESIGN_W * 0.5 : DESIGN_W * 0.06;
  const name = scene.add.text(tx, -h / 2 + 18, o.name, {
    fontFamily: FONT_DISPLAY, fontSize: '15px', color: '#ffffff', backgroundColor: '#00000000', resolution: 2,
    stroke: '#' + o.color.toString(16).padStart(6, '0'), strokeThickness: 4,
  });
  c.add(name);
  o.lines.forEach((line, i) => {
    const t = scene.add.text(tx, -h / 2 + 52 + i * 36, line, {
      fontFamily: FONT_TC, fontSize: '19px', fontStyle: 'bold', color: '#fff4fb', resolution: 2,
      stroke: '#000000', strokeThickness: 4, wordWrap: { width: DESIGN_W * 0.46, useAdvancedWrap: true },
    }).setAlpha(0);
    c.add(t);
    scene.tweens.add({ targets: t, alpha: 1, x: { from: tx + 14, to: tx }, duration: 260, delay: 350 + i * 1100 });
  });

  c.setScale(1, 0);
  scene.tweens.add({ targets: c, scaleY: 1, duration: 200, ease: 'Back.easeOut' });

  return () => {
    scene.tweens.add({
      targets: c, scaleY: 0, duration: 160, ease: 'Cubic.easeIn',
      onComplete: () => { stopLines(); c.destroy(); },
    });
  };
}

/**
 * Narrow "eye-catch" band: an extreme close-up of the portrait, masked to the
 * band, opened by two shutters. Returns close().
 */
export function eyeCatch(
  scene: Phaser.Scene, layer: Layer, o: { emoji: string; color: number; shout: string; y?: number; height?: number },
): () => void {
  const y = o.y ?? DESIGN_H * 0.4;
  const h = o.height ?? 92;
  const c = scene.add.container(0, 0);
  layer.add(c);

  const bg = scene.add.rectangle(DESIGN_W / 2, y, DESIGN_W + 40, h, 0x05050a, 1);
  const tint = scene.add.rectangle(DESIGN_W / 2, y, DESIGN_W + 40, h, o.color, 0.25);
  c.add([bg, tint]);

  // World-space mask matching the band (layer may be offset from the origin).
  const shape = scene.make.graphics({ x: layer.x, y: layer.y }, false);
  shape.fillStyle(0xffffff);
  shape.fillRect(-20, y - h / 2, DESIGN_W + 40, h);
  const mask = shape.createGeometryMask();

  const face = txt(scene, DESIGN_W * 0.5, y + 10, o.emoji, { fontSize: `${Math.round(h * 2.6)}px` }).setMask(mask);
  const shine = scene.add.image(DESIGN_W * 0.5, y, TEX.streak).setScale(8, 30).setAlpha(0.18).setAngle(20)
    .setBlendMode(Phaser.BlendModes.ADD).setMask(mask);
  c.add([face, shine]);
  scene.tweens.add({ targets: face, x: DESIGN_W * 0.42, scale: 1.08, duration: 2000, ease: 'Sine.easeOut' });
  scene.tweens.add({ targets: shine, x: { from: -60, to: DESIGN_W + 60 }, duration: 900, repeat: -1, repeatDelay: 300 });

  const edgeTop = scene.add.rectangle(DESIGN_W / 2, y - h / 2, DESIGN_W + 40, 3, o.color);
  const edgeBot = scene.add.rectangle(DESIGN_W / 2, y + h / 2, DESIGN_W + 40, 3, o.color);
  const shout = txt(scene, DESIGN_W * 0.78, y + h / 2 + 30, o.shout, {
    fontFamily: FONT_TC, fontSize: '30px', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6,
  }).setAngle(-6);
  c.add([edgeTop, edgeBot, shout]);
  stamp(scene, shout, 250, 2.2);

  // Shutters reveal the band from the middle.
  const shTop = scene.add.rectangle(DESIGN_W / 2, y - h / 4, DESIGN_W + 40, h / 2, 0x000000);
  const shBot = scene.add.rectangle(DESIGN_W / 2, y + h / 4, DESIGN_W + 40, h / 2, 0x000000);
  c.add([shTop, shBot]);
  scene.tweens.add({ targets: shTop, scaleY: 0, y: y - h / 2, duration: 180, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: shBot, scaleY: 0, y: y + h / 2, duration: 180, ease: 'Cubic.easeOut' });

  return () => {
    scene.tweens.add({
      targets: c, alpha: 0, duration: 180,
      onComplete: () => { face.clearMask(); shine.clearMask(); mask.destroy(); shape.destroy(); c.destroy(); },
    });
  };
}

/**
 * Converging particles: petals/glows spawn on a ring around (x, y) and are
 * sucked into the center. Returns stop().
 */
export function converge(
  scene: Phaser.Scene, x: number, y: number,
  o: { tints: readonly number[]; rMin?: number; rMax?: number; perTick?: number; intervalMs?: number; lifeMs?: number },
): () => void {
  const { rMin = 170, rMax = 250, perTick = 3, intervalMs = 70, lifeMs = 650 } = o;
  return every(scene, intervalMs, () => {
    for (let i = 0; i < perTick; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(rMin, rMax);
      const isGlow = Math.random() < 0.35;
      const img = scene.add.image(x + Math.cos(a) * r, y + Math.sin(a) * r, isGlow ? TEX.glow : TEX.petal)
        .setTint(pick(o.tints)).setBlendMode(Phaser.BlendModes.ADD)
        .setScale(isGlow ? rand(0.3, 0.6) : rand(0.5, 0.9)).setAngle(Phaser.Math.RadToDeg(a)).setAlpha(0);
      scene.tweens.add({
        targets: img, x, y, alpha: { from: 0.2, to: 1 }, scale: 0.1,
        duration: lifeMs * rand(0.8, 1.2), ease: 'Cubic.easeIn',
        onComplete: () => img.destroy(),
      });
    }
  });
}

/** Diagonal slash across (x, y). */
export function slash(scene: Phaser.Scene, x: number, y: number, angleDeg: number, color: number, delay = 0, length = 340) {
  const s = scene.add.image(x, y, TEX.streak).setAngle(angleDeg).setTint(color)
    .setBlendMode(Phaser.BlendModes.ADD).setScale(0, 3).setAlpha(1);
  const core = scene.add.image(x, y, TEX.streak).setAngle(angleDeg).setScale(0, 1.2).setAlpha(1);
  const sx = length / 64;
  scene.tweens.add({ targets: [s, core], scaleX: sx, duration: 120, delay, ease: 'Cubic.easeOut' });
  scene.tweens.add({
    targets: [s, core], alpha: 0, scaleY: 0.2, duration: 320, delay: delay + 140,
    onComplete: () => { s.destroy(); core.destroy(); },
  });
}

/** Floating number (e.g. per-hit damage). */
export function floatNumber(scene: Phaser.Scene, x: number, y: number, s: string, color = '#ffffff', size = 18) {
  const t = txt(scene, x, y, s, { fontSize: `${size}px`, color, stroke: '#000000', strokeThickness: 4 });
  t.setScale(1.8);
  scene.tweens.add({ targets: t, scale: 1, duration: 160, ease: 'Back.easeOut' });
  scene.tweens.add({ targets: t, y: y - 40, alpha: { from: 1, to: 0 }, duration: 800, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
}

export const hexToNum = (hex: string) => parseInt(hex.replace('#', ''), 16) || 0xa78bfa;
