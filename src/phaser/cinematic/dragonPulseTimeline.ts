import { defineAdvancedTimeline } from './spec.ts';

/** 龍之波動: 交錯龍息. Independent 60-second seven-phase direction. */
export const DRAGON_PULSE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '龍之波動・宣言', durationMs: 8000 },
  { id: 'charge', label: '交錯龍息・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'dragon-pulse-assault', label: '交錯龍息・連擊', durationMs: 16000 },
  { id: 'finale', label: '蒼龍脈流', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
