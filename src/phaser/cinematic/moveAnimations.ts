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
  逆鱗: 'outrage',
  大字爆炎: 'fire-blast',
  火花: 'ember',
  火焰牙: 'fire-fang',
  火焰車: 'flame-wheel',
  閃焰衝鋒: 'flare-blitz',
  噴射火焰: 'flamethrower',
  水之波動: 'water-pulse',
  水流尾: 'aqua-tail',
  水炮: 'hydro-pump',
  水槍: 'water-gun',
  泡沫: 'bubble',
  泡沫光線: 'bubble-beam',
  衝浪: 'surf',
  瀑布: 'waterfall',
  蟹鉗錘: 'crabhammer',
  吸取: 'absorb',
  飛葉快刀: 'razor-leaf',
  強力鞭打: 'power-whip',
  種子炸彈: 'seed-bomb',
  藤鞭: 'vine-whip',
  十萬伏特: 'thunderbolt',
  打雷: 'thunder',
  放電: 'discharge',
  電擊: 'thunder-shock',
  幻象光線: 'psybeam',
  念力: 'confusion',
  精神強念: 'psychic',
  精神擊破: 'psystrike',
  咬住: 'bite',
  龍之波動: 'dragon-pulse',
  龍捲風: 'twister',
  月亮之力: 'moonblast',
  百萬噸飛踢: 'mega-kick',
  空手劈: 'karate-chop',
  近身戰: 'close-combat',
  劈瓦: 'brick-break',
  爆裂拳: 'dynamic-punch',
  三角攻擊: 'tri-attack',
  必殺門牙: 'hyper-fang',
  百萬噸拳擊: 'mega-punch',
  角撞: 'horn-attack',
  泰山壓頂: 'body-slam',
  捨身撞擊: 'double-edge',
  猛撞: 'take-down',
  電光一閃: 'quick-attack',
  劈開: 'slash',
  撞擊: 'tackle',
  冰凍光束: 'ice-beam',
  冰錐: 'icicle-spear',
  極光束: 'aurora-beam',
  暴風雪: 'blizzard',
  暗影球: 'shadow-ball',
  舔舐: 'lick',
  污泥攻擊: 'sludge',
  污泥炸彈: 'sludge-bomb',
  毒針: 'poison-sting',
  毒擊: 'poison-jab',
  溶解液: 'acid',
  大地之力: 'earth-power',
  地震: 'earthquake',
  泥巴射擊: 'mud-shot',
  挖洞: 'dig',
  骨棒: 'bone-club',
  空氣利刃: 'air-slash',
  翅膀攻擊: 'wing-attack',
  啄: 'peck',
  暴風: 'hurricane',
  鑽喙: 'drill-peck',
  十字剪: 'x-scissor',
  蟲咬: 'bug-bite',
  蟲鳴: 'bug-buzz',
  X剪刀: 'x-scissors',
  尖石攻擊: 'stone-edge',
  岩崩: 'rock-slide',
  落石: 'rock-throw',
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
