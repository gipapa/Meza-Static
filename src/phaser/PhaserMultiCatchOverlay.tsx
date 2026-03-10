import { useMemo } from 'react';
import Phaser from 'phaser';
import PhaserContainer from './PhaserContainer';
import MultiCatchScene, { setMultiCatchSceneData } from './MultiCatchScene';
import type { MultiCatchSceneData, MultiCatchTarget } from './MultiCatchScene';
import type { BallType } from '../types';

interface Props {
  targets: MultiCatchTarget[];
  ballType: BallType;
  onComplete: () => void;
}

export default function PhaserMultiCatchOverlay({ targets, ballType, onComplete }: Props) {
  const config = useMemo(() => {
    const data: MultiCatchSceneData = { ballType, targets, onComplete };
    setMultiCatchSceneData(data);

    const count = targets.length;
    return {
      type: Phaser.AUTO,
      width: count * 130,
      height: 340,
      transparent: false,
      banner: false,
      audio: { noAudio: true },
      scene: [MultiCatchScene],
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <PhaserContainer config={config} />
      </div>
    </div>
  );
}
