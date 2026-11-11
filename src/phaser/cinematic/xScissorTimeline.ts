import { defineAdvancedTimeline } from './spec.ts';

/** 十字剪: 雙刃交叉. Independent 60-second seven-phase direction. */
export const X_SCISSOR_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '十字剪・宣言', durationMs: 8000 },
  { id: 'charge', label: '雙刃交叉・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'x-scissor-assault', label: '雙刃交叉・連擊', durationMs: 16000 },
  { id: 'finale', label: '十字斷空', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
