import { defineAdvancedTimeline } from './spec.ts';

/** 精神強念: 重力光牢. Independent 60-second seven-phase direction. */
export const PSYCHIC_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '精神強念・宣言', durationMs: 8000 },
  { id: 'charge', label: '重力光牢・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'psychic-assault', label: '重力光牢・連擊', durationMs: 16000 },
  { id: 'finale', label: '精神震盪', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
