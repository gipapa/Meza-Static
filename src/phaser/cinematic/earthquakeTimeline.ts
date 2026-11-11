import { defineAdvancedTimeline } from './spec.ts';

/** 地震: 斷層擴張. Independent 60-second seven-phase direction. */
export const EARTHQUAKE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '地震・宣言', durationMs: 8000 },
  { id: 'charge', label: '斷層擴張・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'earthquake-assault', label: '斷層擴張・連擊', durationMs: 16000 },
  { id: 'finale', label: '大地崩裂', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
