import { useState, useEffect, useRef } from 'react';
import type { Tag, BallType } from '../types';
import { BALL_COLORS } from '../lib/battle';
import { TYPE_EMOJI } from '../data/monsters';
import { randInt } from '../lib/rng';
import { useNameReveal } from '../lib/nameMask';

interface Target {
  tag: Tag;
  success: boolean;
}

interface Props {
  targets: Target[];
  ballType: BallType;
  onComplete: () => void;
}

type Stage = 'throw' | 'absorb' | 'shake' | 'result';

const BALL_EMOJI: Record<BallType, string> = {
  poke: '⚪',
  great: '🔵',
  ultra: '🟡',
  master: '🟣',
};

export default function MultiCatchAnimation({ targets, ballType, onComplete }: Props) {
  const { dn } = useNameReveal();
  const [stage, setStage] = useState<Stage>('throw');
  const [shakeCounts] = useState(() => targets.map(() => randInt(1, 3)));
  const maxShakes = Math.max(...shakeCounts);
  const [currentShake, setCurrentShake] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ballColor = BALL_COLORS[ballType];

  useEffect(() => {
    if (stage === 'throw') {
      timerRef.current = setTimeout(() => setStage('absorb'), 700);
    } else if (stage === 'absorb') {
      timerRef.current = setTimeout(() => {
        setStage('shake');
        setCurrentShake(1);
      }, 700);
    } else if (stage === 'shake') {
      if (currentShake <= maxShakes) {
        timerRef.current = setTimeout(() => {
          if (currentShake < maxShakes) {
            setCurrentShake(prev => prev + 1);
          } else {
            setStage('result');
          }
        }, 1100);
      }
    } else if (stage === 'result') {
      timerRef.current = setTimeout(onComplete, 1800);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [stage, currentShake, maxShakes, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex gap-3 items-end">
        {targets.map((t, i) => {
          const emoji = TYPE_EMOJI[t.tag.types[0]] || '⚪';
          const myShakes = shakeCounts[i];
          const stillShaking = stage === 'shake' && currentShake <= myShakes;
          const doneShaking = stage === 'shake' && currentShake > myShakes;

          return (
            <div
              key={t.tag.id}
              className="relative rounded-2xl bg-bg-card border border-white/10 shadow-2xl flex flex-col items-center justify-center overflow-hidden w-28 h-72 sm:w-36 sm:h-80"
            >
              {/* Monster name */}
              <div className="absolute top-2 font-display text-[10px] text-text-muted text-center w-full truncate px-1">
                {dn(t.tag.name)}
              </div>

              {/* Target creature */}
              <div
                className="absolute text-4xl sm:text-5xl transition-all duration-500"
                style={{
                  top: '18%',
                  opacity: stage === 'throw' ? 1 : 0,
                  transform:
                    stage === 'absorb' || stage === 'shake' || stage === 'result'
                      ? 'scale(0) translateY(30px)'
                      : 'scale(1)',
                  ...(stage === 'result' && !t.success
                    ? { opacity: 1, transform: 'scale(1)', transition: 'all 0.4s ease-out' }
                    : {}),
                }}
              >
                {emoji}
              </div>

              {/* Ball */}
              <div
                className="absolute text-3xl sm:text-4xl"
                style={{
                  ...(stage === 'throw'
                    ? { bottom: '10%', animation: 'mcBallThrow 0.6s ease-out forwards' }
                    : { top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }),
                  ...(stillShaking
                    ? { animation: 'mcBallShake 1.0s ease-in-out' }
                    : {}),
                  ...(doneShaking
                    ? { top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }
                    : {}),
                  ...(stage === 'result' && t.success
                    ? { animation: 'mcBallSuccess 0.6s ease-in-out' }
                    : {}),
                  ...(stage === 'result' && !t.success
                    ? { animation: 'mcBallFail 0.4s ease-out forwards', opacity: 0 }
                    : {}),
                }}
                key={`shake-${i}-${currentShake}`}
              >
                <div
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl border-3"
                  style={{
                    background: `${ballColor}33`,
                    borderColor: ballColor,
                    boxShadow: `0 0 16px ${ballColor}66`,
                  }}
                >
                  {BALL_EMOJI[ballType]}
                </div>
              </div>

              {/* Escape pop */}
              {stage === 'result' && !t.success && (
                <div
                  className="absolute text-4xl sm:text-5xl"
                  style={{ top: '18%', animation: 'mcEscapePop 0.5s ease-out 0.3s both' }}
                >
                  {emoji}
                </div>
              )}

              {/* Success sparkles */}
              {stage === 'result' && t.success && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {['✨', '⭐', '🌟'].map((s, si) => (
                    <span
                      key={si}
                      className="absolute text-lg"
                      style={{
                        animation: `mcSparkle 0.8s ease-out ${si * 0.15}s both`,
                        transform: `rotate(${si * 120}deg) translateY(-35px)`,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Status indicator */}
              <div className="absolute bottom-3 font-display text-[10px] text-center w-full">
                {stage === 'throw' && <span className="text-text-muted">投擲中...</span>}
                {stage === 'absorb' && <span style={{ color: ballColor }}>吸入中！</span>}
                {stage === 'shake' && (
                  <span className="text-text-muted">
                    {'● '.repeat(Math.min(currentShake, myShakes))}
                    {'○ '.repeat(Math.max(0, myShakes - currentShake))}
                  </span>
                )}
                {stage === 'result' && t.success && (
                  <span className="text-neon-green text-sm">捕獲！🎉</span>
                )}
                {stage === 'result' && !t.success && (
                  <span className="text-red-400 text-sm">逃跑💨</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes mcBallThrow {
          0%   { transform: translateY(0) scale(0.4); opacity: 0.6; }
          50%  { transform: translateY(-90px) scale(1) rotate(-15deg); }
          100% { transform: translateY(-70px) scale(0.9); opacity: 1; }
        }
        @keyframes mcBallShake {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          20%  { transform: translate(-50%, -50%) rotate(12deg); }
          40%  { transform: translate(-50%, -50%) rotate(-12deg); }
          60%  { transform: translate(-50%, -50%) rotate(8deg); }
          80%  { transform: translate(-50%, -50%) rotate(-8deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes mcBallSuccess {
          0%   { transform: translate(-50%, -50%) scale(1); }
          50%  { transform: translate(-50%, -50%) scale(1.3); filter: brightness(1.5); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes mcBallFail {
          0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50%  { transform: translate(-50%, -50%) scale(1.4); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        }
        @keyframes mcEscapePop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes mcSparkle {
          0%   { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-15px) scale(0); }
          50%  { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(-45px) scale(1.2); }
          100% { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-60px) scale(0.5); }
        }
      `}</style>
    </div>
  );
}
