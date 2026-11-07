/* ────────────────────────────────────────────────────────────────────
 *  Cinematic timeline — pure data, no Phaser imports (unit-testable).
 *
 *  A cinematic is a list of named phases laid end to end. Scenes schedule
 *  their cues relative to a phase start (`phase('charge', 2500, fn)`), so a
 *  phase can be lengthened/shortened without retiming everything after it.
 *  ──────────────────────────────────────────────────────────────────── */

export interface CinematicPhaseSpec {
  id: string;
  label: string;
  durationMs: number;
}

export interface CinematicPhase {
  id: string;
  label: string;
  start: number;
  end: number;
}

export interface CinematicTimeline {
  phases: readonly CinematicPhase[];
  totalMs: number;
}

/** Lay phases end to end. Throws on empty, non-positive or duplicate phases. */
export function defineTimeline(spec: readonly CinematicPhaseSpec[]): CinematicTimeline {
  if (spec.length === 0) throw new Error('timeline needs at least one phase');
  const seen = new Set<string>();
  let t = 0;
  const phases = spec.map(s => {
    if (!(s.durationMs > 0)) throw new Error(`phase "${s.id}" must have a positive duration`);
    if (seen.has(s.id)) throw new Error(`duplicate phase id "${s.id}"`);
    seen.add(s.id);
    const p: CinematicPhase = { id: s.id, label: s.label, start: t, end: t + s.durationMs };
    t = p.end;
    return p;
  });
  return { phases, totalMs: t };
}

export function getPhase(tl: CinematicTimeline, id: string): CinematicPhase {
  const p = tl.phases.find(x => x.id === id);
  if (!p) throw new Error(`unknown phase "${id}"`);
  return p;
}

/** Phase active at `ms` (clamped to the first/last phase). */
export function phaseAt(tl: CinematicTimeline, ms: number): CinematicPhase {
  if (ms <= 0) return tl.phases[0];
  return tl.phases.find(p => ms < p.end) ?? tl.phases[tl.phases.length - 1];
}
