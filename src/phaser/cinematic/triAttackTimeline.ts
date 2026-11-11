import { defineAdvancedTimeline } from './spec.ts';

/** 三角攻擊: 三元光流. Independent 60-second seven-phase direction. */
export const TRI_ATTACK_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '三角攻擊・宣言', durationMs: 8000 },
  { id: 'charge', label: '三元光流・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'tri-attack-assault', label: '三元光流・連擊', durationMs: 16000 },
  { id: 'finale', label: '三角共鳴', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
