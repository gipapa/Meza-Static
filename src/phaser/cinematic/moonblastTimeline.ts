import { defineAdvancedTimeline } from './spec.ts';

/** 月亮之力: 月華凝光. Independent 60-second seven-phase direction. */
export const MOONBLAST_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '月亮之力・宣言', durationMs: 8000 },
  { id: 'charge', label: '月華凝光・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'moonblast-assault', label: '月華凝光・連擊', durationMs: 16000 },
  { id: 'finale', label: '銀月裁光', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
