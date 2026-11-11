import { defineAdvancedTimeline } from './spec.ts';

/** 岩崩: 群岩落下. Independent 60-second seven-phase direction. */
export const ROCK_SLIDE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '岩崩・宣言', durationMs: 8000 },
  { id: 'charge', label: '群岩落下・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'rock-slide-assault', label: '群岩落下・連擊', durationMs: 16000 },
  { id: 'finale', label: '山崩壓境', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
