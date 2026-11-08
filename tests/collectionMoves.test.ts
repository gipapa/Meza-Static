import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_TAGS } from '../src/data/monsters.ts';
import { ALL_MOVES, groupMovesByType, moveKey } from '../src/data/moves.ts';
import { addToCollection, getCollection, getEffectiveTag, updateCollectionMove } from '../src/lib/storage.ts';

const values = new Map<string, string>();
let failWrites = false;
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => {
    if (failWrites) throw new Error('QuotaExceededError');
    values.set(key, value);
  },
  removeItem: (key: string) => values.delete(key),
} });
beforeEach(() => { values.clear(); failWrites = false; });

test('cross-type move persists for battle without changing species defaults or other cards', () => {
  const original = structuredClone(ALL_TAGS[0]);
  addToCollection(original);
  addToCollection(ALL_TAGS[3]);
  const [collected, other] = getCollection();
  const fireMove = ALL_MOVES.find(move => move.type === 'fire')!;
  const updated = updateCollectionMove(collected.id, fireMove)!;
  assert.deepEqual(updated.move, fireMove);
  assert.deepEqual(getEffectiveTag(getCollection()[0]).move, fireMove);
  assert.deepEqual(getCollection()[1], other);
  assert.deepEqual(ALL_TAGS[0], original);
  assert.deepEqual(updated.stats, collected.stats);
  assert.equal(updated.id, collected.id);
});

test('duplicate merges preserve the chosen move and still boost stats', () => {
  addToCollection(ALL_TAGS[0]);
  const card = getCollection()[0];
  const chosen = ALL_MOVES.find(move => move.type === 'water')!;
  updateCollectionMove(card.id, chosen);
  addToCollection(ALL_TAGS[0]);
  const reloaded = getCollection()[0];
  assert.deepEqual(reloaded.move, chosen);
  assert.equal(reloaded.plusLevel, 1);
  assert.equal(getEffectiveTag(reloaded).stats.spd, card.stats.spd + 10);
});

test('missing cards and failed writes never replace the saved move', () => {
  addToCollection(ALL_TAGS[0]);
  const [card] = getCollection();
  const before = values.get('meza_collection');
  assert.equal(updateCollectionMove('missing', ALL_MOVES[0]), null);
  assert.equal(values.get('meza_collection'), before);
  failWrites = true;
  assert.throws(() => updateCollectionMove(card.id, ALL_MOVES.at(-1)!));
  assert.equal(values.get('meza_collection'), before);
});

test('catalog includes every default move once and groups future types automatically', () => {
  const keys = ALL_MOVES.map(moveKey);
  assert.equal(new Set(keys).size, keys.length);
  for (const tag of ALL_TAGS) assert.ok(keys.includes(moveKey(tag.move)));
  const future = { name: '未來招式', type: 'future', power: 80 };
  const groups = groupMovesByType([...ALL_MOVES, future]);
  assert.deepEqual(groups.find(group => group.type === 'future')?.moves, [future]);
  assert.equal(groups.flatMap(group => group.moves).length, ALL_MOVES.length + 1);
});
