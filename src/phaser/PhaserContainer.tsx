import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface Props {
  /** Phaser game config (without parent — parent is managed by this component). */
  config: Omit<Phaser.Types.Core.GameConfig, 'parent'>;
  className?: string;
}

/**
 * Generic React wrapper that mounts a Phaser game into a <div>.
 * Scene class and data must be set up BEFORE this component mounts
 * (e.g. via module-level setters like setBattleSceneData).
 */
export default function PhaserContainer({ config, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Defer game creation so React StrictMode's first mount/cleanup cycle
    // doesn't create-then-destroy a Phaser game, which corrupts WebGL state.
    const timer = requestAnimationFrame(() => {
      if (cancelled || !containerRef.current) return;

      const game = new Phaser.Game({
        ...config,
        parent: containerRef.current,
      });
      gameRef.current = game;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(timer);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={className} />;
}
