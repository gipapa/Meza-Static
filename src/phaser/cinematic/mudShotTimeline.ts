import { defineAdvancedTimeline } from './spec.ts';

/** 泥巴射擊: 泥流拋射. Independent 60-second seven-phase direction. */
export const MUD_SHOT_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '泥巴射擊・宣言', durationMs: 8000 },
  { id: 'charge', label: '泥流拋射・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'mud-shot-assault', label: '泥流拋射・連擊', durationMs: 16000 },
  { id: 'finale', label: '泥幕濺擊', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
