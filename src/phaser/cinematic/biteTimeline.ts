import { defineAdvancedTimeline } from './spec.ts';

/** 咬住: 暗牙伏擊. Independent 60-second seven-phase direction. */
export const BITE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '咬住・宣言', durationMs: 8000 },
  { id: 'charge', label: '暗牙伏擊・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'bite-assault', label: '暗牙伏擊・連擊', durationMs: 16000 },
  { id: 'finale', label: '影牙閉鎖', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
