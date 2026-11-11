import { defineAdvancedTimeline } from './spec.ts';

/** 水流尾: 水鞭迴旋. Independent 60-second seven-phase direction. */
export const AQUA_TAIL_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '水流尾・宣言', durationMs: 8000 },
  { id: 'charge', label: '水鞭迴旋・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'aqua-tail-assault', label: '水鞭迴旋・連擊', durationMs: 16000 },
  { id: 'finale', label: '滄流迴擊', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
