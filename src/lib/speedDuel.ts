export type SpeedDuelStage = 'fast' | 'ready' | 'running' | 'won' | 'lost';

/** How far (in % of arena height) the split line leans: left end lower, right end higher. */
export const DUEL_TILT = 8;
/** Split height before any taps (centre of the arena). */
const START_SPLIT = 50;
/** Closest the line gets to the enemy edge before the last tap wins. */
const MAX_PUSH_SPLIT = 10;

export interface DuelGeometry {
  /** Centre height of the split line, % from the top. Enemy is above, ally below. */
  split: number;
  /** Height of the line at the left edge, % from the top. */
  left: number;
  /** Height of the line at the right edge, % from the top. */
  right: number;
}

/**
 * Where the dividing line sits: every tap pushes it up toward the enemy;
 * a win gives the whole arena to the ally, a loss to the enemy.
 */
export function duelGeometry(stage: SpeedDuelStage, taps: number, target: number): DuelGeometry {
  if (stage === 'won') return { split: 0, left: 0, right: 0 };
  if (stage === 'lost') return { split: 100, left: 100, right: 100 };
  const progress = target > 0 ? Math.min(1, Math.max(0, taps / target)) : 0;
  const split = START_SPLIT - (START_SPLIT - MAX_PUSH_SPLIT) * progress;
  return { split, left: split + DUEL_TILT, right: split - DUEL_TILT };
}

/** CSS clip-path for the ally (bottom) side. Same point count in every state so it animates. */
export function allyClipPath({ left, right }: DuelGeometry): string {
  return `polygon(0% ${left}%, 100% ${right}%, 100% 100%, 0% 100%)`;
}

/** CSS clip-path for the glowing split line, a thin band along the edge. */
export function splitLineClipPath({ left, right }: DuelGeometry, half = 0.8): string {
  return `polygon(0% ${left - half}%, 100% ${right - half}%, 100% ${right + half}%, 0% ${left + half}%)`;
}
