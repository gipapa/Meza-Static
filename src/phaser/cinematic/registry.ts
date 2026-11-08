import type Phaser from 'phaser';
import PetalDanceScene, { PETAL_DANCE_SCENE_KEY } from './PetalDanceScene';
import SolarBeamScene, { SOLAR_BEAM_SCENE_KEY } from './SolarBeamScene';
import { CINEMATIC_TIMELINES } from './timelines';
import type { CinematicId } from './timelines';
import type { CinematicTimeline } from './timeline';

export interface CinematicEntry {
  /** Phaser scene key (unique per cinematic). */
  key: string;
  scene: new () => Phaser.Scene;
  timeline: CinematicTimeline;
}

/**
 * Advanced cinematic id → scene. One scene class per move (no shared
 * mega-switch). Typed by CinematicId, so every timeline in timelines.ts must
 * have a scene here. Move names map to ids in moveAnimations.ts.
 */
export const CINEMATICS: Readonly<Record<CinematicId, CinematicEntry>> = {
  'petal-dance': { key: PETAL_DANCE_SCENE_KEY, scene: PetalDanceScene, timeline: CINEMATIC_TIMELINES['petal-dance'] },
  'solar-beam': { key: SOLAR_BEAM_SCENE_KEY, scene: SolarBeamScene, timeline: CINEMATIC_TIMELINES['solar-beam'] },
};

/** Lookup for ids coming from outside the type system (returns undefined if unknown). */
export function getCinematic(id: string): CinematicEntry | undefined {
  return Object.prototype.hasOwnProperty.call(CINEMATICS, id) ? CINEMATICS[id as CinematicId] : undefined;
}
