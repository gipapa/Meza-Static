import { defineAdvancedTimeline } from './spec.ts';

/** 噴射火焰: 持續噴焰. Independent 60-second seven-phase direction. */
export const FLAMETHROWER_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '噴射火焰・宣言', durationMs: 8000 },
  { id: 'charge', label: '持續噴焰・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'flamethrower-assault', label: '持續噴焰・連擊', durationMs: 16000 },
  { id: 'finale', label: '紅蓮噴流', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
