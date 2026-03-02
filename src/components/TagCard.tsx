import type { Tag } from '../types';
import { TYPE_COLORS, TYPE_EMOJI } from '../data/monsters';

interface Props {
  tag: Tag;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showBack?: boolean;
  selected?: boolean;
  className?: string;
}

function gradeStars(grade: number) {
  return '★'.repeat(grade);
}

function gradeClass(grade: number) {
  if (grade >= 6) return 'superstar-shimmer';
  if (grade >= 5) return 'star-shimmer';
  return 'text-gold';
}

export default function TagCard({ tag, onClick, size = 'md', showBack = false, selected = false, className = '' }: Props) {
  const primaryType = tag.types[0];
  const typeColor = TYPE_COLORS[primaryType] || '#A78BFA';

  const sizeClasses = {
    sm: 'w-28 h-40',
    md: 'w-36 h-52',
    lg: 'w-48 h-68',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer card-glow
        ${sizeClasses[size]}
        ${selected ? 'ring-2 ring-neon-cyan ring-offset-2 ring-offset-bg-dark' : ''}
        ${className}
      `}
      style={{ background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}44)`, border: `1px solid ${typeColor}66` }}
    >
      {/* Front */}
      {!showBack ? (
        <div className="flex flex-col h-full p-2">
          {/* Grade */}
          <div className={`text-xs font-bold ${gradeClass(tag.grade)}`}>
            {gradeStars(tag.grade)}
          </div>
          {/* Central Art Area */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="text-4xl sm:text-5xl"
              style={{ filter: `drop-shadow(0 0 8px ${typeColor})` }}
            >
              {TYPE_EMOJI[primaryType] || '⚪'}
            </div>
          </div>
          {/* Name & Type */}
          <div className="mt-auto">
            <div className="font-display text-xs truncate">{tag.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              {tag.types.map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${TYPE_COLORS[t]}33`, color: TYPE_COLORS[t] }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">PE {tag.pe}</div>
          </div>
          {/* Flags */}
          {tag.flags.legendary && (
            <div className="absolute top-1 right-1 text-[10px] bg-gold/20 text-gold px-1 rounded">L</div>
          )}
          {tag.flags.mythical && (
            <div className="absolute top-1 right-6 text-[10px] bg-accent/20 text-accent px-1 rounded">M</div>
          )}
        </div>
      ) : (
        /* Back */
        <div className="flex flex-col h-full p-2 text-[10px]">
          <div className="font-display text-xs mb-1">{tag.name}</div>
          <div className="space-y-0.5">
            <StatBar label="HP" value={tag.stats.hp} max={300} color="#22C55E" />
            <StatBar label="ATK" value={tag.stats.atk} max={200} color="#EF4444" />
            <StatBar label="DEF" value={tag.stats.def} max={200} color="#3B82F6" />
            <StatBar label="SPD" value={tag.stats.spd} max={200} color="#FBBF24" />
          </div>
          <div className="mt-2 p-1 rounded bg-white/5">
            <div className="font-bold">{tag.move.name}</div>
            <div className="flex justify-between">
              <span style={{ color: TYPE_COLORS[tag.move.type] }}>{tag.move.type}</span>
              <span>POW {tag.move.power}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-1">
      <span className="w-6 text-right text-text-muted">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-6 text-right">{value}</span>
    </div>
  );
}
