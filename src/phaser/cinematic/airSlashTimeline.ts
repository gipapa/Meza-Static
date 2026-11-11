import { defineAdvancedTimeline } from './spec.ts';

/** 空氣利刃: 氣刃掠空. Independent 60-second seven-phase direction. */
export const AIR_SLASH_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '空氣利刃・宣言', durationMs: 8000 },
  { id: 'charge', label: '氣刃掠空・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'air-slash-assault', label: '氣刃掠空・連擊', durationMs: 16000 },
  { id: 'finale', label: '裂風雙刃', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
