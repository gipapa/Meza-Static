import { defineAdvancedTimeline } from './spec.ts';

/** 種子炸彈: 種實散射. Independent 60-second seven-phase direction. */
export const SEED_BOMB_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '種子炸彈・宣言', durationMs: 8000 },
  { id: 'charge', label: '種實散射・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'seed-bomb-assault', label: '種實散射・連擊', durationMs: 16000 },
  { id: 'finale', label: '翠星爆裂', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
