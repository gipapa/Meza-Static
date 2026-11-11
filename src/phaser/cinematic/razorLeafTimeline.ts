import { defineAdvancedTimeline } from './spec.ts';

/** 飛葉快刀: 迴旋葉刃. Independent 60-second seven-phase direction. */
export const RAZOR_LEAF_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '飛葉快刀・宣言', durationMs: 8000 },
  { id: 'charge', label: '迴旋葉刃・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'razor-leaf-assault', label: '迴旋葉刃・連擊', durationMs: 16000 },
  { id: 'finale', label: '翠葉千刃', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
