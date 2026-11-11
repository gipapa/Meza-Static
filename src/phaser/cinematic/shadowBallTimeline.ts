import { defineAdvancedTimeline } from './spec.ts';

/** 暗影球: 暗核旋流. Independent 60-second seven-phase direction. */
export const SHADOW_BALL_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '暗影球・宣言', durationMs: 8000 },
  { id: 'charge', label: '暗核旋流・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'shadow-ball-assault', label: '暗核旋流・連擊', durationMs: 16000 },
  { id: 'finale', label: '虛空暗爆', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
