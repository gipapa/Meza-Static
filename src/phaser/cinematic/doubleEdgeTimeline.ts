import { defineAdvancedTimeline } from './spec.ts';

/** 捨身撞擊: 雙層衝擊. Independent 60-second seven-phase direction. */
export const DOUBLE_EDGE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '捨身撞擊・宣言', durationMs: 8000 },
  { id: 'charge', label: '雙層衝擊・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'double-edge-assault', label: '雙層衝擊・連擊', durationMs: 16000 },
  { id: 'finale', label: '極限捨身', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
