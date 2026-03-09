import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Area, Tag, BallType } from '../types';
import { attemptCatch, BALL_NAMES, BALL_COLORS } from '../lib/battle';
import { ALL_TAGS, TYPE_EMOJI } from '../data/monsters';
import { shuffle } from '../lib/rng';
import TagCard from '../components/TagCard';
import BallWheel from '../components/BallWheel';
import CatchAnimation from '../components/CatchAnimation';
import MultiCatchAnimation from '../components/MultiCatchAnimation';
import { useNameReveal } from '../lib/nameMask';

type Phase = 'last-select' | 'ball-wheel' | 'multi-catch' | 'catch-result' | 'bonus' | 'bonus-stop' | 'bonus-result' | 'done';

export default function CatchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    area: Area;
    playerTags: Tag[];
    enemies: Tag[];
    catchGauge: number;
    bossDefeated: boolean;
  } | null;

  // Also handle "Catch Now" mode (no battle state)
  const isCatchNow = !state;

  const catchGauge = state?.catchGauge ?? 50;
  const enemies = state?.enemies ?? shuffle(ALL_TAGS.filter(t => t.grade <= 4)).slice(0, 3);
  const { dn } = useNameReveal();

  const [phase, setPhase] = useState<Phase>(isCatchNow ? 'last-select' : 'ball-wheel');
  const [selectedTarget, setSelectedTarget] = useState<Tag | null>(null);
  const [ballType, setBallType] = useState<BallType | null>(null);
  const [caught, setCaught] = useState(false);
  const [bonusGrid] = useState(() => shuffle(ALL_TAGS.filter(t => t.grade <= 3)).slice(0, 8));
  const [bonusCursor, setBonusCursor] = useState(0);
  const [bonusStopped, setBonusStopped] = useState(false);
  const [bonusCaught, setBonusCaught] = useState(false);
  const [caughtTags, setCaughtTags] = useState<Tag[]>([]);
  const [message, setMessage] = useState(isCatchNow ? '選擇一隻怪獸來捕獲！' : '旋轉轉盤決定球種！');

  /* Multi-catch state (battle mode: throw at all 3 enemies) */
  const [multiResults, setMultiResults] = useState<{ tag: Tag; success: boolean }[]>([]);
  const [showMultiCatchAnim, setShowMultiCatchAnim] = useState(false);
  const bonusRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Animation overlay state */
  const [showCatchAnim, setShowCatchAnim] = useState(false);
  const [animBall, setAnimBall] = useState<BallType>('poke');
  const [animEmoji, setAnimEmoji] = useState('⚪');
  const [animSuccess, setAnimSuccess] = useState(false);
  const animCallbackRef = useRef<(() => void) | null>(null);

  // Bonus cursor cycling
  useEffect(() => {
    if (phase === 'bonus' && !bonusStopped) {
      bonusRef.current = setInterval(() => {
        setBonusCursor(prev => (prev + 1) % bonusGrid.length);
      }, 150);
      return () => { if (bonusRef.current) clearInterval(bonusRef.current); };
    }
  }, [phase, bonusStopped, bonusGrid.length]);

  const selectTarget = (tag: Tag) => {
    if (phase !== 'last-select') return;
    setSelectedTarget(tag);
    setPhase('ball-wheel');
    setMessage(`目標鎖定 ${dn(tag.name)}！旋轉轉盤來決定球種！`);
  };

  const handleBallResult = (ball: BallType) => {
    setBallType(ball);

    if (isCatchNow) {
      /* Single-target catch (quick catch mode) */
      const success = attemptCatch(ball, catchGauge);
      setCaught(success);
      setAnimBall(ball);
      setAnimEmoji(selectedTarget ? (TYPE_EMOJI[selectedTarget.types[0]] || '⚪') : '⚪');
      setAnimSuccess(success);
      animCallbackRef.current = () => {
        if (success && selectedTarget) {
          setCaughtTags(prev => [...prev, selectedTarget]);
        }
        setPhase('catch-result');
        setMessage(success ? `🎉 捕獲到 ${dn(selectedTarget?.name ?? '')}！` : `💨 ${dn(selectedTarget?.name ?? '')} 逃跑了！`);
        setShowCatchAnim(false);
      };
      setShowCatchAnim(true);
      setMessage(`${BALL_NAMES[ball]}！投擲中...`);
    } else {
      /* Multi-catch: throw at all enemies simultaneously */
      const targets = enemies.slice(0, 3);
      const results = targets.map(tag => ({ tag, success: attemptCatch(ball, catchGauge) }));
      setMultiResults(results);
      setPhase('multi-catch');
      setMessage(`${BALL_NAMES[ball]}！向全部怪獸投擲中...`);
      setShowMultiCatchAnim(true);
    }
  };

  const handleMultiCatchComplete = () => {
    setShowMultiCatchAnim(false);
    const caught = multiResults.filter(r => r.success);
    setCaughtTags(prev => [...prev, ...caught.map(r => r.tag)]);
    const ct = caught.length;
    setPhase('catch-result');
    setMessage(
      ct === 0 ? '💨 全部逃跑了...'
      : ct === multiResults.length ? `🎉 全部捕獲！共 ${ct} 隻！`
      : `捕獲了 ${ct} 隻怪獸！`,
    );
  };

  const goToBonus = () => {
    setPhase('bonus');
    setBonusStopped(false);
    setMessage('額外捕獲時間！在草叢上停下游標！');
  };

  const stopBonus = () => {
    if (bonusStopped) return;
    setBonusStopped(true);
    if (bonusRef.current) clearInterval(bonusRef.current);
    setPhase('bonus-stop');
    setMessage(`降落在 ${dn(bonusGrid[bonusCursor].name)}！投擲精靈球中...`);

    const success = attemptCatch('poke', 50);
    setBonusCaught(success);

    /* Launch animation overlay for bonus */
    setAnimBall('poke');
    setAnimEmoji(TYPE_EMOJI[bonusGrid[bonusCursor].types[0]] || '⚪');
    setAnimSuccess(success);
    animCallbackRef.current = () => {
      if (success) {
        setCaughtTags(prev => [...prev, bonusGrid[bonusCursor]]);
      }
      setPhase('bonus-result');
      setMessage(success ? `🎉 額外捕獲: ${dn(bonusGrid[bonusCursor].name)}！` : '💨 從額外捕獲中逃跑了！');
      setShowCatchAnim(false);
    };
    setShowCatchAnim(true);
  };

  const goToResult = () => {
    navigate('/result', { state: { caughtTags, isCatchNow } });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl text-center mb-2 neon-text">
        {isCatchNow ? '快速捕獲' : '捕獲時間'}
      </h1>

      {/* Message */}
      <div className="text-center font-display text-sm py-2 px-4 rounded bg-primary/10 border border-primary/20 mb-6">
        {message}
      </div>

      {/* Catch Gauge */}
      {!isCatchNow && (
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-muted">捕獲計量表</span>
            <span className="text-neon-cyan">{Math.round(catchGauge)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-neon-cyan" style={{ width: `${catchGauge}%` }} />
          </div>
        </div>
      )}

      {/* Phase: Target Selection (CatchNow only) */}
      {phase === 'last-select' && isCatchNow && (
        <div>
          <p className="text-center text-text-muted text-sm mb-4">選擇一隻怪獸來捕獲：</p>
          <div className="flex justify-center gap-4">
            {enemies.slice(0, 3).map(tag => (
              <div key={tag.id} className="text-center">
                <TagCard tag={tag} size="md" onClick={() => selectTarget(tag)} />
                <button
                  onClick={() => selectTarget(tag)}
                  className="mt-2 px-3 py-1 text-xs bg-neon-cyan/20 text-neon-cyan rounded hover:bg-neon-cyan/30 font-display"
                >
                  目標
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase: Ball Wheel */}
      {phase === 'ball-wheel' && (
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">旋轉轉盤決定球種！</p>
          <BallWheel onResult={handleBallResult} />
        </div>
      )}

      {/* Phase: Multi-catch animation overlay */}
      {showMultiCatchAnim && ballType && (
        <MultiCatchAnimation
          targets={multiResults}
          ballType={ballType}
          onComplete={handleMultiCatchComplete}
        />
      )}

      {/* Phase: Catch Result */}
      {phase === 'catch-result' && (
        <div className="text-center">
          {isCatchNow ? (
            /* Single-target result (CatchNow) */
            caught ? (
              <div className="catch-success">
                <div className="text-6xl mb-4">🎉</div>
                <div className="font-display text-2xl text-neon-green mb-2">捕獲成功！</div>
                {selectedTarget && <TagCard tag={selectedTarget} size="lg" className="mx-auto" />}
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">💨</div>
                <div className="font-display text-xl text-text-muted mb-2">它逃跑了...</div>
              </div>
            )
          ) : (
            /* Multi-catch summary (battle) */
            <div>
              <div className="text-4xl mb-4">
                {multiResults.every(r => r.success) ? '🎉🎉🎉'
                  : multiResults.some(r => r.success) ? '🎉'
                  : '💨'}
              </div>
              <div className="flex justify-center gap-4 mb-4">
                {multiResults.map(r => (
                  <div key={r.tag.id} className="text-center relative">
                    <TagCard tag={r.tag} size="md" className={!r.success ? 'opacity-40 grayscale' : ''} />
                    <div className="mt-1 font-display text-xs">
                      {r.success
                        ? <span className="text-neon-green">捕獲成功 ✅</span>
                        : <span className="text-red-400">逃跑了 ❌</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-center gap-3">
            {!isCatchNow && (
              <button
                onClick={goToBonus}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-display rounded-lg text-sm"
              >
                → 額外捕獲
              </button>
            )}
            <button
              onClick={goToResult}
              className="px-4 py-2 bg-bg-card border border-white/10 text-text-primary font-display rounded-lg text-sm hover:bg-bg-card-hover"
            >
              → 查看結果
            </button>
          </div>
        </div>
      )}

      {/* Phase: Bonus Catch (Grass Grid) */}
      {(phase === 'bonus' || phase === 'bonus-stop') && (
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">在草叢上停下游標！</p>
          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mb-4">
            {bonusGrid.map((tag, i) => (
              <div
                key={i}
                className={`h-16 rounded-lg flex flex-col items-center justify-center text-sm transition-all border ${
                  i === bonusCursor
                    ? 'border-neon-green bg-neon-green/20 scale-110'
                    : 'border-white/10 bg-bg-card'
                } ${bonusStopped && i === bonusCursor ? 'ring-2 ring-neon-green' : ''}`}
              >
                <span className="text-lg">{TYPE_EMOJI[tag.types[0]]}</span>
                <span className="text-[9px] text-text-muted truncate w-full px-1">{dn(tag.name)}</span>
              </div>
            ))}
          </div>
          {phase === 'bonus' && !bonusStopped && (
            <button
              onClick={stopBonus}
              className="px-6 py-2 bg-neon-green/80 text-bg-dark font-display rounded-lg hover:bg-neon-green transition-all"
            >
              停止！
            </button>
          )}
        </div>
      )}

      {/* Phase: Bonus Result */}
      {phase === 'bonus-result' && (
        <div className="text-center">
          {bonusCaught ? (
            <div className="catch-success">
              <div className="text-4xl mb-2">🌿🎉</div>
              <div className="font-display text-xl text-neon-green">額外捕獲成功！</div>
              <p className="text-text-muted text-sm mt-1">{dn(bonusGrid[bonusCursor].name)} 加入了你的收藏！</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">🌿💨</div>
              <div className="font-display text-lg text-text-muted">從草叢中逃跑了...</div>
            </div>
          )}
          <button
            onClick={goToResult}
            className="mt-6 px-6 py-2 bg-accent text-white font-display rounded-lg hover:bg-accent-light"
          >
            → 查看結果
          </button>
        </div>
      )}

      {/* Catch animation overlay */}
      {showCatchAnim && (
        <CatchAnimation
          ballType={animBall}
          targetEmoji={animEmoji}
          success={animSuccess}
          onComplete={() => animCallbackRef.current?.()}
        />
      )}
    </div>
  );
}
