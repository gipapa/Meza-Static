import { defineAdvancedTimeline } from './spec.ts';

/** 日光束 — solar absorption → botanical laser, exactly 60 seconds. */
export const SOLAR_BEAM_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '開場・日輪甦醒', durationMs: 5000 },
  { id: 'cutin', label: '發招・日光束', durationMs: 8000 },
  { id: 'charge', label: '日光吸收・蓄力', durationMs: 11000 },
  { id: 'release', label: '日輪解放', durationMs: 4000 },
  { id: 'solar-barrage', label: '日光貫穿・連續照射', durationMs: 16000 },
  { id: 'finale', label: '終結・日輪貫星', durationMs: 9000 },
  { id: 'aftermath', label: '餘光・收尾', durationMs: 7000 },
]);
