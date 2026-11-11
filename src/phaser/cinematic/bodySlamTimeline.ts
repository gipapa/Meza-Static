import { defineAdvancedTimeline } from './spec.ts';

/** 泰山壓頂: 高空壓落. Independent 60-second seven-phase direction. */
export const BODY_SLAM_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '泰山壓頂・宣言', durationMs: 8000 },
  { id: 'charge', label: '高空壓落・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'body-slam-assault', label: '高空壓落・連擊', durationMs: 16000 },
  { id: 'finale', label: '泰山墜擊', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
