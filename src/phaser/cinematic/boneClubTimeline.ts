import { defineAdvancedTimeline } from './spec.ts';

/** 骨棒: 弧形骨光. Independent 60-second seven-phase direction. */
export const BONE_CLUB_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '骨棒・宣言', durationMs: 8000 },
  { id: 'charge', label: '弧形骨光・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'bone-club-assault', label: '弧形骨光・連擊', durationMs: 16000 },
  { id: 'finale', label: '骨影重擊', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
