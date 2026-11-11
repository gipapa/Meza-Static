import { defineAdvancedTimeline } from './spec.ts';

/** 空手劈: 垂直掌刃. Independent 60-second seven-phase direction. */
export const KARATE_CHOP_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '空手劈・宣言', durationMs: 8000 },
  { id: 'charge', label: '垂直掌刃・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'karate-chop-assault', label: '垂直掌刃・連擊', durationMs: 16000 },
  { id: 'finale', label: '赤手斷空', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
