import { defineAdvancedTimeline } from './spec.ts';

/** 火焰牙: 灼熱雙牙. Independent 60-second seven-phase direction. */
export const FIRE_FANG_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '火焰牙・宣言', durationMs: 8000 },
  { id: 'charge', label: '灼熱雙牙・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'fire-fang-assault', label: '灼熱雙牙・連擊', durationMs: 16000 },
  { id: 'finale', label: '炎牙爆裂', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
