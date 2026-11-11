import { defineAdvancedTimeline } from './spec.ts';

/** 溶解液: 酸霧滴落. Independent 60-second seven-phase direction. */
export const ACID_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '溶解液・宣言', durationMs: 8000 },
  { id: 'charge', label: '酸霧滴落・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'acid-assault', label: '酸霧滴落・連擊', durationMs: 16000 },
  { id: 'finale', label: '酸蝕沸騰', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
