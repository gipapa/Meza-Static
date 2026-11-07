import { defineTimeline } from './timeline.ts';

/** 花瓣舞 advanced cinematic — 60 s, Super-Robot-Wars style. */
export const PETAL_DANCE_TIMELINE = defineTimeline([
  { id: 'intro', label: '開場・警報', durationMs: 5000 },
  { id: 'cutin', label: '發招 Cut-in', durationMs: 8000 },
  { id: 'charge', label: '集中・蓄力', durationMs: 11000 },
  { id: 'release', label: '解放', durationMs: 4000 },
  { id: 'storm', label: '花瓣風暴', durationMs: 16000 },
  { id: 'finale', label: '終結・千華繚亂', durationMs: 9000 },
  { id: 'aftermath', label: '收尾', durationMs: 7000 },
]);
