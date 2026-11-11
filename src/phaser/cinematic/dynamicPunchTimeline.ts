import { defineAdvancedTimeline } from './spec.ts';

/** 爆裂拳: 爆震拳風. Independent 60-second seven-phase direction. */
export const DYNAMIC_PUNCH_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '爆裂拳・宣言', durationMs: 8000 },
  { id: 'charge', label: '爆震拳風・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'dynamic-punch-assault', label: '爆震拳風・連擊', durationMs: 16000 },
  { id: 'finale', label: '爆裂重拳', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
