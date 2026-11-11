import { defineAdvancedTimeline } from './spec.ts';

/** 劈瓦: 瓦層破碎. Independent 60-second seven-phase direction. */
export const BRICK_BREAK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '劈瓦・宣言', durationMs: 8000 },
  { id: 'charge', label: '瓦層破碎・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'brick-break-assault', label: '瓦層破碎・連擊', durationMs: 16000 },
  { id: 'finale', label: '碎壁掌刃', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
