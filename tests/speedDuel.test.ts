import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DUEL_TILT, allyClipPath, duelGeometry, splitLineClipPath } from '../src/lib/speedDuel.ts';

test('split starts centred with a tilted edge before any taps', () => {
  for (const stage of ['ready', 'running'] as const) {
    const g = duelGeometry(stage, 0, 8);
    assert.equal(g.split, 50);
    assert.equal(g.left, 50 + DUEL_TILT);
    assert.equal(g.right, 50 - DUEL_TILT);
  }
});

test('every tap pushes the split toward the enemy (top) without reaching it before winning', () => {
  let previous = Infinity;
  for (let taps = 0; taps < 8; taps++) {
    const { split } = duelGeometry('running', taps, 8);
    assert.ok(split < previous, `tap ${taps} should move the line up`);
    assert.ok(split > 0);
    previous = split;
  }
  assert.equal(duelGeometry('running', 99, 8).split, duelGeometry('running', 8, 8).split, 'extra taps are clamped');
  assert.equal(duelGeometry('running', -3, 8).split, 50, 'negative taps are clamped');
});

test('win gives the whole arena to the ally, loss to the enemy', () => {
  assert.deepEqual(duelGeometry('won', 8, 8), { split: 0, left: 0, right: 0 });
  assert.deepEqual(duelGeometry('lost', 3, 8), { split: 100, left: 100, right: 100 });
  assert.equal(allyClipPath(duelGeometry('won', 8, 8)), 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
});

test('clip paths keep the same point count in every state so CSS can animate them', () => {
  const count = (path: string) => path.split(',').length;
  const states = [duelGeometry('ready', 0, 8), duelGeometry('running', 5, 8), duelGeometry('won', 8, 8), duelGeometry('lost', 2, 8)];
  assert.ok(states.every(g => count(allyClipPath(g)) === 4));
  assert.ok(states.every(g => count(splitLineClipPath(g)) === 4));
});
