import { useEffect, useMemo } from 'react';
import { TYPE_COLORS } from '../data/monsters';

/* ── Config per element type ── */

interface ProjConfig {
  duration: number;          // flight time (ms)
  path: string;              // keyframe variant
  trailCount: number;
  count: number;             // simultaneous projectiles (scatter types)
  content?: string;          // emoji content (if any)
  rotateToTarget?: boolean;  // point shape toward target
}

const CFG: Record<string, ProjConfig> = {
  fire:     { duration: 400, path: 'straight', trailCount: 3, count: 1 },
  water:    { duration: 380, path: 'straight', trailCount: 3, count: 1, rotateToTarget: true },
  grass:    { duration: 450, path: 'arc',      trailCount: 0, count: 3, content: '🍃' },
  electric: { duration: 150, path: 'zigzag',   trailCount: 1, count: 1, content: '⚡' },
  psychic:  { duration: 500, path: 'straight', trailCount: 2, count: 1 },
  dark:     { duration: 350, path: 'fade-in',  trailCount: 0, count: 1 },
  dragon:   { duration: 400, path: 'straight', trailCount: 3, count: 1 },
  fairy:    { duration: 500, path: 'arc',      trailCount: 2, count: 1, content: '✨' },
  fighting: { duration: 300, path: 'straight', trailCount: 2, count: 1, content: '👊' },
  normal:   { duration: 350, path: 'straight', trailCount: 1, count: 1 },
  ice:      { duration: 400, path: 'wobble',   trailCount: 2, count: 1 },
  ghost:    { duration: 500, path: 'curve-s',  trailCount: 0, count: 1 },
  steel:    { duration: 200, path: 'straight', trailCount: 1, count: 1, rotateToTarget: true },
  poison:   { duration: 400, path: 'scatter',  trailCount: 0, count: 3 },
  ground:   { duration: 450, path: 'parabolic',trailCount: 1, count: 2 },
  flying:   { duration: 350, path: 'arc',      trailCount: 0, count: 1, rotateToTarget: true },
  bug:      { duration: 350, path: 'vibrate',  trailCount: 1, count: 1, rotateToTarget: true },
  rock:     { duration: 450, path: 'parabolic',trailCount: 1, count: 2 },
};

const DEFAULT: ProjConfig = {
  duration: 350, path: 'straight', trailCount: 1, count: 1,
};

/** Lookup projectile flight duration by type (used by BattlePage for timing) */
export function getProjectileDuration(type: string): number {
  return (CFG[type] || DEFAULT).duration;
}

/* ── Component ── */

interface Props {
  type: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  onDone: () => void;
}

export default function BattleProjectile({ type, from, to, onDone }: Props) {
  const config = CFG[type] || DEFAULT;
  const color = TYPE_COLORS[type] || '#A78BFA';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  useEffect(() => {
    const t = setTimeout(onDone, config.duration + 50);
    return () => clearTimeout(t);
  }, [onDone, config.duration]);

  /* Generate offsets for multi-projectile types (poison, grass, ground, rock) */
  const projectiles = useMemo(
    () =>
      Array.from({ length: config.count }, (_, i) => ({
        id: i,
        ox: config.count > 1 ? (Math.random() - 0.5) * 50 : 0,
        oy: config.count > 1 ? (Math.random() - 0.5) * 36 : 0,
        delay: config.count > 1 ? i * 60 : 0,
      })),
    [config.count],
  );

  /** Style factory for a path-animated wrapper */
  const pathStyle = (ox = 0, oy = 0, delay = 0): React.CSSProperties => ({
    left: from.x,
    top: from.y,
    '--dx': `${dx + ox}px`,
    '--dy': `${dy + oy}px`,
    '--angle': `${angle}deg`,
    animationDuration: `${config.duration}ms`,
    animationDelay: `${delay}ms`,
  } as React.CSSProperties);

  return (
    <div className="projectile-overlay">
      {projectiles.map((p) => (
        <div key={p.id}>
          {/* ─ Main projectile body ─ */}
          <div
            className={`projectile-body proj-path-${config.path}`}
            style={pathStyle(p.ox, p.oy, p.delay)}
          >
            <div
              className={`proj-shape proj-${type} ${config.rotateToTarget ? 'proj-rotate' : ''}`}
            >
              {config.content ?? null}
            </div>
          </div>

          {/* ─ Trail dots ─ */}
          {Array.from({ length: config.trailCount }, (_, i) => (
            <div
              key={`t${p.id}-${i}`}
              className={`projectile-trail proj-path-${config.path}`}
              style={pathStyle(p.ox, p.oy, p.delay + (i + 1) * 40)}
            >
              <div
                className="proj-trail-dot"
                style={{
                  background: color,
                  opacity: 0.5 - i * 0.12,
                  width: `${14 - i * 3}px`,
                  height: `${14 - i * 3}px`,
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
