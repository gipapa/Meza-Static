import { defineAdvancedTimeline } from './spec.ts';

/** 龍捲風: 螺旋風柱. Independent 60-second seven-phase direction. */
export const TWISTER_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '龍捲風・宣言', durationMs: 8000 },
  { id: 'charge', label: '螺旋風柱・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'twister-assault', label: '螺旋風柱・連擊', durationMs: 16000 },
  { id: 'finale', label: '龍威旋渦', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
