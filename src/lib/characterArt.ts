import { TYPE_EMOJI } from '../data/monsters';

/** Fallback art for every monster: its primary type emoji. */
export function typeEmojiOf(tag: { types: string[] }): string {
  return TYPE_EMOJI[tag.types[0]] || '⚪';
}

/** Image srcs that failed to load in an <img> this session. */
const brokenSrcs = new Set<string>();

export function isBrokenSrc(src: string): boolean {
  return brokenSrcs.has(src);
}

export function markBrokenSrc(src: string): void {
  brokenSrcs.add(src);
}

/** Forget a failure (e.g. the user re-applied the URL and it loaded). */
export function clearBrokenSrc(src: string): void {
  brokenSrcs.delete(src);
}
