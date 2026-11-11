import { defineAdvancedTimeline } from './spec.ts';

/** 電光一閃: 高速殘光. Independent 60-second seven-phase direction. */
export const QUICK_ATTACK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '電光一閃・宣言', durationMs: 8000 },
  { id: 'charge', label: '高速殘光・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'quick-attack-assault', label: '高速殘光・連擊', durationMs: 16000 },
  { id: 'finale', label: '瞬步閃擊', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
