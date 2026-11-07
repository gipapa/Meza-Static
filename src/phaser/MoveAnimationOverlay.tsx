import { lazy, Suspense, useState } from 'react';
import PhaserBattleOverlay from './PhaserBattleOverlay';
import { resolveMoveAnimation } from './cinematic/moveAnimations';
import { useSettings } from '../lib/useSettings';
import type { AnimationQuality } from '../lib/settings';
import type { Tag } from '../types';
import { TYPE_COLORS, TYPE_EMOJI, TYPE_NAMES_ZH } from '../data/monsters';
import { useNameReveal } from '../lib/nameMask';

// Cinematics are only downloaded when the player opts into advanced animations.
const AdvancedMoveOverlay = lazy(() => import('./cinematic/AdvancedMoveOverlay'));

interface Props {
  enemy: Tag;
  ally: Tag;
  isPlayerAttacking: boolean;
  moveType: string;
  moveName: string;
  damage: number;
  onComplete: () => void;
  /** Override the user setting (test pages). */
  quality?: AnimationQuality;
  /** Cinematic playback speed (test pages). */
  speed?: number;
  onPhase?: (id: string, label: string) => void;
}

/**
 * Picks the attack animation for a move:
 * - 'simple'   → PhaserBattleOverlay (the original short animation)
 * - 'advanced' → the move's cinematic if one exists, otherwise simple.
 * The choice is fixed at mount so changing settings mid-animation is safe.
 */
export default function MoveAnimationOverlay(props: Props) {
  const settings = useSettings();
  const { dn } = useNameReveal();
  const [choice] = useState(() => resolveMoveAnimation(props.moveName, props.quality ?? settings.animationQuality));

  if (choice.variant === 'advanced') {
    const { enemy, ally } = props;
    return (
      <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-black" />}>
        <AdvancedMoveOverlay
          cinematicId={choice.id}
          onComplete={props.onComplete}
          data={{
            enemy: { name: dn(enemy.name), emoji: TYPE_EMOJI[enemy.types[0]] || '⚪' },
            ally: { name: dn(ally.name), emoji: TYPE_EMOJI[ally.types[0]] || '⚪' },
            isPlayerAttacking: props.isPlayerAttacking,
            moveName: props.moveName,
            moveType: props.moveType,
            typeColor: TYPE_COLORS[props.moveType] || '#A78BFA',
            typeLabel: TYPE_NAMES_ZH[props.moveType],
            damage: props.damage,
            speed: props.speed,
            onPhase: props.onPhase,
          }}
        />
      </Suspense>
    );
  }

  return (
    <PhaserBattleOverlay
      enemy={props.enemy}
      ally={props.ally}
      isPlayerAttacking={props.isPlayerAttacking}
      moveType={props.moveType}
      moveName={props.moveName}
      damage={props.damage}
      onComplete={props.onComplete}
    />
  );
}
