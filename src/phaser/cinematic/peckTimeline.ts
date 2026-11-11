import { defineAdvancedTimeline } from './spec.ts';

/** 啄: 尖端風刺. Independent 60-second seven-phase direction. */
export const PECK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '啄・宣言', durationMs: 8000 },
  { id: 'charge', label: '尖端風刺・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'peck-assault', label: '尖端風刺・連擊', durationMs: 16000 },
  { id: 'finale', label: '疾喙穿風', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
