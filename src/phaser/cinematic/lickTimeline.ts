import { defineAdvancedTimeline } from './spec.ts';

/** 舔舐: 幽光長舌. Independent 60-second seven-phase direction. */
export const LICK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '舔舐・宣言', durationMs: 8000 },
  { id: 'charge', label: '幽光長舌・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'lick-assault', label: '幽光長舌・連擊', durationMs: 16000 },
  { id: 'finale', label: '幽影纏身', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
