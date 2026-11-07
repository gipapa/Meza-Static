import type Phaser from 'phaser';
import PetalDanceScene, { PETAL_DANCE_SCENE_KEY } from './PetalDanceScene';
import { PETAL_DANCE_TIMELINE } from './petalDanceTimeline';
import type { CinematicTimeline } from './timeline';

export interface CinematicEntry {
  key: string;
  scene: new () => Phaser.Scene;
  timeline: CinematicTimeline;
}

/** Advanced cinematic id → scene. Move names map to ids in moveAnimations.ts. */
export const CINEMATICS: Readonly<Record<string, CinematicEntry>> = {
  'petal-dance': { key: PETAL_DANCE_SCENE_KEY, scene: PetalDanceScene, timeline: PETAL_DANCE_TIMELINE },
};
