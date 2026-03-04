import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_TAGS, TYPE_EMOJI, TYPE_COLORS } from '../data/monsters';
import { shuffle } from '../lib/rng';
import { rollBallRoulette, attemptCatch, BALL_NAMES, BALL_COLORS } from '../lib/battle';
import type { Tag, BallType } from '../types';
import TagCard from '../components/TagCard';

type Phase = 'encounter' | 'ball-spin' | 'result';

export default function CatchNowPage() {
  const navigate = useNavigate();
  const [pool] = useState(() => shuffle(ALL_TAGS.filter(t => t.grade <= 4)).slice(0, 3));
  const [selected, setSelected] = useState<Tag | null>(null);
  const [phase, setPhase] = useState<Phase>('encounter');
  const [ballType, setBallType] = useState<BallType | null>(null);
  const [ballDisplay, setBallDisplay] = useState<BallType>('poke');
  const [caught, setCaught] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const doEncounter = (tag: Tag) => {
    setSelected(tag);
    setPhase('ball-spin');
    setSpinning(true);
    // Auto-spin ball display
    const iv = setInterval(() => {
      setBallDisplay(['poke', 'great', 'ultra', 'master'][Math.floor(Math.random() * 4)] as BallType);
    }, 100);
    setTimeout(() => {
      clearInterval(iv);
      setSpinning(false);
    }, 99999); // user must click stop
    // Store interval so stop can clear it
    (window as any).__ballIv = iv;
  };

  const stopBall = () => {
    if (!spinning) return;
    clearInterval((window as any).__ballIv);
    setSpinning(false);
    const ball = rollBallRoulette();
    setBallType(ball);
    setBallDisplay(ball);

    setTimeout(() => {
      const success = attemptCatch(ball, 50);
      setCaught(success);
      setPhase('result');
    }, 1200);
  };

  const goResult = () => {
    navigate('/result', {
      state: { caughtTags: caught && selected ? [selected] : [], isCatchNow: true },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h1 className="font-display text-3xl mb-2 neon-text">快速捕獲</h1>
      <p className="text-text-muted mb-8">快速遇見 — 不需要對戰！</p>

      {phase === 'encounter' && (
        <div>
          <p className="text-text-muted text-sm mb-4">選擇一隻野生怪獸來遇見：</p>
          <div className="flex justify-center gap-4">
            {pool.map(tag => (
              <div key={tag.id} className="text-center">
                <TagCard tag={tag} size="md" onClick={() => doEncounter(tag)} />
                <button
                  onClick={() => doEncounter(tag)}
                  className="mt-2 px-3 py-1 text-xs bg-neon-cyan/20 text-neon-cyan rounded hover:bg-neon-cyan/30 font-display"
                >
                  遇見
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'ball-spin' && selected && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-text-muted mb-2">野生的 <span className="text-neon-cyan">{selected.name}</span> 出現了！</p>
            <div className="text-5xl mb-2" style={{ filter: `drop-shadow(0 0 12px ${TYPE_COLORS[selected.types[0]]})` }}>
              {TYPE_EMOJI[selected.types[0]]}
            </div>
          </div>
          <p className="text-text-muted text-sm mb-4">球種轉盤 — 點擊「停止」！</p>
          <div className="flex justify-center gap-3 mb-4">
            {(['poke', 'great', 'ultra', 'master'] as BallType[]).map(b => (
              <div
                key={b}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                  ballDisplay === b ? 'scale-125 border-white' : 'border-white/20 opacity-40'
                }`}
                style={{ background: BALL_COLORS[b] + '44', borderColor: ballDisplay === b ? BALL_COLORS[b] : undefined }}
              >
                {b === 'poke' ? '⚪' : b === 'great' ? '🔵' : b === 'ultra' ? '🟡' : '🟣'}
              </div>
            ))}
          </div>
          {spinning ? (
            <button
              onClick={stopBall}
              className="px-6 py-2 bg-accent text-white font-display rounded-lg hover:bg-accent-light transition-all"
            >
              停止！
            </button>
          ) : ballType ? (
            <div className="font-display text-lg" style={{ color: BALL_COLORS[ballType] }}>
              {BALL_NAMES[ballType]} — 投擲中...
            </div>
          ) : null}
        </div>
      )}

      {phase === 'result' && (
        <div>
          {caught && selected ? (
            <div className="catch-success">
              <div className="text-6xl mb-4">🎉</div>
              <div className="font-display text-2xl text-neon-green mb-4">捕獲成功！</div>
              <TagCard tag={selected} size="lg" className="mx-auto" />
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">💨</div>
              <div className="font-display text-xl text-text-muted mb-4">{selected?.name} 逃跑了...</div>
            </div>
          )}
          <button
            onClick={goResult}
            className="mt-6 px-6 py-2 bg-accent text-white font-display rounded-lg hover:bg-accent-light"
          >
            → 查看結果
          </button>
        </div>
      )}
    </div>
  );
}
