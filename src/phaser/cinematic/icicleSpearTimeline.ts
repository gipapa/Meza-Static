import { defineAdvancedTimeline } from './spec.ts';

/** 冰錐: 晶柱連射. Independent 60-second seven-phase direction. */
export const ICICLE_SPEAR_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '冰錐・宣言', durationMs: 8000 },
  { id: 'charge', label: '晶柱連射・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'icicle-spear-assault', label: '晶柱連射・連擊', durationMs: 16000 },
  { id: 'finale', label: '霜晶穿刺', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
