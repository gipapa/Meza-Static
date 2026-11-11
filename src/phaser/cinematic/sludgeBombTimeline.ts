import { defineAdvancedTimeline } from './spec.ts';

/** 污泥炸彈: 毒核拋射. Independent 60-second seven-phase direction. */
export const SLUDGE_BOMB_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '污泥炸彈・宣言', durationMs: 8000 },
  { id: 'charge', label: '毒核拋射・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'sludge-bomb-assault', label: '毒核拋射・連擊', durationMs: 16000 },
  { id: 'finale', label: '腐泥爆散', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
