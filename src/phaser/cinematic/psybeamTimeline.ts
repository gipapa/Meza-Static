import { defineAdvancedTimeline } from './spec.ts';

/** 幻象光線: 折射幻光. Independent 60-second seven-phase direction. */
export const PSYBEAM_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '幻象光線・宣言', durationMs: 8000 },
  { id: 'charge', label: '折射幻光・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'psybeam-assault', label: '折射幻光・連擊', durationMs: 16000 },
  { id: 'finale', label: '幻彩稜光', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
