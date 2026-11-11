import { defineAdvancedTimeline } from './spec.ts';

/** 吸取: 逆流汲取. Independent 60-second seven-phase direction. */
export const ABSORB_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '吸取・宣言', durationMs: 8000 },
  { id: 'charge', label: '逆流汲取・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'absorb-assault', label: '逆流汲取・連擊', durationMs: 16000 },
  { id: 'finale', label: '生命回流', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
