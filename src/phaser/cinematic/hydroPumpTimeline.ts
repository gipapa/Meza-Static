import { defineAdvancedTimeline } from './spec.ts';

/** 水炮: 高壓水柱. Independent 60-second seven-phase direction. */
export const HYDRO_PUMP_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '水炮・宣言', durationMs: 8000 },
  { id: 'charge', label: '高壓水柱・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'hydro-pump-assault', label: '高壓水柱・連擊', durationMs: 16000 },
  { id: 'finale', label: '深藍水炮', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
