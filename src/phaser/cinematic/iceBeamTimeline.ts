import { defineAdvancedTimeline } from './spec.ts';

/** 冰凍光束: 凍結直線. Independent 60-second seven-phase direction. */
export const ICE_BEAM_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '冰凍光束・宣言', durationMs: 8000 },
  { id: 'charge', label: '凍結直線・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'ice-beam-assault', label: '凍結直線・連擊', durationMs: 16000 },
  { id: 'finale', label: '零度貫穿', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
