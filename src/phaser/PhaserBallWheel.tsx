import { useMemo } from 'react';
import Phaser from 'phaser';
import PhaserContainer from './PhaserContainer';
import WheelScene, { WHEEL_SCENE_KEY } from './WheelScene';
import type { WheelSceneData } from './WheelScene';
import type { BallType } from '../types';

interface Props {
  onResult: (ball: BallType) => void;
}

const CONFIG = {
  type: Phaser.AUTO,
  width: 300,
  height: 360,
  transparent: false,
  banner: false,
  audio: { noAudio: true },
} as const;

/**
 * Drop-in replacement for BallWheel.
 * Renders a Phaser canvas with a physics-based roulette wheel with particles.
 */
export default function PhaserBallWheel({ onResult }: Props) {
  const data: WheelSceneData = useMemo(() => ({ onResult }), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl">
        <PhaserContainer config={CONFIG} scene={WheelScene} sceneKey={WHEEL_SCENE_KEY} data={data} />
      </div>
    </div>
  );
}
