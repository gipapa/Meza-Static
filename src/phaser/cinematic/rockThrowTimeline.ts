import { defineAdvancedTimeline } from './spec.ts';

/** 落石: 單岩墜擊. Independent 60-second seven-phase direction. */
export const ROCK_THROW_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '落石・宣言', durationMs: 8000 },
  { id: 'charge', label: '單岩墜擊・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'rock-throw-assault', label: '單岩墜擊・連擊', durationMs: 16000 },
  { id: 'finale', label: '碎岩重落', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
