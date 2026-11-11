import Phaser from 'phaser';
import { after, every } from './fx';

/** Procedural light primitives shared by independent move scenes. No move routing here. */
export const LIGHT = { soft: 'energy-soft', thread: 'energy-thread' } as const;
export interface Point { x: number; y: number }

export function ensureEnergyTextures(scene: Phaser.Scene) {
  for (const [key, w, h] of [[LIGHT.soft, 128, 128], [LIGHT.thread, 128, 32]] as const) {
    if (scene.textures.exists(key)) continue;
    const texture = scene.textures.createCanvas(key, w, h);
    if (!texture) throw new Error(`Cannot create light texture ${key}`);
    const ctx = texture.getContext(), pixels = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = (x + 0.5 - w / 2) / (w / 2), ny = (y + 0.5 - h / 2) / (h / 2);
      const a = key === LIGHT.soft ? Math.pow(Math.max(0, 1 - Math.hypot(nx, ny)), 2.6)
        : Math.pow(Math.max(0, 1 - Math.abs(nx)), 0.7) * Math.exp(-ny * ny * 12);
      const i = (y * w + x) * 4;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 255;
      pixels.data[i + 3] = Math.round(255 * a);
    }
    ctx.putImageData(pixels, 0, 0); texture.refresh();
  }
}

/** One baked background per set; ridges, perspective and low-contrast light fields. */
export function energyBackdrop(scene: Phaser.Scene, ox: number, key: string, top: string, accent: string, ridges: number) {
  const w = 880, h = 1160;
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, w, h);
    if (!texture) throw new Error(`Cannot create backdrop ${key}`);
    const ctx = texture.getContext();
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, top); sky.addColorStop(1, '#03050b');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w / 2, 500, 0, w / 2, 500, 430);
    glow.addColorStop(0, accent + '28'); glow.addColorStop(1, accent + '00');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = accent + '18'; ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath(); ctx.moveTo(w / 2, 650); ctx.lineTo(i * w / 13, h); ctx.stroke();
    }
    ctx.fillStyle = '#050810';
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let i = 0; i <= 24; i++) ctx.lineTo(i * w / 24, 760 + Math.sin(i * ridges) * 70);
    ctx.lineTo(w, h); ctx.fill();
    ctx.strokeStyle = accent + '24';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath(); ctx.ellipse(w / 2, 850 + i * 38, 210 + i * 60, 20 + i * 10, 0, 0, Math.PI * 2); ctx.stroke();
    }
    texture.refresh();
  }
  return scene.add.image(ox - 260, -260, key).setOrigin(0).setDepth(-20);
}

export function softLight(scene: Phaser.Scene, p: Point, color: number, size: number, alpha = 0.5) {
  return scene.add.image(p.x, p.y, LIGHT.soft).setTint(color).setDisplaySize(size, size)
    .setAlpha(alpha).setDepth(1).setBlendMode(Phaser.BlendModes.ADD);
}

/** Inward threads: no petals or actor textures. Stop is idempotent. */
export function gatherLight(scene: Phaser.Scene, p: Point, color: number, accent: number, interval = 140, twist = 0) {
  const stop = every(scene, interval, () => {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2), r = Phaser.Math.Between(150, 210);
    const s = scene.add.image(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r, LIGHT.thread)
      .setTint(Math.random() < 0.25 ? accent : color).setDisplaySize(40, 5)
      .setRotation(angle + twist).setBlendMode(Phaser.BlendModes.ADD).setDepth(3);
    scene.tweens.add({ targets: s, x: p.x, y: p.y, alpha: 0.1, displayWidth: 4,
      rotation: angle, duration: 850, ease: 'Cubic.easeIn', onComplete: () => s.destroy() });
  });
  return () => { stop(); };
}

/** A tapered path, revealed from source to target with independently flowing motes.
 * Prebuilt segments and pooled sprites, no per-frame Graphics allocation. */
