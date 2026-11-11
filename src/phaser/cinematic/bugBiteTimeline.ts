import { defineAdvancedTimeline } from './spec.ts';

/** 蟲咬: 蟲顎夾擊. Independent 60-second seven-phase direction. */
export const BUG_BITE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '蟲咬・宣言', durationMs: 8000 },
  { id: 'charge', label: '蟲顎夾擊・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'bug-bite-assault', label: '蟲顎夾擊・連擊', durationMs: 16000 },
  { id: 'finale', label: '蟲牙爆裂', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
