import { useState, useRef, useCallback, useEffect } from 'react';
import type { BallType } from '../types';
import { rollBallRoulette, BALL_NAMES, BALL_COLORS } from '../lib/battle';

interface Props {
  onResult: (ball: BallType) => void;
}

const SEGMENTS: { type: BallType; emoji: string; degrees: number; color: string }[] = [
  { type: 'poke', emoji: '⚪', degrees: 144, color: '#EF4444' },
  { type: 'great', emoji: '🔵', degrees: 108, color: '#3B82F6' },
  { type: 'ultra', emoji: '🟡', degrees: 72, color: '#FBBF24' },
  { type: 'master', emoji: '🟣', degrees: 36, color: '#7C3AED' },
];

type WheelPhase = 'idle' | 'spinning' | 'stopping' | 'done';

export default function BallWheel({ onResult }: Props) {
  const [phase, setPhase] = useState<WheelPhase>('idle');
  const [rotation, setRotation] = useState(0);
  const [resultBall, setResultBall] = useState<BallType | null>(null);

  const phaseRef = useRef<WheelPhase>('idle');
  const rotRef = useRef(0);
  const targetRef = useRef(0);
  const resultRef = useRef<BallType | null>(null);
  const rafRef = useRef(0);
  const speedRef = useRef(8);
  const frictionRef = useRef(0.99);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const getAngleForBall = (ball: BallType): number => {
    let start = 0;
    for (const seg of SEGMENTS) {
      if (seg.type === ball) return start + Math.random() * seg.degrees;
      start += seg.degrees;
    }
    return 0;
  };

  const animate = useCallback(() => {
    if (phaseRef.current === 'spinning') {
      rotRef.current += 8;
      speedRef.current = 8;
      setRotation(rotRef.current);
      rafRef.current = requestAnimationFrame(animate);
    } else if (phaseRef.current === 'stopping') {
      speedRef.current *= frictionRef.current;
      const remaining = targetRef.current - rotRef.current;
      if (remaining <= 0.5 || speedRef.current < 0.15) {
        rotRef.current = targetRef.current;
        setRotation(rotRef.current);
        phaseRef.current = 'done';
        setPhase('done');
        if (resultRef.current) onResultRef.current(resultRef.current);
        return;
      }
      rotRef.current += Math.min(speedRef.current, remaining);
      setRotation(rotRef.current);
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleClick = () => {
    if (phaseRef.current === 'idle') {
      phaseRef.current = 'spinning';
      setPhase('spinning');
      rafRef.current = requestAnimationFrame(animate);
    } else if (phaseRef.current === 'spinning') {
      const ball = rollBallRoulette();
      resultRef.current = ball;
      setResultBall(ball);
      const angleForBall = getAngleForBall(ball);
      const currentRot = rotRef.current;
      const extraSpins = 2;
      const remainder = ((currentRot % 360) + 360) % 360;
      const neededRemainder = (360 - angleForBall) % 360;
      const delta = ((neededRemainder - remainder) + 360) % 360;
      targetRef.current = currentRot + extraSpins * 360 + delta;
      // Compute friction so deceleration from current speed covers exact distance
      const totalDist = targetRef.current - rotRef.current;
      frictionRef.current = 1 - (speedRef.current / totalDist);
      phaseRef.current = 'stopping';
      setPhase('stopping');
    }
  };

  // Build conic gradient
  const gradient = (() => {
    let angle = 0;
    const stops: string[] = [];
    for (const seg of SEGMENTS) {
      stops.push(`${seg.color} ${angle}deg ${angle + seg.degrees}deg`);
      angle += seg.degrees;
    }
    return `conic-gradient(from 0deg, ${stops.join(', ')})`;
  })();

  // Calculate label positions
  const labels = (() => {
    const size = 256; // w-64 = 256px
    const r = size * 0.33;
    let startAngle = 0;
    return SEGMENTS.map(seg => {
      const mid = startAngle + seg.degrees / 2;
      const rad = (mid - 90) * (Math.PI / 180);
      const x = size / 2 + r * Math.cos(rad);
      const y = size / 2 + r * Math.sin(rad);
      startAngle += seg.degrees;
      return { ...seg, x, y, midAngle: mid };
    });
  })();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Pointer */}
      <div className="text-3xl text-neon-cyan" style={{ filter: 'drop-shadow(0 0 6px cyan)' }}>▼</div>

      {/* Wheel */}
      <div
        className="relative w-64 h-64 rounded-full border-4 border-white/20 cursor-pointer select-none shadow-xl"
        style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
        onClick={phase !== 'done' ? handleClick : undefined}
      >
        {/* Sector labels — counter-rotate so text stays readable */}
        {labels.map(seg => (
          <div
            key={seg.type}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: seg.x,
              top: seg.y,
              transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
            }}
          >
            <span className="text-xl drop-shadow-lg">{seg.emoji}</span>
            <span className="text-[10px] font-bold whitespace-nowrap drop-shadow-lg">{BALL_NAMES[seg.type]}</span>
          </div>
        ))}

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-bg-dark border-2 border-white/30" />
        </div>
      </div>

      {/* Action button / status */}
      {phase === 'idle' && (
        <button
          onClick={handleClick}
          className="px-6 py-2 bg-accent text-white font-display rounded-lg hover:bg-accent-light transition-all"
        >
          旋轉！
        </button>
      )}
      {phase === 'spinning' && (
        <button
          onClick={handleClick}
          className="px-6 py-2 bg-neon-green/80 text-bg-dark font-display rounded-lg hover:bg-neon-green transition-all animate-pulse"
        >
          停止！
        </button>
      )}
      {phase === 'stopping' && (
        <div className="font-display text-sm text-text-muted animate-pulse">轉盤減速中...</div>
      )}
      {phase === 'done' && resultBall && (
        <div className="font-display text-xl" style={{ color: BALL_COLORS[resultBall] }}>
          {BALL_NAMES[resultBall]}！
        </div>
      )}
    </div>
  );
}