export function lightFlow(scene: Phaser.Scene, from: Point, to: Point, color: number, accent: number,
  options: { width?: number; bend?: number; life?: number; strands?: number } = {}) {
  const { width = 16, bend = 0, life = 1500, strands = 24 } = options;
  const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(from.x, from.y),
    new Phaser.Math.Vector2(from.x + dx * 0.3 + nx * bend, from.y + dy * 0.3 + ny * bend),
    new Phaser.Math.Vector2(from.x + dx * 0.7 - nx * bend, from.y + dy * 0.7 - ny * bend),
    new Phaser.Math.Vector2(to.x, to.y));
  const segments = Array.from({ length: 12 }, (_, i) => {
    const a = curve.getPoint(i / 12), b = curve.getPoint((i + 1) / 12);
    const angle = Math.atan2(b.y - a.y, b.x - a.x), l = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) + 4;
    const taper = Math.pow(Math.sin(Math.PI * (i + 0.5) / 12), 0.65);
    return [[3.2, color, 0.14], [1, color, 0.65], [0.16, 0xffffff, 0.9]].map(([scale, tint, alpha]) =>
      scene.add.image((a.x + b.x) / 2, (a.y + b.y) / 2, LIGHT.thread)
        .setDisplaySize(l * 2, width * scale * taper).setTint(tint).setRotation(angle)
        .setDepth(3).setAlpha(0).setData('peak', alpha).setBlendMode(Phaser.BlendModes.ADD));
  });
  const motes = Array.from({ length: strands }, (_, i) => scene.add.image(from.x, from.y, LIGHT.thread)
    .setTint(i % 3 ? accent : 0xffffff).setDisplaySize(24, 3).setDepth(4).setAlpha(0)
    .setBlendMode(Phaser.BlendModes.ADD));
  scene.tweens.addCounter({ from: 0, to: 1, duration: life, onUpdate: tw => {
    const t = tw.getValue() ?? 0, fade = Math.min(1, (1 - t) * 5);
    segments.forEach((layers, i) => layers.forEach(s => s.setAlpha(s.getData('peak') * fade *
      Phaser.Math.Clamp((t * 2.8 - i / 12) * 6, 0, 1))));
    motes.forEach((s, i) => {
      const u = (i / strands + t * 1.8) % 1, p = curve.getPoint(u), tangent = curve.getTangent(u);
      const off = Math.sin(i * 4 + t * 12) * width * 0.45;
      s.setPosition(p.x - tangent.y * off, p.y + tangent.x * off)
        .setRotation(Math.atan2(tangent.y, tangent.x))
        .setAlpha(Math.sin(Math.PI * u) * fade * Math.min(1, t * 8));
    });
  }, onComplete: () => { segments.flat().forEach(s => s.destroy()); motes.forEach(s => s.destroy()); } });
}

/** Orbiting light: front/back depths preserve the actor silhouette. */
export function lightOrbit(scene: Phaser.Scene, p: Point, color: number, accent: number,
  radius: number, life: number, turns = 1, count = 24) {
  const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const motes = Array.from({ length: count }, (_, i) => scene.add.image(p.x, p.y, i % 4 ? LIGHT.thread : LIGHT.soft)
    .setTint(i % 4 ? color : accent).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
  scene.tweens.addCounter({ from: 0, to: 1, duration: life, onUpdate: tw => {
    const t = tw.getValue() ?? 0, fade = Math.min(1, t * 8, (1 - t) * 6);
    motes.forEach((s, i) => {
      const a = i * 2.399 + t * (reduced ? 0.5 : turns * Math.PI * 2), z = Math.sin(a);
      const r = radius * (0.75 + (i % 5) * 0.06);
      s.setPosition(p.x + Math.cos(a) * r, p.y + z * r * 0.5)
        .setDepth(z > 0 ? 5 : 1).setRotation(a + Math.PI / 2)
        .setDisplaySize(i % 4 ? 32 : 40, i % 4 ? 4 : 40).setAlpha(fade * (0.4 + z * 0.2));
    });
  }, onComplete: () => motes.forEach(s => s.destroy()) });
}

/** Local luminous impact plus directional afterglow, never a full-screen opaque disc. */
export function lightBloom(scene: Phaser.Scene, p: Point, color: number, accent: number, size = 1) {
  const halo = softLight(scene, p, color, 70 * size, 0.8).setDepth(4);
  const core = softLight(scene, p, 0xffffff, 25 * size, 0.95).setDepth(5);
  scene.tweens.add({ targets: halo, displayWidth: 370 * size, displayHeight: 370 * size,
    alpha: 0, duration: 1600, onComplete: () => halo.destroy() });
  scene.tweens.add({ targets: core, displayWidth: 80 * size, displayHeight: 80 * size,
    alpha: 0, duration: 500, onComplete: () => core.destroy() });
  for (let i = 0; i < 20; i++) {
    const a = i * 2.399, r = (80 + i % 5 * 26) * size;
    const spark = scene.add.image(p.x, p.y, LIGHT.thread).setTint(i % 3 ? color : accent)
      .setDisplaySize(30 * size, 4).setRotation(a).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: spark, x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r,
      alpha: 0, displayWidth: 8, duration: 850 + i % 4 * 120, ease: 'Cubic.easeOut', onComplete: () => spark.destroy() });
  }
}

