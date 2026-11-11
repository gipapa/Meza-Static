import { defineAdvancedTimeline } from './spec.ts';

/** 暴風雪: 環形雪暴. Independent 60-second seven-phase direction. */
export const BLIZZARD_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '暴風雪・宣言', durationMs: 8000 },
  { id: 'charge', label: '環形雪暴・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'blizzard-assault', label: '環形雪暴・連擊', durationMs: 16000 },
  { id: 'finale', label: '冰原終幕', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
