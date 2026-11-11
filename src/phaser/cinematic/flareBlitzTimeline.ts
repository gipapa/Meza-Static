import { defineAdvancedTimeline } from './spec.ts';

/** 閃焰衝鋒: 焰流突進. Independent 60-second seven-phase direction. */
export const FLARE_BLITZ_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '閃焰衝鋒・宣言', durationMs: 8000 },
  { id: 'charge', label: '焰流突進・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'flare-blitz-assault', label: '焰流突進・連擊', durationMs: 16000 },
  { id: 'finale', label: '赤焰衝天', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
