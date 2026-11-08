import { useEffect, useMemo, useState } from 'react';
import Phaser from 'phaser';
import PhaserContainer from '../PhaserContainer';
import { CINEMATIC_CANVAS } from './CinematicScene';
import type { MoveCinematicData } from './CinematicScene';
import { getCinematic } from './registry';

interface Props {
  cinematicId: string;
  data: Omit<MoveCinematicData, 'onComplete'>;
  onComplete: () => void;
}

const CONFIG = {
  type: Phaser.AUTO,
  width: CINEMATIC_CANVAS.width,
  height: CINEMATIC_CANVAS.height,
  backgroundColor: '#000000',
  banner: false,
  audio: { noAudio: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, powerPreference: 'high-performance' },
} as const;

/**
 * Full-screen host for an advanced move cinematic. The canvas is fitted to
 * the viewport (portrait 9:16) and a skip button is always available, since
 * these animations run up to a minute.
 */
export default function AdvancedMoveOverlay({ cinematicId, data, onComplete }: Props) {
  const entry = getCinematic(cinematicId);
  // onComplete fires once, whether the timeline ends or the player skips.
  const [finish] = useState(() => {
    let done = false;
    return () => {
      if (done) return;
      done = true;
      onComplete();
    };
  });
  const sceneData = useMemo<MoveCinematicData>(() => ({ ...data, onComplete: finish }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Unknown id: never block the battle.
  useEffect(() => { if (!entry) finish(); }, [entry, finish]);
  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black touch-none select-none"
      data-testid="advanced-move-overlay"
      data-cinematic={cinematicId}
    >
      <PhaserContainer className="absolute inset-0" config={CONFIG} scene={entry.scene} sceneKey={entry.key} data={sceneData} />
      <button
        type="button"
        onClick={finish}
        className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] min-h-11 px-4 rounded-full bg-black/60 border border-white/30 text-white text-sm font-display active:bg-white/20"
      >
        跳過 ▶▶
      </button>
    </div>
  );
}
