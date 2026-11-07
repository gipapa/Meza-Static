import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import TimedScene from './TimedScene';

interface Props<D extends object> {
  /** Phaser game config (parent and scene are managed by this component). */
  config: Omit<Phaser.Types.Core.GameConfig, 'parent' | 'scene'>;
  /** Scene class to run. */
  scene: new () => Phaser.Scene;
  /** Unique scene key (must match the key passed to the scene's constructor). */
  sceneKey: string;
  /** Payload handed to the scene's create(data). Captured once at mount. */
  data: D;
  className?: string;
}

/**
 * Generic React wrapper that mounts a Phaser game into a <div> and starts a
 * single scene with `data`. Data is passed through Phaser's SceneManager
 * (scene.add(key, Scene, autoStart, data)), so there is no module-level
 * hand-off state that a later mount could overwrite.
 */
export default function PhaserContainer<D extends object>({ config, scene, sceneKey, data, className }: Props<D>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  // Snapshot props at mount so re-renders never restart the scene.
  const initial = useRef({ config, scene, sceneKey, data });

  useEffect(() => {
    let cancelled = false;
    const { config: cfg, scene: SceneClass, sceneKey: key, data: payload } = initial.current;

    // Defer game creation so React StrictMode's first mount/cleanup cycle
    // doesn't create-then-destroy a Phaser game, which corrupts WebGL state.
    const timer = requestAnimationFrame(() => {
      if (cancelled || !containerRef.current) return;

      const game = new Phaser.Game({
        ...cfg,
        parent: containerRef.current,
        scene: [],
      });
      // Before boot this is queued and started with `payload` once ready.
      game.scene.add(key, SceneClass, true, payload);
      gameRef.current = game;
      // Dev-only handle so automated tests can step frames deterministically.
      if (import.meta.env.DEV) (window as unknown as { __mezaPhaserGame?: Phaser.Game }).__mezaPhaserGame = game;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(timer);
      const game = gameRef.current;
      if (game) {
        // game.destroy() is deferred to the next frame; stop timelines now so
        // no callback (e.g. onComplete) fires after the component unmounts.
        game.scene.getScenes(false).forEach(s => {
          if (s instanceof TimedScene) s.cancelTimers();
        });
        game.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
