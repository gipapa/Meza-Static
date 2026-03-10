import { useState, useEffect, useMemo, useRef } from 'react';
import type { Tag } from '../types';
import { TYPE_COLORS, TYPE_EMOJI, TYPE_NAMES_ZH } from '../data/monsters';
import { useNameReveal } from '../lib/nameMask';
import AnimationOverlay from './AnimationOverlay';

interface Props {
  enemy: Tag;
  ally: Tag;
  isPlayerAttacking: boolean;
  moveType: string;
  moveName: string;
  damage: number;
  onComplete: () => void;
}

/*
 * Animation stages:
 * 1. intro  — both cards appear (0.4s)
 * 2. lunge  — attacker moves toward defender (0.5s)
 * 3. effect — particles burst on defender (0.7s)
 * 4. damage — damage number pops (0.6s)
 * 5. outro  — brief pause then callback (0.4s)
 */
type Stage = 'intro' | 'lunge' | 'effect' | 'damage' | 'outro';

const STAGE_DURATION: Record<Stage, number> = {
  intro: 400,
  lunge: 500,
  effect: 700,
  damage: 600,
  outro: 400,
};

const STAGE_NEXT: Record<Stage, Stage | null> = {
  intro: 'lunge',
  lunge: 'effect',
  effect: 'damage',
  damage: 'outro',
  outro: null,
};

