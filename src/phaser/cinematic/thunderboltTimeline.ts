import { defineAdvancedTimeline } from './spec.ts';

/** 十萬伏特: 電弧聚焦. Independent 60-second seven-phase direction. */
export const THUNDERBOLT_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '十萬伏特・宣言', durationMs: 8000 },
  { id: 'charge', label: '電弧聚焦・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'thunderbolt-assault', label: '電弧聚焦・連擊', durationMs: 16000 },
  { id: 'finale', label: '十萬雷光', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
