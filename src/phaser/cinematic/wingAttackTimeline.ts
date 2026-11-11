import { defineAdvancedTimeline } from './spec.ts';

/** 翅膀攻擊: 雙翼風壓. Independent 60-second seven-phase direction. */
export const WING_ATTACK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '翅膀攻擊・宣言', durationMs: 8000 },
  { id: 'charge', label: '雙翼風壓・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'wing-attack-assault', label: '雙翼風壓・連擊', durationMs: 16000 },
  { id: 'finale', label: '蒼翼迴擊', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
