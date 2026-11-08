import type { TagMove } from '../types';
import { ALL_TAGS, RENTAL_TAGS, TYPE_NAMES_ZH } from './monsters.ts';

/** Add future moves here, even if no monster has them as its default move yet. */
export const ADDITIONAL_MOVES: TagMove[] = [];

export const ALL_MOVES: TagMove[] = Array.from(new Map(
  [...ALL_TAGS, ...RENTAL_TAGS].map(tag => tag.move).concat(ADDITIONAL_MOVES)
    .map(move => [`${move.type}:${move.name}`, move]),
).values());

/** Group from the catalog so new moves and types appear without UI changes. */
export function groupMovesByType(moves: readonly TagMove[]) {
  const groups = new Map<string, TagMove[]>();
  for (const move of moves) {
    const group = groups.get(move.type) ?? [];
    group.push(move);
    groups.set(move.type, group);
  }
  const order = Object.keys(TYPE_NAMES_ZH);
  return [...groups].sort(([a], [b]) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex);
  }).map(([type, items]) => ({
    type,
    moves: [...items].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant')),
  }));
}

export function moveKey(move: TagMove): string {
  return `${move.type}:${move.name}`;
}
