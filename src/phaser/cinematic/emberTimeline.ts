import { defineAdvancedTimeline } from './spec.ts';

/** 火花: 火星燎原. Independent 60-second seven-phase direction. */
export const EMBER_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '火花・宣言', durationMs: 8000 },
  { id: 'charge', label: '火星燎原・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'ember-assault', label: '火星燎原・連擊', durationMs: 16000 },
  { id: 'finale', label: '紅蓮火種', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
