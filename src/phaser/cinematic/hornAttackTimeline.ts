import { defineAdvancedTimeline } from './spec.ts';

/** 角撞: 螺旋角光. Independent 60-second seven-phase direction. */
export const HORN_ATTACK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '角撞・宣言', durationMs: 8000 },
  { id: 'charge', label: '螺旋角光・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'horn-attack-assault', label: '螺旋角光・連擊', durationMs: 16000 },
  { id: 'finale', label: '角尖突貫', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
