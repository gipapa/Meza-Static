import { defineAdvancedTimeline } from './spec.ts';

/** 泡沫光線: 氣泡光流. Independent 60-second seven-phase direction. */
export const BUBBLE_BEAM_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '泡沫光線・宣言', durationMs: 8000 },
  { id: 'charge', label: '氣泡光流・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'bubble-beam-assault', label: '氣泡光流・連擊', durationMs: 16000 },
  { id: 'finale', label: '虹泡貫穿', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
