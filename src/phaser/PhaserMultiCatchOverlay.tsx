import { useMemo } from 'react';
import Phaser from 'phaser';
import PhaserContainer from './PhaserContainer';
import MultiCatchScene, { MULTI_CATCH_SCENE_KEY } from './MultiCatchScene';
import type { MultiCatchSceneData, MultiCatchTarget } from './MultiCatchScene';
import type { BallType } from '../types';
import { useActorArt } from './useActorArt';

interface Props {
  /** `characterId` per target selects the custom image (emoji is the fallback). */
  targets: MultiCatchTarget[];
  ballType: BallType;
  onComplete: () => void;
}

export default function PhaserMultiCatchOverlay({ targets, ballType, onComplete }: Props) {
  const { ready, arts } = useActorArt(targets.map(t => t.characterId));
  const data: MultiCatchSceneData | null = useMemo(
    () => (ready ? { ballType, targets: targets.map((t, i) => ({ ...t, ...arts[i] })), onComplete } : null),
    [ready], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const config = useMemo(() => ({
    type: Phaser.AUTO,
    width: targets.length * 130,
    height: 340,
    transparent: false,
    banner: false,
    audio: { noAudio: true },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ width: config.width, height: config.height, background: '#0a0a14' }}>
        {data && <PhaserContainer config={config} scene={MultiCatchScene} sceneKey={MULTI_CATCH_SCENE_KEY} data={data} />}
      </div>
    </div>
  );
}
