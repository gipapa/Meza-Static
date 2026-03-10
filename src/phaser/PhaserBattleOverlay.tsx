import { useMemo } from 'react';
import Phaser from 'phaser';
import PhaserContainer from './PhaserContainer';
import BattleScene, { setBattleSceneData } from './BattleScene';
import type { BattleSceneData } from './BattleScene';
import type { Tag } from '../types';
import { TYPE_COLORS, TYPE_EMOJI } from '../data/monsters';
import { useNameReveal } from '../lib/nameMask';

interface Props {
  enemy: Tag;
  ally: Tag;
  isPlayerAttacking: boolean;
  moveType: string;
  moveName: string;
  damage: number;
  onComplete: () => void;
}

/**
 * Drop-in replacement for BattleOverlayAnimation.
 * Renders a Phaser canvas inside a full-screen overlay with
 * camera effects, particle explosions, type-specific projectile paths.
 */
export default function PhaserBattleOverlay({
  enemy, ally, isPlayerAttacking, moveType, moveName, damage, onComplete,
}: Props) {
  const { dn } = useNameReveal();

  const attacker = isPlayerAttacking ? ally : enemy;
  const defender = isPlayerAttacking ? enemy : ally;
  const typeColor = TYPE_COLORS[moveType] || '#A78BFA';
  const attackerEmoji = TYPE_EMOJI[attacker.types[0]] || '⚪';
  const defenderEmoji = TYPE_EMOJI[defender.types[0]] || '⚪';

  // Set data before Phaser game is created (module-level hand-off)
  const sceneData: BattleSceneData = useMemo(() => {
    const data: BattleSceneData = {
      isPlayerAttacking,
      moveType,
      moveName,
      damage,
      attackerName: dn(attacker.name),
      defenderName: dn(defender.name),
      attackerEmoji,
      defenderEmoji,
      typeColor,
      onComplete,
    };
    setBattleSceneData(data);
    return data;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const config = useMemo(() => ({
    type: Phaser.AUTO,
    width: 320,
    height: 400,
    transparent: false,
    banner: false,
    audio: { noAudio: true },
    scene: [BattleScene],
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  void sceneData; // used for side-effect in useMemo

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <PhaserContainer config={config} />
      </div>
    </div>
  );
}
