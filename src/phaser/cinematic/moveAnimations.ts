/* ────────────────────────────────────────────────────────────────────
 *  Which animation a move plays — pure, no Phaser imports (unit-testable).
 *
 *  To add an advanced animation for another move:
 *    1. write a CinematicScene subclass + its timeline,
 *    2. register it in cinematic/registry.ts under a new id,
 *    3. map the move name to that id below.
 *  Moves without an entry always fall back to the simple animation.
 *  ──────────────────────────────────────────────────────────────────── */
import type { AnimationQuality } from '../../lib/settings';

export const ADVANCED_MOVE_ANIMATIONS: Readonly<Record<string, string>> = {
  花瓣舞: 'petal-dance',
};

export type MoveAnimationChoice =
  | { variant: 'simple' }
  | { variant: 'advanced'; id: string };

export function hasAdvancedAnimation(moveName: string): boolean {
  return Object.prototype.hasOwnProperty.call(ADVANCED_MOVE_ANIMATIONS, moveName);
}

export function resolveMoveAnimation(moveName: string, quality: AnimationQuality): MoveAnimationChoice {
  if (quality === 'advanced' && hasAdvancedAnimation(moveName)) {
    return { variant: 'advanced', id: ADVANCED_MOVE_ANIMATIONS[moveName] };
  }
  return { variant: 'simple' };
}
