import { defineAdvancedTimeline } from './spec.ts';

/** 打雷: 雲頂落雷. Independent 60-second seven-phase direction. */
export const THUNDER_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '打雷・宣言', durationMs: 8000 },
  { id: 'charge', label: '雲頂落雷・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'thunder-assault', label: '雲頂落雷・連擊', durationMs: 16000 },
  { id: 'finale', label: '天雷裁決', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
