import { defineAdvancedTimeline } from './spec.ts';

/** 藤鞭: 雙藤交纏. Independent 60-second seven-phase direction. */
export const VINE_WHIP_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '藤鞭・宣言', durationMs: 8000 },
  { id: 'charge', label: '雙藤交纏・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'vine-whip-assault', label: '雙藤交纏・連擊', durationMs: 16000 },
  { id: 'finale', label: '藤影連鞭', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
