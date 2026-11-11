import { defineAdvancedTimeline } from './spec.ts';

/** 衝浪: 潮峰推進. Independent 60-second seven-phase direction. */
export const SURF_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '衝浪・宣言', durationMs: 8000 },
  { id: 'charge', label: '潮峰推進・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'surf-assault', label: '潮峰推進・連擊', durationMs: 16000 },
  { id: 'finale', label: '怒海巨浪', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
