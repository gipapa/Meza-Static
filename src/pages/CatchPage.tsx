import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Area, Tag, BallType } from '../types';
import { rollBallRoulette, attemptCatch, BALL_NAMES, BALL_COLORS } from '../lib/battle';
import { ALL_TAGS, TYPE_EMOJI } from '../data/monsters';
import { pick, shuffle } from '../lib/rng';
import TagCard from '../components/TagCard';

type Phase = 'last-select' | 'ball-roulette' | 'ball-spinning' | 'catch-result' | 'bonus' | 'bonus-stop' | 'bonus-result' | 'done';

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
  const enemies = state?.enemies ?? shuffle(ALL_TAGS).slice(0, 3);

  const [phase, setPhase] = useState<Phase>('last-select');
  const [selectedTarget, setSelectedTarget] = useState<Tag | null>(null);
  const [ballType, setBallType] = useState<BallType | null>(null);
  const [ballDisplay, setBallDisplay] = useState<BallType>('poke');
  const [caught, setCaught] = useState(false);
  const [bonusGrid] = useState(() => shuffle(ALL_TAGS.filter(t => t.grade <= 3)).slice(0, 8));
  const [bonusCursor, setBonusCursor] = useState(0);
  const [bonusStopped, setBonusStopped] = useState(false);
  const [bonusCaught, setBonusCaught] = useState(false);
  const [caughtTags, setCaughtTags] = useState<Tag[]>([]);
  const [message, setMessage] = useState('Choose a monster to catch!');
  const ballSpinRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bonusRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ballTypes: BallType[] = ['poke', 'great', 'ultra', 'master'];

  // Ball roulette spinning
  useEffect(() => {
    if (phase === 'ball-spinning') {
      ballSpinRef.current = setInterval(() => {
        setBallDisplay(pick(ballTypes));
      }, 100);
      return () => { if (ballSpinRef.current) clearInterval(ballSpinRef.current); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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
    setPhase('ball-spinning');
    setMessage(`Targeting ${tag.name}! Tap STOP for the Ball Roulette!`);
  };

  const stopBallRoulette = () => {
    if (phase !== 'ball-spinning') return;
    const ball = rollBallRoulette();
    setBallType(ball);
    setBallDisplay(ball);
    if (ballSpinRef.current) clearInterval(ballSpinRef.current);
    setPhase('ball-roulette');
    setMessage(`${BALL_NAMES[ball]}! Throwing...`);

    setTimeout(() => {
      const success = attemptCatch(ball, catchGauge);
      setCaught(success);
      if (success && selectedTarget) {
        setCaughtTags(prev => [...prev, selectedTarget]);
      }
      setPhase('catch-result');
      setMessage(success ? `🎉 Caught ${selectedTarget?.name}!` : `💨 ${selectedTarget?.name} escaped!`);
    }, 1500);
  };

  const goToBonus = () => {
    setPhase('bonus');
    setBonusStopped(false);
    setMessage('Bonus Catch Time! Stop the cursor on the grass!');
  };

  const stopBonus = () => {
    if (bonusStopped) return;
    setBonusStopped(true);
    if (bonusRef.current) clearInterval(bonusRef.current);
    setPhase('bonus-stop');
    setMessage(`Landed on ${bonusGrid[bonusCursor].name}! Throwing Poké Ball...`);

    setTimeout(() => {
      const success = attemptCatch('poke', 50);
      setBonusCaught(success);
      if (success) {
        setCaughtTags(prev => [...prev, bonusGrid[bonusCursor]]);
      }
      setPhase('bonus-result');
      setMessage(success ? `🎉 Bonus catch: ${bonusGrid[bonusCursor].name}!` : '💨 It escaped from the bonus!');
    }, 1500);
  };

  const goToResult = () => {
    navigate('/result', { state: { caughtTags, isCatchNow } });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl text-center mb-2 neon-text">
        {isCatchNow ? 'CATCH NOW' : 'CATCH TIME'}
      </h1>

      {/* Message */}
      <div className="text-center font-display text-sm py-2 px-4 rounded bg-primary/10 border border-primary/20 mb-6">
        {message}
      </div>

      {/* Catch Gauge */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-muted">CATCH GAUGE</span>
          <span className="text-neon-cyan">{Math.round(catchGauge)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-neon-cyan" style={{ width: `${catchGauge}%` }} />
        </div>
      </div>

      {/* Phase: Target Selection */}
      {phase === 'last-select' && (
        <div>
          <p className="text-center text-text-muted text-sm mb-4">Choose one monster to catch:</p>
          <div className="flex justify-center gap-4">
            {enemies.slice(0, 3).map(tag => (
              <div key={tag.id} className="text-center">
                <TagCard tag={tag} size="md" onClick={() => selectTarget(tag)} />
                <button
                  onClick={() => selectTarget(tag)}
                  className="mt-2 px-3 py-1 text-xs bg-neon-cyan/20 text-neon-cyan rounded hover:bg-neon-cyan/30 font-display"
                >
                  TARGET
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase: Ball Roulette */}
      {(phase === 'ball-spinning' || phase === 'ball-roulette') && (
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">Ball Roulette</p>
          <div className="flex justify-center gap-3 mb-4">
            {ballTypes.map(b => (
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
          {phase === 'ball-spinning' && (
            <button
              onClick={stopBallRoulette}
              className="px-6 py-2 bg-accent text-white font-display rounded-lg hover:bg-accent-light transition-all"
            >
              STOP!
            </button>
          )}
          {phase === 'ball-roulette' && ballType && (
            <div className="text-xl font-display mt-2" style={{ color: BALL_COLORS[ballType] }}>
              {BALL_NAMES[ballType]}
            </div>
          )}
        </div>
      )}

      {/* Phase: Catch Result */}
      {phase === 'catch-result' && (
        <div className="text-center">
          {caught ? (
            <div className="catch-success">
              <div className="text-6xl mb-4">🎉</div>
              <div className="font-display text-2xl text-neon-green mb-2">CAUGHT!</div>
              {selectedTarget && <TagCard tag={selectedTarget} size="lg" className="mx-auto" />}
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">💨</div>
              <div className="font-display text-xl text-text-muted mb-2">It got away...</div>
            </div>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={goToBonus}
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-display rounded-lg text-sm"
            >
              → BONUS CATCH
            </button>
            <button
              onClick={goToResult}
              className="px-4 py-2 bg-bg-card border border-white/10 text-text-primary font-display rounded-lg text-sm hover:bg-bg-card-hover"
            >
              → RESULTS
            </button>
          </div>
        </div>
      )}

      {/* Phase: Bonus Catch (Grass Grid) */}
      {(phase === 'bonus' || phase === 'bonus-stop') && (
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">Stop the cursor on the grass!</p>
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
                <span className="text-[9px] text-text-muted truncate w-full px-1">{tag.name}</span>
              </div>
            ))}
          </div>
          {phase === 'bonus' && !bonusStopped && (
            <button
              onClick={stopBonus}
              className="px-6 py-2 bg-neon-green/80 text-bg-dark font-display rounded-lg hover:bg-neon-green transition-all"
            >
              STOP!
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
              <div className="font-display text-xl text-neon-green">BONUS CATCH!</div>
              <p className="text-text-muted text-sm mt-1">{bonusGrid[bonusCursor].name} joined your collection!</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">🌿💨</div>
              <div className="font-display text-lg text-text-muted">Escaped from the grass...</div>
            </div>
          )}
          <button
            onClick={goToResult}
            className="mt-6 px-6 py-2 bg-accent text-white font-display rounded-lg hover:bg-accent-light"
          >
            → VIEW RESULTS
          </button>
        </div>
      )}
    </div>
  );
}
