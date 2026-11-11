import { defineAdvancedTimeline } from './spec.ts';

/** 劈開: 三道爪光. Independent 60-second seven-phase direction. */
export const SLASH_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '劈開・宣言', durationMs: 8000 },
  { id: 'charge', label: '三道爪光・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'slash-assault', label: '三道爪光・連擊', durationMs: 16000 },
  { id: 'finale', label: '裂空斬線', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
