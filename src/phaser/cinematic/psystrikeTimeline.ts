import { defineAdvancedTimeline } from './spec.ts';

/** 精神擊破: 念晶突刺. Independent 60-second seven-phase direction. */
export const PSYSTRIKE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '精神擊破・宣言', durationMs: 8000 },
  { id: 'charge', label: '念晶突刺・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'psystrike-assault', label: '念晶突刺・連擊', durationMs: 16000 },
  { id: 'finale', label: '念晶破界', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
