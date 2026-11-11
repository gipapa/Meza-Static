import { defineAdvancedTimeline } from './spec.ts';

/** 暴風: 雲壁旋流. Independent 60-second seven-phase direction. */
export const HURRICANE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '暴風・宣言', durationMs: 8000 },
  { id: 'charge', label: '雲壁旋流・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'hurricane-assault', label: '雲壁旋流・連擊', durationMs: 16000 },
  { id: 'finale', label: '蒼穹風眼', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
