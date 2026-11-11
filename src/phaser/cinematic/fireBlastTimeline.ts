import { defineAdvancedTimeline } from './spec.ts';

/** 大字爆炎: 烈焰刻印. Independent 60-second seven-phase direction. */
export const FIRE_BLAST_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '大字爆炎・宣言', durationMs: 8000 },
  { id: 'charge', label: '烈焰刻印・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'fire-blast-assault', label: '烈焰刻印・連擊', durationMs: 16000 },
  { id: 'finale', label: '炎之大字', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
