import { defineAdvancedTimeline } from './spec.ts';

/** 百萬噸飛踢: 斜落飛踢. Independent 60-second seven-phase direction. */
export const MEGA_KICK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '百萬噸飛踢・宣言', durationMs: 8000 },
  { id: 'charge', label: '斜落飛踢・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'mega-kick-assault', label: '斜落飛踢・連擊', durationMs: 16000 },
  { id: 'finale', label: '破空重踢', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
