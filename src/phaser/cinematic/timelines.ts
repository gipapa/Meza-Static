/* ────────────────────────────────────────────────────────────────────
 *  Cinematic id → timeline. Pure (no Phaser), so `npm test` can check
 *  every registered cinematic against the 60 s spec (spec.ts).
 *
 *  CinematicId is the single source of truth for valid ids: registry.ts
 *  (scenes) and moveAnimations.ts (move names) are typed against it, so a
 *  move can't point at a missing cinematic and every cinematic needs a scene.
 *  ──────────────────────────────────────────────────────────────────── */
import { PETAL_DANCE_TIMELINE } from './petalDanceTimeline.ts';
import type { CinematicTimeline } from './timeline.ts';

export const CINEMATIC_TIMELINES = {
  'petal-dance': PETAL_DANCE_TIMELINE,
} as const satisfies Record<string, CinematicTimeline>;

export type CinematicId = keyof typeof CINEMATIC_TIMELINES;
