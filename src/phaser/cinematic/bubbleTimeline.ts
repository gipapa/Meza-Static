import { defineAdvancedTimeline } from './spec.ts';

/** 泡沫: 浮泡連鎖. Independent 60-second seven-phase direction. */
export const BUBBLE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '泡沫・宣言', durationMs: 8000 },
  { id: 'charge', label: '浮泡連鎖・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'bubble-assault', label: '浮泡連鎖・連擊', durationMs: 16000 },
  { id: 'finale', label: '水泡綻放', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
