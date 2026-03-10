import { useMemo } from 'react';
import Phaser from 'phaser';
import PhaserContainer from './PhaserContainer';
import WheelScene, { setWheelSceneData } from './WheelScene';
import type { BallType } from '../types';

interface Props {
  onResult: (ball: BallType) => void;
}

/**
 * Drop-in replacement for BallWheel.
 * Renders a Phaser canvas with a physics-based roulette wheel with particles.
 */
export default function PhaserBallWheel({ onResult }: Props) {
  const config = useMemo(() => {
    setWheelSceneData({ onResult });
    return {
      type: Phaser.AUTO,
      width: 300,
      height: 360,
      transparent: false,
      banner: false,
      audio: { noAudio: true },
      scene: [WheelScene],
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl">
        <PhaserContainer config={config} />
      </div>
    </div>
  );
}
