import { defineAdvancedTimeline } from './spec.ts';

/** 極光束: 極光緞帶. Independent 60-second seven-phase direction. */
export const AURORA_BEAM_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '極光束・宣言', durationMs: 8000 },
  { id: 'charge', label: '極光緞帶・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'aurora-beam-assault', label: '極光緞帶・連擊', durationMs: 16000 },
  { id: 'finale', label: '極地虹光', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
