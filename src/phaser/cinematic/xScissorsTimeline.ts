import { defineAdvancedTimeline } from './spec.ts';

/** X剪刀: 逆向剪刃. Independent 60-second seven-phase direction. */
export const X_SCISSORS_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: 'X剪刀・宣言', durationMs: 8000 },
  { id: 'charge', label: '逆向剪刃・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'x-scissors-assault', label: '逆向剪刃・連擊', durationMs: 16000 },
  { id: 'finale', label: '交剪終式', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
