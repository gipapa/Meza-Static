import { defineAdvancedTimeline } from './spec.ts';

/** 放電: 全域電環. Independent 60-second seven-phase direction. */
export const DISCHARGE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '放電・宣言', durationMs: 8000 },
  { id: 'charge', label: '全域電環・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'discharge-assault', label: '全域電環・連擊', durationMs: 16000 },
  { id: 'finale', label: '雷網擴散', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
