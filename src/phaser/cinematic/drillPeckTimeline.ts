import { defineAdvancedTimeline } from './spec.ts';

/** 鑽喙: 高速螺旋. Independent 60-second seven-phase direction. */
export const DRILL_PECK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '鑽喙・宣言', durationMs: 8000 },
  { id: 'charge', label: '高速螺旋・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'drill-peck-assault', label: '高速螺旋・連擊', durationMs: 16000 },
  { id: 'finale', label: '鑽風貫穿', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
