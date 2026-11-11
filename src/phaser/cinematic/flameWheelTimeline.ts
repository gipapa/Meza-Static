import { defineAdvancedTimeline } from './spec.ts';

/** 火焰車: 烈焰輪轉. Independent 60-second seven-phase direction. */
export const FLAME_WHEEL_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '火焰車・宣言', durationMs: 8000 },
  { id: 'charge', label: '烈焰輪轉・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'flame-wheel-assault', label: '烈焰輪轉・連擊', durationMs: 16000 },
  { id: 'finale', label: '炎輪疾走', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
