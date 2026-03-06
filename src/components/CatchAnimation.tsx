import { useState, useEffect, useRef } from 'react';
import type { BallType } from '../types';
import { BALL_COLORS } from '../lib/battle';
import { randInt } from '../lib/rng';
import AnimationOverlay from './AnimationOverlay';

interface Props {
  ballType: BallType;
  targetEmoji: string;
  success: boolean;
  onComplete: () => void;
}

/*
 * Animation stages:
 * 1. throw    — ball flies from bottom to center (~0.6s)
 * 2. absorb   — target shrinks into ball (~0.6s)
 * 3. shake    — ball wobbles 1–3 times (~0.5s each)
 * 4. result   — sparkles (caught) or pop-out (escaped) (~1s)
 */

type Stage = 'throw' | 'absorb' | 'shake' | 'result';

const BALL_EMOJI: Record<BallType, string> = {
  poke: '⚪',
  great: '🔵',
  ultra: '🟡',
  master: '🟣',
};

export default function CatchAnimation({ ballType, targetEmoji, success, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('throw');
  const [shakeCount] = useState(() => randInt(1, 3));
  const [currentShake, setCurrentShake] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const ballColor = BALL_COLORS[ballType];

  useEffect(() => {
    // Stage progression
    if (stage === 'throw') {
      timerRef.current = setTimeout(() => setStage('absorb'), 700);
    } else if (stage === 'absorb') {
      timerRef.current = setTimeout(() => {
        setStage('shake');
        setCurrentShake(1);
      }, 700);
    } else if (stage === 'shake') {
      if (currentShake <= shakeCount) {
        timerRef.current = setTimeout(() => {
          if (currentShake < shakeCount) {
            setCurrentShake(prev => prev + 1);
          } else {
            setStage('result');
          }
        }, 1100);
      }
    } else if (stage === 'result') {
      timerRef.current = setTimeout(onComplete, 1400);
    }
    return () => clearTimeout(timerRef.current);
  }, [stage, currentShake, shakeCount, success, onComplete]);

  return (
    <AnimationOverlay>

        {/* Target creature */}
        <div
          className="absolute text-6xl transition-all duration-500"
          style={{
            top: '25%',
            opacity: stage === 'throw' ? 1 : 0,
            transform: stage === 'absorb' || stage === 'shake' || stage === 'result'
              ? 'scale(0) translateY(40px)'
              : 'scale(1)',
            ...(stage === 'result' && !success ? { opacity: 1, transform: 'scale(1)', transition: 'all 0.4s ease-out' } : {}),
          }}
        >
          {targetEmoji}
        </div>

        {/* Ball */}
        <div
          className="absolute text-5xl"
          style={{
            /* throw: start from bottom, fly to center */
            ...(stage === 'throw'
              ? {
                  bottom: '10%',
                  animation: 'catchBallThrow 0.6s ease-out forwards',
                }
              : {
                  top: '42%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }),
            /* shake wobble */
            ...(stage === 'shake'
              ? { animation: `catchBallShake 1.0s ease-in-out` }
              : {}),
            /* result: success sparkle or failure pop */
            ...(stage === 'result' && success
              ? { animation: 'catchBallSuccess 0.6s ease-in-out' }
              : {}),
            ...(stage === 'result' && !success
              ? { animation: 'catchBallFail 0.4s ease-out forwards', opacity: 0 }
              : {}),
          }}
          key={`shake-${currentShake}`} /* re-trigger animation on each shake */
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4"
            style={{
              background: `${ballColor}33`,
              borderColor: ballColor,
              boxShadow: `0 0 20px ${ballColor}66`,
            }}
          >
            {BALL_EMOJI[ballType]}
          </div>
        </div>

        {/* Escape pop — creature reappears */}
        {stage === 'result' && !success && (
          <div
            className="absolute text-6xl"
            style={{
              top: '25%',
              animation: 'catchEscapePop 0.5s ease-out 0.3s both',
            }}
          >
            {targetEmoji}
          </div>
        )}

        {/* Success sparkles */}
        {stage === 'result' && success && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {['✨', '⭐', '🌟', '✨'].map((s, i) => (
              <span
                key={i}
                className="absolute text-2xl"
                style={{
                  animation: `catchSparkle 0.8s ease-out ${i * 0.15}s both`,
                  transform: `rotate(${i * 90}deg) translateY(-50px)`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Status text */}
        <div className="absolute bottom-4 font-display text-sm text-center w-full">
          {stage === 'throw' && <span className="text-text-muted">投擲中...</span>}
          {stage === 'absorb' && <span style={{ color: ballColor }}>吸入中！</span>}
          {stage === 'shake' && (
            <span className="text-text-muted">
              {'● '.repeat(currentShake)}{'○ '.repeat(shakeCount - currentShake)}
            </span>
          )}
          {stage === 'result' && success && (
            <span className="text-neon-green text-lg">捕獲成功！🎉</span>
          )}
          {stage === 'result' && !success && (
            <span className="text-red-400 text-lg">逃跑了！💨</span>
          )}
        </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes catchBallThrow {
          0%   { transform: translateY(0) scale(0.5); opacity: 0.6; }
          50%  { transform: translateY(-120px) scale(1.1) rotate(-15deg); }
          100% { transform: translateY(-100px) scale(1); opacity: 1; }
        }
        @keyframes catchBallShake {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          20%  { transform: translate(-50%, -50%) rotate(12deg); }
          40%  { transform: translate(-50%, -50%) rotate(-12deg); }
          60%  { transform: translate(-50%, -50%) rotate(8deg); }
          80%  { transform: translate(-50%, -50%) rotate(-8deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes catchBallSuccess {
          0%   { transform: translate(-50%, -50%) scale(1); }
          50%  { transform: translate(-50%, -50%) scale(1.3); filter: brightness(1.5); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes catchBallFail {
          0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50%  { transform: translate(-50%, -50%) scale(1.4); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        }
        @keyframes catchEscapePop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes catchSparkle {
          0%   { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-20px) scale(0); }
          50%  { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(-60px) scale(1.2); }
          100% { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-80px) scale(0.5); }
        }
      `}</style>
    </AnimationOverlay>
  );
}
