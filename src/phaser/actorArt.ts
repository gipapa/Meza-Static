import Phaser from 'phaser';

/* ────────────────────────────────────────────────────────────────────
 *  Monster sprites for Phaser scenes: custom image or type emoji.
 *
 *  Art is resolved *before* the scene starts (useActorArt.ts) and handed in
 *  as an untainted canvas, so create() stays synchronous: no async texture
 *  loads inside a running scene, nothing to update after it is destroyed,
 *  and a slow/blocked image can never stall the animation timeline.
 *  If the texture can't be created for any reason the emoji is used.
 *
 *  Sprites are never flipped: enemy/ally art keeps its orientation, and
 *  position is decided by side (enemy top, ally bottom) by each scene.
 *  ──────────────────────────────────────────────────────────────────── */

export interface ActorArt {
  emoji: string;
  /** Untainted canvas of the custom image (null/undefined → emoji). */
  art?: HTMLCanvasElement | null;
  /** Texture key, unique per character id (e.g. 'char:045'). */
  artKey?: string;
}

export type ActorSprite = Phaser.GameObjects.Image | Phaser.GameObjects.Text;

/** Image box relative to the emoji font size (emoji glyphs render ≈1.15×). */
const BOX = 1.15;

function ensureTexture(scene: Phaser.Scene, actor: ActorArt): string | null {
  if (!actor.art || !actor.artKey) return null;
  const key = actor.artKey;
  if (scene.textures.exists(key)) return key;
  try {
    const tex = scene.textures.addCanvas(key, actor.art);
    return tex ? key : null;
  } catch {
    // e.g. SecurityError on a tainted source: fall back to the emoji.
    if (scene.textures.exists(key)) scene.textures.remove(key);
    return null;
  }
}

/**
 * Add a monster sprite centred at (x, y) sized like an emoji of `fontPx`.
 * Image sprites carry their fitted scale as `baseScale` (see baseScale()), so
 * relative tweens ("pop to 1.2×") must multiply by it.
 */
export function addActorSprite(
  scene: Phaser.Scene, x: number, y: number, actor: ActorArt, fontPx: number,
  opts: { resolution?: number } = {},
): ActorSprite {
  const key = ensureTexture(scene, actor);
  if (key) {
    const img = scene.add.image(x, y, key).setOrigin(0.5);
    const box = fontPx * BOX;
    const s = box / Math.max(img.width, img.height);
    img.setScale(s).setData('baseScale', s).setData('actorArt', 'image');
    return img;
  }
  const t = scene.add.text(x, y, actor.emoji, { fontSize: `${fontPx}px`, resolution: opts.resolution ?? 1 }).setOrigin(0.5);
  t.setData('baseScale', 1).setData('actorArt', 'emoji');
  return t;
}

/** Scale that corresponds to "100%" for a sprite made by addActorSprite. */
export function baseScale(obj: Phaser.GameObjects.GameObject): number {
  const v = obj.getData?.('baseScale');
  return typeof v === 'number' && v > 0 ? v : 1;
}
