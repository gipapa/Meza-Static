import { defineAdvancedTimeline } from './spec.ts';

/** 近身戰: 交錯近戰. Independent 60-second seven-phase direction. */
export const CLOSE_COMBAT_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '近身戰・宣言', durationMs: 8000 },
  { id: 'charge', label: '交錯近戰・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'close-combat-assault', label: '交錯近戰・連擊', durationMs: 16000 },
  { id: 'finale', label: '極限連打', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
