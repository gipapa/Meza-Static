import { defineAdvancedTimeline } from './spec.ts';

/** 瀑布: 垂直落瀑. Independent 60-second seven-phase direction. */
export const WATERFALL_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '瀑布・宣言', durationMs: 8000 },
  { id: 'charge', label: '垂直落瀑・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'waterfall-assault', label: '垂直落瀑・連擊', durationMs: 16000 },
  { id: 'finale', label: '飛瀑千重', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
