import type { Tag, BallType } from '../types';
import { randInt, rand } from './rng';
import { getTypeMultiplier } from './typeChart';

/**
 * Calculate damage for a player battle turn.
 * D = base * (1 + R/10) * (1 + clamp(M, 0, 60) / 200) * typeMult
 * base = atk + move.power + pe/10
 */
export function calcDamage(
  attacker: Tag,
  roulette: number,
  mashCount: number,
  defender?: Tag,
): number {
  const base = attacker.stats.atk + attacker.move.power + attacker.pe / 10;
  const rMult = 1 + roulette / 10;
  const mClamped = Math.min(Math.max(mashCount, 0), 60);
  const mMult = 1 + mClamped / 200;
  const typeMult = defender ? getTypeMultiplier(attacker.types, defender.types) : 1;
  return Math.round(base * rMult * mMult * typeMult);
}

/**
 * Calculate damage for an enemy (AI) attack.
 * Simpler formula — no roulette / mash.
 * D = (atk + move.power) * randomFactor * typeMult * defReduction
 */
export function calcEnemyDamage(attacker: Tag, defender: Tag): number {
  const base = attacker.stats.atk + attacker.move.power;
  const randomFactor = 0.85 + rand() * 0.30;        // 0.85 – 1.15
  const typeMult = getTypeMultiplier(attacker.types, defender.types);
  const defReduction = 1 / (1 + defender.stats.def / 200); // soft scale defence
  return Math.max(1, Math.round(base * randomFactor * typeMult * defReduction));
}

/**
 * Roll the attack roulette: returns 1-10
 */
export function rollAttackRoulette(): number {
  return randInt(1, 10);
}

/**
 * Roll the ball roulette: returns a ball type
 * Probabilities: Poké 40%, Great 30%, Ultra 20%, Master 10%
 */
export function rollBallRoulette(): BallType {
  const r = rand();
  if (r < 0.40) return 'poke';
  if (r < 0.70) return 'great';
  if (r < 0.90) return 'ultra';
  return 'master';
}

/**
 * Calculate catch success probability
 */
export function calcCatchChance(ball: BallType, catchGauge: number): number {
  const g = catchGauge / 100;
  switch (ball) {
    case 'poke': return 0.35 + 0.25 * g;
    case 'great': return 0.50 + 0.30 * g;
    case 'ultra': return 0.65 + 0.30 * g;
    case 'master': return 1.0;
  }
}

/**
 * Attempt catch
 */
export function attemptCatch(ball: BallType, catchGauge: number): boolean {
  return rand() < calcCatchChance(ball, catchGauge);
}

/**
 * Calculate boss max HP for an area
 */
export function calcBossMaxHp(boss: Tag): number {
  return boss.stats.hp * 3; // Boss has triple HP
}

/**
 * Calculate catch gauge increase from damage
 */
export function calcCatchGaugeIncrease(damage: number, bossMaxHp: number): number {
  return Math.min(100, (damage / bossMaxHp) * 100);
}

export const BALL_NAMES: Record<BallType, string> = {
  poke: '精靈球',
  great: '超級球',
  ultra: '高級球',
  master: '大師球',
};

export const BALL_COLORS: Record<BallType, string> = {
  poke: '#EF4444',
  great: '#3B82F6',
  ultra: '#FBBF24',
  master: '#8B5CF6',
};
