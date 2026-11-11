import { defineAdvancedTimeline } from './spec.ts';

/** 猛撞: 重壓突進. Independent 60-second seven-phase direction. */
export const TAKE_DOWN_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '猛撞・宣言', durationMs: 8000 },
  { id: 'charge', label: '重壓突進・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'take-down-assault', label: '重壓突進・連擊', durationMs: 16000 },
  { id: 'finale', label: '猛進爆衝', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
