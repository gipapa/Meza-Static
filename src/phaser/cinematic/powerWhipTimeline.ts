import { defineAdvancedTimeline } from './spec.ts';

/** 強力鞭打: 重藤三迴. Independent 60-second seven-phase direction. */
export const POWER_WHIP_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '強力鞭打・宣言', durationMs: 8000 },
  { id: 'charge', label: '重藤三迴・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'power-whip-assault', label: '重藤三迴・連擊', durationMs: 16000 },
  { id: 'finale', label: '巨藤斷空', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
