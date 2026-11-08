import { useMemo } from 'react';
import Phaser from 'phaser';
import PhaserContainer from './PhaserContainer';
import BattleScene, { BATTLE_SCENE_KEY } from './BattleScene';
import type { BattleSceneData } from './BattleScene';
import type { Tag } from '../types';
import { TYPE_COLORS } from '../data/monsters';
import { useNameReveal } from '../lib/nameMask';
import { characterIdOf } from '../lib/characterImages';
import { typeEmojiOf } from '../lib/characterArt';
import { useActorArt } from './useActorArt';

interface Props {
  enemy: Tag;
  ally: Tag;
  isPlayerAttacking: boolean;
  moveType: string;
  moveName: string;
  damage: number;
  onComplete: () => void;
}

const CONFIG = {
  type: Phaser.AUTO,
  width: 320,
  height: 400,
  transparent: false,
  banner: false,
  audio: { noAudio: true },
} as const;

/**
 * Drop-in replacement for BattleOverlayAnimation.
 * Renders a Phaser canvas inside a full-screen overlay with
 * camera effects, particle explosions, type-specific projectile paths.
 */
export default function PhaserBattleOverlay({
  enemy, ally, isPlayerAttacking, moveType, moveName, damage, onComplete,
}: Props) {
  const { dn } = useNameReveal();
  // Explicit slots: [0] = enemy, [1] = ally. Never reorder by role.
  const { ready, arts: [enemyArt, allyArt] } = useActorArt([characterIdOf(enemy), characterIdOf(ally)]);

  // Pass both sides as-is (enemy = top, ally = bottom). The scene decides who
  // moves from `isPlayerAttacking`; no attacker/defender swapping here.
  const sceneData: BattleSceneData | null = useMemo(() => (ready ? {
    enemy: { name: dn(enemy.name), emoji: typeEmojiOf(enemy), ...enemyArt },
    ally: { name: dn(ally.name), emoji: typeEmojiOf(ally), ...allyArt },
    isPlayerAttacking,
    moveType,
    moveName,
    damage,
    typeColor: TYPE_COLORS[moveType] || '#A78BFA',
    onComplete,
  } : null), [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ width: CONFIG.width, height: CONFIG.height, background: '#0a0a14' }}>
        {sceneData && <PhaserContainer config={CONFIG} scene={BattleScene} sceneKey={BATTLE_SCENE_KEY} data={sceneData} />}
      </div>
    </div>
  );
}
