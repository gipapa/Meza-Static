import { defineAdvancedTimeline } from './spec.ts';

/** 逆鱗 — rising scales → draconic rampage, exactly 60 seconds. */
export const OUTRAGE_TIMELINE = defineAdvancedTimeline([
  { id: 'intro', label: '開場・逆鱗甦醒', durationMs: 5000 },
  { id: 'cutin', label: '發招・逆鱗', durationMs: 8000 },
  { id: 'charge', label: '龍怒蓄積・逆鱗解鎖', durationMs: 11000 },
  { id: 'release', label: '暴走解放', durationMs: 4000 },
  { id: 'rampage', label: '怒龍連襲', durationMs: 16000 },
  { id: 'finale', label: '終結・怒龍崩天', durationMs: 9000 },
  { id: 'aftermath', label: '龍息・收尾', durationMs: 7000 },
]);
