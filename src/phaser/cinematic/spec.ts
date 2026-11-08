/* ────────────────────────────────────────────────────────────────────
 *  Advanced move cinematic spec — pure, no Phaser imports (unit-testable).
 *
 *  Every advanced move animation is exactly 60 s and follows the same
 *  7-beat skeleton (Super Robot Wars style). Six phase ids are fixed; the
 *  fifth phase is the move's own attack body and its id is move-specific
 *  (花瓣舞 uses 'storm', a fire move might use 'inferno').
 *
 *  See .claude/skills/advanced-move-animation/SKILL.md for the full spec.
 *  ──────────────────────────────────────────────────────────────────── */
import { defineTimeline } from './timeline.ts';
import type { CinematicPhaseSpec, CinematicTimeline } from './timeline.ts';

/** Fixed total length of every advanced move cinematic. */
export const ADVANCED_MOVE_DURATION_MS = 60_000;

/**
 * Runtime tolerance when verifying with deterministic frame stepping (one
 * 30 fps frame plus margin). Phase/onComplete cues must fire within this
 * window of their design time. Real-time playback on slow devices can lag
 * further because of Phaser's lag smoothing; that is accepted.
 */
export const RUNTIME_TOLERANCE_MS = 100;

export type PhaseRole = 'intro' | 'cutin' | 'charge' | 'release' | 'main' | 'finale' | 'aftermath';

export interface PhaseRule {
  role: PhaseRole;
  /** Required phase id; null = move-specific id (the attack body). */
  id: string | null;
  minMs: number;
  maxMs: number;
  /** Default length used by the template (sums to 60 s). */
  defaultMs: number;
  purpose: string;
}

/** The 7-beat skeleton, in order. Defaults sum to ADVANCED_MOVE_DURATION_MS. */
export const PHASE_RULES: readonly PhaseRule[] = [
  { role: 'intro', id: 'intro', minMs: 3000, maxMs: 6000, defaultMs: 5000, purpose: '雙人鏡頭、ATTACK 警告帶、攻擊方標示' },
  { role: 'cutin', id: 'cutin', minMs: 6000, maxMs: 10000, defaultMs: 8000, purpose: '攻擊方 cut-in 台詞 → 招式名稱標題卡' },
  { role: 'charge', id: 'charge', minMs: 8000, maxMs: 13000, defaultMs: 11000, purpose: '攻擊方特寫：集中線、氣場、蓄力量表、eye-catch、白閃' },
  { role: 'release', id: 'release', minMs: 3000, maxMs: 6000, defaultMs: 4000, purpose: '爆發衝擊波 → 能量從攻擊方送往防守方' },
  { role: 'main', id: null, minMs: 12000, maxMs: 20000, defaultMs: 16000, purpose: '招式本體：多波命中、HIT 計數、鏡頭切換' },
  { role: 'finale', id: 'finale', minMs: 7000, maxMs: 11000, defaultMs: 9000, purpose: '終結技名稱、eye-catch、最大衝擊' },
  { role: 'aftermath', id: 'aftermath', minMs: 5000, maxMs: 8000, defaultMs: 7000, purpose: '餘韻、總傷害、FINISH、淡出' },
];

/** kebab-case ids, e.g. 'petal-dance', 'storm'. */
const ID_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** All rule violations of a timeline (empty = valid). */
export function validateAdvancedTimeline(tl: CinematicTimeline): string[] {
  const errors: string[] = [];
  if (tl.totalMs !== ADVANCED_MOVE_DURATION_MS) {
    errors.push(`total must be exactly ${ADVANCED_MOVE_DURATION_MS}ms, got ${tl.totalMs}ms`);
  }
  if (tl.phases.length !== PHASE_RULES.length) {
    errors.push(`expected ${PHASE_RULES.length} phases, got ${tl.phases.length}`);
    return errors;
  }
  const fixedIds = new Set(PHASE_RULES.map(r => r.id).filter((x): x is string => !!x));
  tl.phases.forEach((p, i) => {
    const rule = PHASE_RULES[i];
    const dur = p.end - p.start;
    if (rule.id !== null && p.id !== rule.id) errors.push(`phase ${i + 1} must be "${rule.id}", got "${p.id}"`);
    if (rule.id === null && (fixedIds.has(p.id) || !ID_RE.test(p.id))) {
      errors.push(`phase ${i + 1} (attack body) needs a move-specific kebab-case id, got "${p.id}"`);
    }
    if (dur < rule.minMs || dur > rule.maxMs) {
      errors.push(`phase "${p.id}" lasts ${dur}ms, allowed ${rule.minMs}–${rule.maxMs}ms`);
    }
    if (!p.label.trim()) errors.push(`phase "${p.id}" needs a label`);
    if (i > 0 && p.start !== tl.phases[i - 1].end) errors.push(`phase "${p.id}" is not contiguous`);
  });
  return errors;
}

/**
 * defineTimeline + spec check. Use this for every advanced move so an
 * invalid timeline fails at import time (and in `npm test`).
 */
export function defineAdvancedTimeline(spec: readonly CinematicPhaseSpec[]): CinematicTimeline {
  const tl = defineTimeline(spec);
  const errors = validateAdvancedTimeline(tl);
  if (errors.length) throw new Error(`invalid advanced timeline:\n- ${errors.join('\n- ')}`);
  return tl;
}

export function isCinematicId(id: string): boolean {
  return ID_RE.test(id);
}
