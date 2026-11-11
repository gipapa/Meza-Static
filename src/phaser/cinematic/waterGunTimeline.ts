import { defineAdvancedTimeline } from './spec.ts';

/** 水槍: 細流連射. Independent 60-second seven-phase direction. */
export const WATER_GUN_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '水槍・宣言', durationMs: 8000 },
  { id: 'charge', label: '細流連射・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'water-gun-assault', label: '細流連射・連擊', durationMs: 16000 },
  { id: 'finale', label: '激流水槍', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
