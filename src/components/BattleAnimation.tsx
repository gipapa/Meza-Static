import { useEffect, useMemo } from 'react';
import { TYPE_COLORS, TYPE_EMOJI } from '../data/monsters';

/** Map each type to one of 5 animation variants */
const ANIM_VARIANT: Record<string, string> = {
  fire: 'rise', water: 'expand', grass: 'rise', electric: 'bolt',
  psychic: 'expand', dark: 'sweep', dragon: 'sweep', fairy: 'expand',
  fighting: 'slam', normal: 'sweep', ice: 'expand', ghost: 'expand',
  steel: 'slam', poison: 'rise', ground: 'slam', flying: 'sweep',
  bug: 'rise', rock: 'slam',
};

interface Props {
  type: string;
  onDone: () => void;
}

export default function BattleAnimation({ type, onDone }: Props) {
  const color = TYPE_COLORS[type] || '#A78BFA';
  const emoji = TYPE_EMOJI[type] || '⚪';
  const variant = ANIM_VARIANT[type] || 'rise';

  useEffect(() => {
    const timer = setTimeout(onDone, 800);
    return () => clearTimeout(timer);
  }, [onDone]);

  // Generate random particle positions once per mount
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      tx: (Math.random() - 0.5) * 160,
      ty: (Math.random() - 0.5) * 100,
      delay: Math.random() * 150,
      scale: 0.8 + Math.random() * 0.8,
    })),
  []);

  return (
    <div className="battle-anim-overlay">
      {/* Ring burst */}
      <div
        className="battle-anim-ring"
        style={{ borderColor: color, boxShadow: `0 0 20px ${color}` }}
      />
      {/* Emoji particles */}
      {particles.map(p => (
        <span
          key={p.id}
          className={`battle-anim-particle battle-anim-${variant}`}
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animationDelay: `${p.delay}ms`,
            fontSize: `${p.scale}rem`,
          } as React.CSSProperties}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
