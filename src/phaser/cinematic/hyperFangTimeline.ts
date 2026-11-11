import { defineAdvancedTimeline } from './spec.ts';

/** 必殺門牙: 雙刃咬合. Independent 60-second seven-phase direction. */
export const HYPER_FANG_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '必殺門牙・宣言', durationMs: 8000 },
  { id: 'charge', label: '雙刃咬合・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'hyper-fang-assault', label: '雙刃咬合・連擊', durationMs: 16000 },
  { id: 'finale', label: '必殺斷牙', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
