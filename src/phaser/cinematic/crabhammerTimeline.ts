import { defineAdvancedTimeline } from './spec.ts';

/** 蟹鉗錘: 鉗壓水錘. Independent 60-second seven-phase direction. */
export const CRABHAMMER_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '蟹鉗錘・宣言', durationMs: 8000 },
  { id: 'charge', label: '鉗壓水錘・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'crabhammer-assault', label: '鉗壓水錘・連擊', durationMs: 16000 },
  { id: 'finale', label: '深海重錘', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
