// Unit tests for the framework-free animation modules. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, parseSettings } from '../src/lib/settings.ts';
import { defineTimeline, getPhase, phaseAt } from '../src/phaser/cinematic/timeline.ts';
import { PETAL_DANCE_TIMELINE } from '../src/phaser/cinematic/petalDanceTimeline.ts';
import { ADVANCED_MOVE_ANIMATIONS, hasAdvancedAnimation, resolveMoveAnimation } from '../src/phaser/cinematic/moveAnimations.ts';

test('settings default to simple animations', () => {
  assert.equal(DEFAULT_SETTINGS.animationQuality, 'simple');
  assert.equal(parseSettings(null).animationQuality, 'simple');
  assert.equal(parseSettings('not json').animationQuality, 'simple');
  assert.equal(parseSettings('{"animationQuality":"ultra"}').animationQuality, 'simple');
  assert.equal(parseSettings('{"animationQuality":"advanced"}').animationQuality, 'advanced');
});

test('simple quality always plays the simple animation', () => {
  assert.deepEqual(resolveMoveAnimation('花瓣舞', 'simple'), { variant: 'simple' });
});

test('advanced quality plays the cinematic only for moves that have one', () => {
  assert.deepEqual(resolveMoveAnimation('花瓣舞', 'advanced'), { variant: 'advanced', id: 'petal-dance' });
  assert.deepEqual(resolveMoveAnimation('火焰衝擊', 'advanced'), { variant: 'simple' });
  assert.equal(hasAdvancedAnimation('toString'), false); // no prototype leaks
});

test('every advanced move id is a non-empty string', () => {
  for (const [move, id] of Object.entries(ADVANCED_MOVE_ANIMATIONS)) {
    assert.ok(move.length > 0 && typeof id === 'string' && id.length > 0);
  }
});

test('defineTimeline lays phases end to end and validates input', () => {
  const tl = defineTimeline([
    { id: 'a', label: 'A', durationMs: 100 },
    { id: 'b', label: 'B', durationMs: 50 },
  ]);
  assert.equal(tl.totalMs, 150);
  assert.deepEqual(getPhase(tl, 'b'), { id: 'b', label: 'B', start: 100, end: 150 });
  assert.equal(phaseAt(tl, 99).id, 'a');
  assert.equal(phaseAt(tl, 100).id, 'b');
  assert.equal(phaseAt(tl, 9999).id, 'b');
  assert.throws(() => defineTimeline([]));
  assert.throws(() => defineTimeline([{ id: 'x', label: '', durationMs: 0 }]));
  assert.throws(() => defineTimeline([{ id: 'x', label: '', durationMs: 1 }, { id: 'x', label: '', durationMs: 1 }]));
});

test('petal dance cinematic is about one minute with the required beats', () => {
  const tl = PETAL_DANCE_TIMELINE;
  assert.ok(tl.totalMs >= 55_000 && tl.totalMs <= 65_000, `total ${tl.totalMs}ms`);
  const ids = tl.phases.map(p => p.id);
  assert.deepEqual(ids, ['intro', 'cutin', 'charge', 'release', 'storm', 'finale', 'aftermath']);
  for (let i = 1; i < tl.phases.length; i++) assert.equal(tl.phases[i].start, tl.phases[i - 1].end);
});
