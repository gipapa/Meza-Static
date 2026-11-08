/* ────────────────────────────────────────────────────────────────────
 *  Which animation a move plays — pure, no Phaser imports (unit-testable).
 *
 *  To add an advanced animation for another move, follow
 *  .claude/skills/advanced-move-animation/SKILL.md:
 *    1. <id>Timeline.ts (defineAdvancedTimeline, 60 s) + timelines.ts entry,
 *    2. <Name>Scene.ts (CinematicScene subclass) + registry.ts entry,
 *    3. map the move name to that id below.
 *  Moves without an entry always fall back to the simple animation.
 *  ──────────────────────────────────────────────────────────────────── */
import type { AnimationQuality } from '../../lib/settings';
import type { CinematicId } from './timelines.ts';

/** Move name (exact, as in data/monsters.ts) → cinematic id. */
export const ADVANCED_MOVE_ANIMATIONS: Readonly<Record<string, CinematicId>> = {
  花瓣舞: 'petal-dance',
  日光束: 'solar-beam',
};

export type MoveAnimationChoice =
  | { variant: 'simple' }
  | { variant: 'advanced'; id: CinematicId };

export function hasAdvancedAnimation(moveName: string): boolean {
  return Object.prototype.hasOwnProperty.call(ADVANCED_MOVE_ANIMATIONS, moveName);
}

export function resolveMoveAnimation(moveName: string, quality: AnimationQuality): MoveAnimationChoice {
  if (quality === 'advanced' && hasAdvancedAnimation(moveName)) {
    return { variant: 'advanced', id: ADVANCED_MOVE_ANIMATIONS[moveName] };
  }
  return { variant: 'simple' };
}
