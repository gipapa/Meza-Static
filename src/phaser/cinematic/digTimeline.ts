import { defineAdvancedTimeline } from './spec.ts';

/** 挖洞: 潛地下鑽. Independent 60-second seven-phase direction. */
export const DIG_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '攻擊警告', durationMs: 5000 },
  { id: 'cutin', label: '挖洞・宣言', durationMs: 8000 },
  { id: 'charge', label: '潛地下鑽・蓄力', durationMs: 11000 },
  { id: 'release', label: '能量釋放', durationMs: 4000 },
  { id: 'dig-assault', label: '潛地下鑽・連擊', durationMs: 16000 },
  { id: 'finale', label: '破土突襲', durationMs: 9000 },
  { id: 'aftermath', label: '戰果與餘韻', durationMs: 7000 },
]);
