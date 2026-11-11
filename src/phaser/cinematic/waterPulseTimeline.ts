import { defineAdvancedTimeline } from './spec.ts';

/** 水之波動: 漣漪共振. Independent 60-second seven-phase direction. */
export const WATER_PULSE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '水之波動・宣言', durationMs: 8000 },
  { id: 'charge', label: '漣漪共振・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'water-pulse-assault', label: '漣漪共振・連擊', durationMs: 16000 },
  { id: 'finale', label: '深海脈衝', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
