import { defineAdvancedTimeline } from './spec.ts';

/** 大地之力: 地脈噴發. Independent 60-second seven-phase direction. */
export const EARTH_POWER_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '大地之力・宣言', durationMs: 8000 },
  { id: 'charge', label: '地脈噴發・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'earth-power-assault', label: '地脈噴發・連擊', durationMs: 16000 },
  { id: 'finale', label: '地核怒湧', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
