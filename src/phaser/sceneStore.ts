/**
 * Module-level store for passing data to Phaser scenes.
 *
 * Phaser calls scene.init(data) with `{}` (not undefined) when a scene is
 * auto-started from the `scene: [SceneClass]` config, which breaks nullish
 * coalescing fallbacks. Setting data here BEFORE `new Phaser.Game()` guarantees
 * scenes always have their payload available.
 */

type AnyData = Record<string, unknown>;

let _pending: AnyData | null = null;

/** Set data to be consumed by the next scene that boots. */
export function setSceneData(data: AnyData): void {
  _pending = data;
}

/** Read and clear the pending data. */
export function takeSceneData(): AnyData | null {
  const d = _pending;
  _pending = null;
  return d;
}
