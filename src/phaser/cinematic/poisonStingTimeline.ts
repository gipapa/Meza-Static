import { defineAdvancedTimeline } from './spec.ts';

/** 毒針: 細針連射. Independent 60-second seven-phase direction. */
export const POISON_STING_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '毒針・宣言', durationMs: 8000 },
  { id: 'charge', label: '細針連射・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'poison-sting-assault', label: '細針連射・連擊', durationMs: 16000 },
  { id: 'finale', label: '紫針穿擊', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
