import { defineAdvancedTimeline } from './spec.ts';

/** 電擊: 跳躍電火. Independent 60-second seven-phase direction. */
export const THUNDER_SHOCK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '電擊・宣言', durationMs: 8000 },
  { id: 'charge', label: '跳躍電火・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'thunder-shock-assault', label: '跳躍電火・連擊', durationMs: 16000 },
  { id: 'finale', label: '閃電一擊', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