export default function BattleOverlayAnimation({
  enemy,
  ally,
  isPlayerAttacking,
  moveType,
  moveName,
  damage,
  onComplete,
}: Props) {
  const { dn } = useNameReveal();
  const [stage, setStage] = useState<Stage>('intro');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const attacker = isPlayerAttacking ? ally : enemy;
  const color = TYPE_COLORS[moveType] || '#A78BFA';
  const emoji = TYPE_EMOJI[moveType] || '⚪';
  const enemyEmoji = TYPE_EMOJI[enemy.types[0]] || '⚪';
  const allyEmoji = TYPE_EMOJI[ally.types[0]] || '⚪';

  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        tx: (Math.random() - 0.5) * 120,
        ty: (Math.random() - 0.5) * 60 - 20,
        delay: Math.random() * 100,
        scale: 0.8 + Math.random() * 0.5,
      })),
    [],
  );

  useEffect(() => {
    const next = STAGE_NEXT[stage];
    if (next) {
      timerRef.current = setTimeout(() => setStage(next), STAGE_DURATION[stage]);
    } else {
      timerRef.current = setTimeout(onComplete, STAGE_DURATION.outro);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [stage, onComplete]);

  return (
    <AnimationOverlay className="w-80 h-96">
      {/* Enemy (always top) */}
      <div
        className={`absolute top-8 flex flex-col items-center transition-all ${
          !isPlayerAttacking && stage === 'lunge' ? 'bo-lunge-down' : ''
        } ${
          isPlayerAttacking && (stage === 'effect' || stage === 'damage') ? 'bo-hit' : ''
        }`}
      >
        <div
          className="text-5xl mb-1"
          style={{ filter: `drop-shadow(0 0 8px ${TYPE_COLORS[enemy.types[0]]})` }}
        >
          {enemyEmoji}
        </div>
        <div className="font-display text-sm text-text-primary">{dn(enemy.name)}</div>
        <div className="flex gap-1 mt-0.5">
          {enemy.types.map(t => (
            <span
              key={t}
              className="text-[9px] px-1 py-0.5 rounded-full"
              style={{ background: `${TYPE_COLORS[t]}33`, color: TYPE_COLORS[t] }}
            >
              {TYPE_NAMES_ZH[t]}
            </span>
          ))}
        </div>
      </div>

      {/* Attack effect zone (center) */}
      {(stage === 'effect' || stage === 'damage') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Ring burst */}
          <div
            className="bo-ring"
            style={{ borderColor: color, boxShadow: `0 0 20px ${color}` }}
          />
          {/* Particles */}
          {particles.map(p => (
            <span
              key={p.id}
              className="absolute text-lg bo-particle"
              style={
                {
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  animationDelay: `${p.delay}ms`,
                  fontSize: `${p.scale}rem`,
                } as React.CSSProperties
              }
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      {/* Damage number */}
      {(stage === 'damage' || stage === 'outro') && (
        <div className="absolute top-[38%] bo-dmg-pop">
          <span
            className="font-display text-3xl text-accent"
            style={{ textShadow: `0 0 10px ${color}` }}
          >
            -{damage}
          </span>
        </div>
      )}

      {/* Ally (always bottom) */}
      <div
        className={`absolute bottom-14 flex flex-col items-center transition-all ${
          isPlayerAttacking && stage === 'lunge' ? 'bo-lunge' : ''
        } ${
          !isPlayerAttacking && (stage === 'effect' || stage === 'damage') ? 'bo-hit' : ''
        }`}
      >
        <div
          className="text-5xl mb-1"
          style={{ filter: `drop-shadow(0 0 8px ${TYPE_COLORS[ally.types[0]]})` }}
        >
          {allyEmoji}
        </div>
        <div className="font-display text-sm text-text-primary">{dn(ally.name)}</div>
        <div className="flex gap-1 mt-0.5">
          {ally.types.map(t => (
            <span
              key={t}
              className="text-[9px] px-1 py-0.5 rounded-full"
              style={{ background: `${TYPE_COLORS[t]}33`, color: TYPE_COLORS[t] }}
            >
              {TYPE_NAMES_ZH[t]}
            </span>
          ))}
        </div>
      </div>

      {/* Move name / status */}
      <div className="absolute bottom-3 font-display text-sm text-center w-full px-4">
        {stage === 'intro' && <span className="text-text-muted">準備攻擊...</span>}
        {(stage === 'lunge' || stage === 'effect') && (
          <span style={{ color }}>{dn(attacker.name)} 使用了 {moveName}！</span>
        )}
        {(stage === 'damage' || stage === 'outro') && (
          <span className="text-accent">造成 {damage} 點傷害！</span>
        )}
      </div>

      {/* Scoped keyframes */}
      <style>{`
        @keyframes boLunge {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-40px) scale(1.1); }
          100% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes boLungeDown {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(40px) scale(1.1); }
          100% { transform: translateY(10px) scale(1.05); }
        }
        @keyframes boHit {
          0%, 100% { transform: translateX(0); filter: brightness(1); }
          15%  { transform: translateX(-6px); filter: brightness(2); }
          35%  { transform: translateX(6px); filter: brightness(1); }
          55%  { transform: translateX(-4px); filter: brightness(1.5); }
          75%  { transform: translateX(3px); filter: brightness(1); }
        }
        @keyframes boRing {
          0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(0.2); border-width: 3px; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(3); border-width: 1px; }
        }
        @keyframes boParticle {
          0%   { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.3); }
        }
        @keyframes boDmgPop {
          0%   { opacity: 0; transform: scale(0.3) translateY(10px); }
          50%  { opacity: 1; transform: scale(1.3) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .bo-lunge      { animation: boLunge 0.5s ease-out forwards; }
        .bo-lunge-down { animation: boLungeDown 0.5s ease-out forwards; }
        .bo-hit      { animation: boHit 0.6s ease-in-out; }
        .bo-ring     {
          position: absolute;
          width: 50px; height: 50px;
          border-radius: 50%;
          border: 3px solid;
          top: 35%; left: 50%;
          transform: translate(-50%, -50%);
          animation: boRing 0.6s ease-out forwards;
        }
        .bo-particle { animation: boParticle 0.6s ease-out forwards; }
        .bo-dmg-pop  { animation: boDmgPop 0.4s ease-out forwards; }
      `}</style>
    </AnimationOverlay>
  );
}
