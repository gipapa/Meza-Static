import { useCallback, useEffect, useRef, useState } from 'react';
import type { Tag } from '../types';
import CharacterArt from './CharacterArt';
import StepDialog from './StepDialog';
import { useNameReveal } from '../lib/nameMask';
import { allyClipPath, duelGeometry, splitLineClipPath } from '../lib/speedDuel';
import type { SpeedDuelStage as Stage } from '../lib/speedDuel';

const CHALLENGE_MS = 4000;
const TARGET_TAPS = 8;

export default function SpeedCompareDialog({ ally, enemy, onComplete }: {
  ally: Tag;
  enemy: Tag;
  onComplete: (playerFirst: boolean) => void;
}) {
  const { dn } = useNameReveal();
  const [stage, setStage] = useState<Stage>(() => ally.stats.spd >= enemy.stats.spd ? 'fast' : 'ready');
  const [taps, setTaps] = useState(0);
  const [remaining, setRemaining] = useState(CHALLENGE_MS);
  const deadlineRef = useRef(0);
  const tapsRef = useRef(0);
  const finishedRef = useRef(false);
  const completeRef = useRef(onComplete);
  const enemyRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (stage !== 'fast' && stage !== 'won' && stage !== 'lost') return;
    const timer = setTimeout(() => completeRef.current(stage !== 'lost'), stage === 'fast' ? 2000 : 1600);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'running') return;
    const timer = setInterval(() => {
      const left = Math.max(0, deadlineRef.current - Date.now());
      setRemaining(left);
      if (left === 0 && !finishedRef.current) {
        finishedRef.current = true;
        setStage('lost');
      }
    }, 50);
    return () => clearInterval(timer);
  }, [stage]);

  const tap = useCallback(() => {
    if (stage !== 'running' || finishedRef.current) return;
    if (Date.now() >= deadlineRef.current) {
      finishedRef.current = true;
      setRemaining(0);
      setStage('lost');
      return;
    }
    tapsRef.current += 1;
    setTaps(tapsRef.current);
    const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      enemyRef.current?.animate?.([
        { transform: 'translate(0, 0)' },
        { transform: 'translate(6px, -6px) rotate(4deg)', offset: 0.3 },
        { transform: 'translate(0, 0)' },
      ], { duration: 250, easing: 'ease-out' });
      lineRef.current?.animate?.([{ filter: 'brightness(2.5)' }, { filter: 'brightness(1)' }], { duration: 250, easing: 'ease-out' });
    }
    if (tapsRef.current >= TARGET_TAPS) {
      finishedRef.current = true;
      setStage('won');
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== 'running') return;
    const handler = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      if (!event.repeat) tap();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage, tap]);

  const start = () => {
    deadlineRef.current = Date.now() + CHALLENGE_MS;
    setStage('running');
  };
  const fast = stage === 'fast';
  const won = stage === 'won';
  const result = won || stage === 'lost';
  const geometry = duelGeometry(stage, taps, TARGET_TAPS);

  return (
    <StepDialog title={fast ? '⚡ 雙方速度比較' : '⚡ 連打以決定誰先攻'}>
      {fast ? (
        <div className="grid grid-cols-2 gap-3 text-center mb-5">
          {[{ tag: ally, side: '我方' }, { tag: enemy, side: '敵方' }].map(({ tag, side }) => (
            <div key={side} className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-xs text-text-muted mb-3">{side}</p>
              <CharacterArt tag={tag} className="text-4xl mb-2" />
              <p className="font-display text-sm">{dn(tag.name)}</p>
              <p className="text-gold font-display mt-2">SPD {tag.stats.spd}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative h-80 sm:h-96 overflow-hidden rounded-xl border border-white/20 mb-4 select-none"
          data-testid="speed-duel" data-stage={stage} data-split={geometry.split.toFixed(1)}
          role="group" aria-label={`速度對峙：上方敵方 ${dn(enemy.name)}，下方我方 ${dn(ally.name)}`}>
          {/* Enemy side fills the arena; the ally side is drawn over it and grows upward. */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-950 via-red-900/70 to-red-500/40">
            <div className="absolute top-2 right-2" ref={enemyRef}>
              <CharacterArt tag={enemy} className="text-[8.5rem] sm:text-[10rem] drop-shadow-[0_0_18px_rgba(248,113,113,0.6)]" scale={1} />
            </div>
            <div className="absolute top-3 left-3 max-w-[45%]">
              <p className="text-xs text-red-200">敵方</p>
              <p className="font-display text-base truncate">{dn(enemy.name)}</p>
              <p className="text-xs text-red-200">SPD {enemy.stats.spd}</p>
            </div>
          </div>
          <div className="absolute inset-0 duel-shift bg-blue-950 bg-gradient-to-t from-blue-950 via-blue-900/80 to-cyan-500/40"
            style={{ clipPath: allyClipPath(geometry) }}>
            <div className={`absolute duel-shift ${won ? 'opacity-0' : 'opacity-100'} bottom-2 left-2`}>
              <CharacterArt tag={ally} className="text-[8.5rem] sm:text-[10rem] drop-shadow-[0_0_18px_rgba(103,232,249,0.6)]" scale={1} />
            </div>
            <div className={`absolute bottom-3 right-3 max-w-[45%] text-right duel-shift ${won ? 'opacity-0' : 'opacity-100'}`}>
              <p className="text-xs text-cyan-200">我方</p>
              <p className="font-display text-base truncate">{dn(ally.name)}</p>
              <p className="text-xs text-cyan-200">SPD {ally.stats.spd}</p>
            </div>
          </div>
          {!result && (
            <>
              <div aria-hidden="true" ref={lineRef} data-testid="speed-duel-line"
                className="absolute inset-0 duel-shift bg-cyan-200 pointer-events-none"
                style={{ clipPath: splitLineClipPath(geometry) }} />
              <span aria-hidden="true" style={{ top: `${geometry.split}%` }}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 duel-shift rounded-full border border-cyan-200 bg-bg-dark px-2.5 py-2 text-gold font-display italic shadow-[0_0_14px_rgba(103,232,249,0.7)]">VS</span>
            </>
          )}
          {won && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 duel-reveal" data-testid="speed-duel-victory">
              <CharacterArt tag={ally} className="text-[13rem] sm:text-[15rem] drop-shadow-[0_0_28px_rgba(103,232,249,0.8)]" scale={1} />
              <p className="font-display text-lg text-white">{dn(ally.name)}</p>
            </div>
          )}
          {stage === 'lost' && (
            <div className="absolute inset-0 flex items-center justify-center duel-reveal" aria-hidden="true">
              <span className="font-display text-2xl italic text-red-200 drop-shadow">敵方先攻！</span>
            </div>
          )}
        </div>
      )}

      {fast ? (
        <p role="status" className="text-center text-neon-cyan font-display">{ally.stats.spd === enemy.stats.spd ? '雙方速度相同，我方先攻！' : `${dn(ally.name)} 速度較快，先攻！`}</p>
      ) : result ? (
        <p role="status" className={`text-center font-display py-4 ${stage === 'won' ? 'text-neon-cyan' : 'text-red-300'}`}>
          {stage === 'won' ? `挑戰成功！${dn(ally.name)} 搶到先攻！` : `未達連打門檻，${dn(enemy.name)} 先攻！`}
        </p>
      ) : (
        <>
          <p className="text-center text-sm mb-3">我方速度較慢，{CHALLENGE_MS / 1000} 秒內連打 {TARGET_TAPS} 次就能搶到先攻！</p>
          <div className="flex justify-between text-sm mb-2" role="status" aria-live="off">
            <span>連打 {taps} / {TARGET_TAPS} 次</span>
            <span>剩餘 {(remaining / 1000).toFixed(1)} 秒</span>
          </div>
          <div role="progressbar" aria-label="先攻挑戰進度" aria-valuenow={taps} aria-valuemin={0} aria-valuemax={TARGET_TAPS} className="h-3 rounded-full bg-white/10 overflow-hidden mb-4">
            <div className="h-full bg-neon-cyan transition-all duration-100" style={{ width: `${Math.min(100, taps / TARGET_TAPS * 100)}%` }} />
          </div>
          <button type="button" onClick={stage === 'ready' ? start : tap}
            className={`w-full min-h-16 rounded-xl font-display text-xl text-white touch-manipulation select-none ${stage === 'running' ? 'bg-accent active:scale-95' : 'bg-primary hover:bg-primary-light'}`}>
            {stage === 'ready' ? '準備好了，開始！' : '⚡ 連打搶先攻！'}
          </button>
          <p className="text-center text-xs text-text-muted mt-2">{stage === 'ready' ? '按開始後才會倒數' : '點擊按鈕，或連按空白鍵'}</p>
        </>
      )}
    </StepDialog>
  );
}
