/**
 * 屬性相剋系統
 * 基於寶可夢官方屬性相剋表
 * 只看怪獸之間的屬性（不看招式屬性）
 */

import { TYPE_NAMES_ZH } from '../data/monsters';

/** ZH→EN lookup (reverse of TYPE_NAMES_ZH) */
const ZH_TO_EN: Record<string, string> = {};
for (const [en, zh] of Object.entries(TYPE_NAMES_ZH)) {
  ZH_TO_EN[zh] = en;
}

/** Raw type chart data (using Chinese names, matching the user-provided JSON) */
interface TypeEntry {
  name: string;
  super_effective_against: string[];   // 超級有效 → 2×
  ineffective_against: string[];       // 效果不大 → 0.5×
  no_effect_against?: string[];        // 無效     → 0×
}

const RAW_CHART: TypeEntry[] = [
  { name: '火', super_effective_against: ['草','冰','蟲','鋼'], ineffective_against: ['火','水','岩石','龍'] },
  { name: '水', super_effective_against: ['火','地面','岩石'], ineffective_against: ['水','草','龍'] },
  { name: '草', super_effective_against: ['水','地面','岩石'], ineffective_against: ['火','草','毒','飛行','蟲','龍','鋼'] },
  { name: '電', super_effective_against: ['水','飛行'], ineffective_against: ['草','電','龍'], no_effect_against: ['地面'] },
  { name: '冰', super_effective_against: ['草','地面','飛行','龍'], ineffective_against: ['火','水','冰','鋼'] },
  { name: '格鬥', super_effective_against: ['一般','冰','岩石','惡','鋼'], ineffective_against: ['毒','飛行','超能力','蟲','妖精'], no_effect_against: ['幽靈'] },
  { name: '毒', super_effective_against: ['草','妖精'], ineffective_against: ['毒','地面','岩石','幽靈'], no_effect_against: ['鋼'] },
  { name: '地面', super_effective_against: ['火','電','毒','岩石','鋼'], ineffective_against: ['草','蟲'], no_effect_against: ['飛行'] },
  { name: '飛行', super_effective_against: ['草','格鬥','蟲'], ineffective_against: ['電','岩石','鋼'] },
  { name: '超能力', super_effective_against: ['格鬥','毒'], ineffective_against: ['超能力','鋼'], no_effect_against: ['惡'] },
  { name: '蟲', super_effective_against: ['草','超能力','惡'], ineffective_against: ['火','格鬥','毒','飛行','幽靈','鋼','妖精'] },
  { name: '岩石', super_effective_against: ['火','冰','飛行','蟲'], ineffective_against: ['格鬥','地面','鋼'] },
  { name: '幽靈', super_effective_against: ['超能力','幽靈'], ineffective_against: ['惡'], no_effect_against: ['一般'] },
  { name: '龍', super_effective_against: ['龍'], ineffective_against: ['鋼'], no_effect_against: ['妖精'] },
  { name: '惡', super_effective_against: ['超能力','幽靈'], ineffective_against: ['格鬥','惡','妖精'] },
  { name: '鋼', super_effective_against: ['冰','岩石','妖精'], ineffective_against: ['火','水','電','鋼'] },
  { name: '妖精', super_effective_against: ['格鬥','龍','惡'], ineffective_against: ['火','毒','鋼'] },
  { name: '一般', super_effective_against: [], ineffective_against: ['岩石','鋼'], no_effect_against: ['幽靈'] },
];

/**
 * Pre-built lookup:  EFFECTIVENESS[attackerType_EN][defenderType_EN] → multiplier
 *   2   = super effective
 *   0.5 = not very effective
 *   0   = no effect
 *   1   = normal
 */
const EFFECTIVENESS: Record<string, Record<string, number>> = {};

for (const entry of RAW_CHART) {
  const atkEn = ZH_TO_EN[entry.name];
  if (!atkEn) continue;
  EFFECTIVENESS[atkEn] = {};

  for (const zh of entry.super_effective_against) {
    const en = ZH_TO_EN[zh];
    if (en) EFFECTIVENESS[atkEn][en] = 2;
  }
  for (const zh of entry.ineffective_against) {
    const en = ZH_TO_EN[zh];
    if (en) EFFECTIVENESS[atkEn][en] = 0.5;
  }
  for (const zh of (entry.no_effect_against ?? [])) {
    const en = ZH_TO_EN[zh];
    if (en) EFFECTIVENESS[atkEn][en] = 0;
  }
}

/**
 * Get the type effectiveness multiplier when an attacker's type attacks a defender's type.
 * Returns the combined multiplier considering multi-type defenders.
 *
 * @param attackerTypes - attacker monster types (EN keys, e.g. ['fire','dragon'])
 * @param defenderTypes - defender monster types (EN keys)
 * @returns multiplier (0, 0.25, 0.5, 1, 2, 4)
 */
export function getTypeMultiplier(attackerTypes: string[], defenderTypes: string[]): number {
  // We use the attacker's PRIMARY type to determine effectiveness against each of the defender's types
  const atkType = attackerTypes[0];
  if (!atkType) return 1;

  let mult = 1;
  for (const defType of defenderTypes) {
    const m = EFFECTIVENESS[atkType]?.[defType] ?? 1;
    mult *= m;
  }
  return mult;
}

/**
 * Human-readable effectiveness label
 */
export function getEffectivenessLabel(multiplier: number): string | null {
  if (multiplier === 0) return '無效！';
  if (multiplier >= 2) return '超級有效！';
  if (multiplier > 0 && multiplier < 1) return '效果不大...';
  return null; // normal, no label needed
}

/**
 * CSS color for effectiveness label
 */
export function getEffectivenessColor(multiplier: number): string {
  if (multiplier === 0) return '#6B7280';
  if (multiplier >= 2) return '#EF4444';
  if (multiplier > 0 && multiplier < 1) return '#94A3B8';
  return '#E2E8F0';
}

/** All 18 type keys in display order */
export const ALL_TYPES: string[] = RAW_CHART.map(e => ZH_TO_EN[e.name]).filter(Boolean);

/** Get effectiveness multiplier for one attacker type vs one defender type */
export function getSingleMultiplier(atkEN: string, defEN: string): number {
  return EFFECTIVENESS[atkEN]?.[defEN] ?? 1;
}