/** Branching lightning/cracks with a soft fringe and sharp white core. */
export function lightFork(scene: Phaser.Scene, from: Point, to: Point, color: number, jitter = 24, life = 1000) {
  const path = Array.from({ length: 10 }, (_, i) => ({
    x: Phaser.Math.Linear(from.x, to.x, i / 9) + (i === 0 || i === 9 ? 0 : (i % 2 ? 1 : -1) * jitter),
    y: Phaser.Math.Linear(from.y, to.y, i / 9),
  }));
  const g = scene.add.graphics().setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
  for (const [width, tint, alpha] of [[16, color, 0.07], [5, color, 0.7], [1, 0xffffff, 1]]) {
    g.lineStyle(width, tint, alpha); g.strokePoints(path);
    for (const i of [3, 6]) g.lineBetween(path[i].x, path[i].y, path[i].x + jitter * 2, path[i].y - 45);
  }
  scene.tweens.add({ targets: g, alpha: 0, duration: life, ease: 'Cubic.easeIn', onComplete: () => g.destroy() });
}

/** Polygon shards/leaves/crystals fall or shoot with a light wake. */
export function lightShards(scene: Phaser.Scene, from: Point, to: Point, color: number, accent: number,
  count = 9, spread = 100, pointed = true) {
  lightFlow(scene, from, to, color, accent, { width: 5, life: 1300, strands: 8 });
  for (let i = 0; i < count; i++) {
    const dx = (i - (count - 1) / 2) * spread / Math.max(1, count - 1);
    const shard = scene.add.graphics({ x: from.x + dx, y: from.y }).setDepth(4);
    shard.fillStyle(color, 0.7); shard.lineStyle(1, accent, 0.9);
    const points = pointed ? [{ x: 0, y: -22 }, { x: 8, y: 3 }, { x: 0, y: 17 }, { x: -8, y: 3 }]
      : [{ x: -12, y: -9 }, { x: 9, y: -14 }, { x: 16, y: 6 }, { x: -4, y: 15 }];
    shard.fillPoints(points, true); shard.strokePoints(points, true);
    shard.setRotation(Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2);
    scene.tweens.add({ targets: shard, x: to.x + dx * 0.4, y: to.y, alpha: 0,
      duration: 900, delay: i * 30, ease: 'Cubic.easeIn', onComplete: () => shard.destroy() });
  }
}

/** Translucent bubbles/clouds rise, expand, then burst locally. */
export function lightMist(scene: Phaser.Scene, p: Point, color: number, accent: number, size = 1, bubbles = false) {
  for (let i = 0; i < 12; i++) {
    const x = p.x + Math.sin(i * 7) * 105 * size, y = p.y + Math.cos(i * 3) * 70 * size;
    const cloud = softLight(scene, { x, y }, color, (70 + i % 4 * 18) * size, 0.4).setDepth(i % 3 ? 4 : 1);
    scene.tweens.add({ targets: cloud, y: y - 65 * size, alpha: 0,
      displayWidth: 150 * size, displayHeight: 150 * size, duration: 2300,
      delay: i * 50, onComplete: () => cloud.destroy() });
    if (bubbles) {
      const rim = scene.add.circle(x, y, 8 + i % 3 * 5).setStrokeStyle(1.5, accent, 0.8).setDepth(5);
      scene.tweens.add({ targets: rim, y: y - 100, scale: 1.8, alpha: 0, duration: 1700,
        delay: i * 50, onComplete: () => rim.destroy() });
    }
  }
}

/** Destroy a temporary object's whole hierarchy after a design-time lifetime. */
export function fadeObject(scene: Phaser.Scene, object: Phaser.GameObjects.GameObject & { alpha: number }, life = 1800) {
  after(scene, Math.max(1, life - 400), () => scene.tweens.add({ targets: object, alpha: 0, duration: 400,
    onComplete: () => object.destroy() }));
}
