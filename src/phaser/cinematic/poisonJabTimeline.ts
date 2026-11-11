import { defineAdvancedTimeline } from './spec.ts';

/** 毒擊: 毒光刺拳. Independent 60-second seven-phase direction. */
export const POISON_JAB_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '毒擊・宣言', durationMs: 8000 },
  { id: 'charge', label: '毒光刺拳・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'poison-jab-assault', label: '毒光刺拳・連擊', durationMs: 16000 },
  { id: 'finale', label: '毒刺貫心', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
