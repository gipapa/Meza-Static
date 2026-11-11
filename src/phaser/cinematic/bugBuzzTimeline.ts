import { defineAdvancedTimeline } from './spec.ts';

/** 蟲鳴: 翅頻共振. Independent 60-second seven-phase direction. */
export const BUG_BUZZ_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '蟲鳴・宣言', durationMs: 8000 },
  { id: 'charge', label: '翅頻共振・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'bug-buzz-assault', label: '翅頻共振・連擊', durationMs: 16000 },
  { id: 'finale', label: '蟲音震盪', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
