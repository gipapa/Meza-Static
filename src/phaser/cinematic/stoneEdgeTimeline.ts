import { defineAdvancedTimeline } from './spec.ts';

/** 尖石攻擊: 地表石柱. Independent 60-second seven-phase direction. */
export const STONE_EDGE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '尖石攻擊・宣言', durationMs: 8000 },
  { id: 'charge', label: '地表石柱・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'stone-edge-assault', label: '地表石柱・連擊', durationMs: 16000 },
  { id: 'finale', label: '尖岩刺陣', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
