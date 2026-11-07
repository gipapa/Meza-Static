import { useMemo } from 'react';
import Phaser from 'phaser';
import PhaserContainer from './PhaserContainer';
import CatchScene, { CATCH_SCENE_KEY } from './CatchScene';
import type { CatchSceneData } from './CatchScene';
import type { BallType } from '../types';

interface Props {
  ballType: BallType;
  monsterEmoji: string;
  monsterName: string;
  success: boolean;
  shakeCount: number;
  onComplete: () => void;
}

const CONFIG = {
  type: Phaser.AUTO,
  width: 360,
  height: 420,
  transparent: false,
  banner: false,
  audio: { noAudio: true },
} as const;

/**
 * Full-screen Phaser catch animation overlay.
 * Replaces the CSS-based CatchAnimation for single-target catch.
 */
export default function PhaserCatchOverlay({
  ballType, monsterEmoji, monsterName, success, shakeCount, onComplete,
}: Props) {
  const data: CatchSceneData = useMemo(() => ({
    ballType, monsterEmoji, monsterName, success, shakeCount, onComplete,
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <PhaserContainer config={CONFIG} scene={CatchScene} sceneKey={CATCH_SCENE_KEY} data={data} />
      </div>
    </div>
  );
}
