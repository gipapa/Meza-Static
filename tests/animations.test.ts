// Unit tests for the framework-free animation modules. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, parseSettings } from '../src/lib/settings.ts';
import { defineTimeline, getPhase, phaseAt } from '../src/phaser/cinematic/timeline.ts';
import { PETAL_DANCE_TIMELINE } from '../src/phaser/cinematic/petalDanceTimeline.ts';
import { ADVANCED_MOVE_ANIMATIONS, hasAdvancedAnimation, resolveMoveAnimation } from '../src/phaser/cinematic/moveAnimations.ts';
import { CINEMATIC_TIMELINES } from '../src/phaser/cinematic/timelines.ts';
import {
  ADVANCED_MOVE_DURATION_MS, PHASE_RULES, defineAdvancedTimeline, isCinematicId, validateAdvancedTimeline,
} from '../src/phaser/cinematic/spec.ts';
import { ALL_TAGS, RENTAL_TAGS } from '../src/data/monsters.ts';
import { ALL_MOVES } from '../src/data/moves.ts';
import { ANIMATION_CREDITS } from '../src/phaser/cinematic/credits.ts';

test('the entire move catalog has distinct advanced cinematics and explicit credits', () => {
  const names = new Set(ALL_MOVES.map(move => move.name));
  assert.deepEqual(new Set(Object.keys(ADVANCED_MOVE_ANIMATIONS)), names);
  const ids = Object.values(ADVANCED_MOVE_ANIMATIONS);
  assert.equal(new Set(ids).size, names.size, 'each move owns its cinematic');
  assert.deepEqual(new Set(ids), new Set(Object.keys(CINEMATIC_TIMELINES)));
  assert.deepEqual(new Set(ids), new Set(Object.keys(ANIMATION_CREDITS)));
  for (const move of ALL_MOVES) {
    assert.deepEqual(resolveMoveAnimation(move.name, 'advanced'), { variant: 'advanced', id: ADVANCED_MOVE_ANIMATIONS[move.name] });
    assert.deepEqual(resolveMoveAnimation(move.name, 'simple'), { variant: 'simple' });
    const credit = ANIMATION_CREDITS[ADVANCED_MOVE_ANIMATIONS[move.name]];
    assert.ok(credit.createdBy && credit.evidence, move.name);
  }
});

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

test('petal dance cinematic is exactly 60 s with the standard beats', () => {
  const tl = PETAL_DANCE_TIMELINE;
  assert.equal(tl.totalMs, 60_000);
  assert.deepEqual(validateAdvancedTimeline(tl), []);
  assert.deepEqual(tl.phases.map(p => p.id), ['intro', 'cutin', 'charge', 'release', 'storm', 'finale', 'aftermath']);
  assert.deepEqual(tl.phases.map(p => p.end - p.start), [5000, 8000, 11000, 4000, 16000, 9000, 7000]);
  for (let i = 1; i < tl.phases.length; i++) assert.equal(tl.phases[i].start, tl.phases[i - 1].end);
});

/* ── 60 s spec (.claude/skills/advanced-move-animation) ── */

test('spec defaults sum to 60 s and lie inside each phase range', () => {
  assert.equal(ADVANCED_MOVE_DURATION_MS, 60_000);
  assert.equal(PHASE_RULES.reduce((a, r) => a + r.defaultMs, 0), ADVANCED_MOVE_DURATION_MS);
  for (const r of PHASE_RULES) assert.ok(r.minMs <= r.defaultMs && r.defaultMs <= r.maxMs, r.role);
  // The template timeline (defaults, custom body id) is valid.
  const tpl = defineAdvancedTimeline(PHASE_RULES.map(r => ({ id: r.id ?? 'move-body', label: r.purpose, durationMs: r.defaultMs })));
  assert.equal(tpl.totalMs, 60_000);
});

test('every registered cinematic timeline satisfies the spec', () => {
  const ids = Object.keys(CINEMATIC_TIMELINES);
  assert.ok(ids.length > 0);
  for (const [id, tl] of Object.entries(CINEMATIC_TIMELINES)) {
    assert.ok(isCinematicId(id), `kebab-case id: ${id}`);
    assert.deepEqual(validateAdvancedTimeline(tl), [], id);
  }
});

test('every advanced move maps to a registered cinematic, all others fall back to simple', () => {
  for (const [move, id] of Object.entries(ADVANCED_MOVE_ANIMATIONS)) {
    assert.ok(Object.hasOwn(CINEMATIC_TIMELINES, id), `${move} → ${id} has no timeline`);
  }
  const moves = new Set([...ALL_TAGS, ...RENTAL_TAGS].map(t => t.move.name));
  for (const move of moves) {
    const choice = resolveMoveAnimation(move, 'advanced');
    if (hasAdvancedAnimation(move)) assert.equal(choice.variant, 'advanced', move);
    else assert.deepEqual(choice, { variant: 'simple' }, move);
    assert.deepEqual(resolveMoveAnimation(move, 'simple'), { variant: 'simple' }, move);
  }
});

test('spec validator rejects wrong totals, order, ranges and ids', () => {
  const base = PHASE_RULES.map(r => ({ id: r.id ?? 'storm', label: 'x', durationMs: r.defaultMs }));
  const mod = (i: number, patch: object) => base.map((p, j) => (j === i ? { ...p, ...patch } : p));
  // 59 s / 61 s total
  assert.throws(() => defineAdvancedTimeline(mod(6, { durationMs: 6000 })), /exactly 60000/);
  assert.throws(() => defineAdvancedTimeline(mod(6, { durationMs: 8000 })), /exactly 60000/);
  // phase out of range even if total is 60 s (main 21 s, aftermath 2 s)
  assert.throws(() => defineAdvancedTimeline(mod(4, { durationMs: 21000 }).map((p, j) => (j === 6 ? { ...p, durationMs: 2000 } : p))), /allowed/);
  // fixed ids and order
  assert.throws(() => defineAdvancedTimeline(mod(1, { id: 'cut-in' })), /must be "cutin"/);
  // attack body must have its own id
  assert.throws(() => defineAdvancedTimeline(mod(4, { id: 'Storm Body' })), /move-specific/);
  // missing phase
  assert.throws(() => defineAdvancedTimeline(base.slice(0, 6)), /expected 7 phases/);
});
