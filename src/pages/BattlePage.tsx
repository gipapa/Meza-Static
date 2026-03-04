import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Area, Tag, TurnRecord } from '../types';
import { getTagById } from '../data/monsters';
import { TYPE_COLORS, TYPE_EMOJI } from '../data/monsters';
import { calcDamage, rollAttackRoulette, calcBossMaxHp } from '../lib/battle';
import TagCard from '../components/TagCard';
import BattleAnimation from '../components/BattleAnimation';
import BattleProjectile, { getProjectileDuration } from '../components/BattleProjectile';

type Phase = 'select-attacker' | 'roulette' | 'mash' | 'damage-anim' | 'turn-end' | 'battle-end';

export default function BattlePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { area, playerTags } = (location.state as { area: Area; playerTags: Tag[] }) || {};

  useEffect(() => {
    if (!area || !playerTags) navigate('/play/area');
  }, [area, playerTags, navigate]);

  if (!area || !playerTags) return null;

  return <BattleArena area={area} playerTags={playerTags} />;
}

function BattleArena({ area, playerTags }: { area: Area; playerTags: Tag[] }) {
  const navigate = useNavigate();
  const boss = getTagById(area.bossPool[0])!;
  const minions = area.minionPool.map(id => getTagById(id)!);

  const bossMaxHp = calcBossMaxHp(boss);
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [catchGauge, setCatchGauge] = useState(0);
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<Phase>('select-attacker');
  const [selectedLane, setSelectedLane] = useState<number | null>(null);
  const [rouletteValue, setRouletteValue] = useState<number | null>(null);
  const [rouletteDisplay, setRouletteDisplay] = useState(1);
  const [mashCount, setMashCount] = useState(0);
  const [mashTimeLeft, setMashTimeLeft] = useState(0);
  const [lastDamage, setLastDamage] = useState(0);
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [message, setMessage] = useState('選擇你的攻擊者！');
  const [showAnim, setShowAnim] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [showProjectile, setShowProjectile] = useState(false);
  const [projectileFrom, setProjectileFrom] = useState<{x:number;y:number}|null>(null);
  const [projectileTo, setProjectileTo] = useState<{x:number;y:number}|null>(null);
  const [showHit, setShowHit] = useState(false);
  const mashTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rouletteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const bossRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<(HTMLDivElement|null)[]>([]);

  // Roulette spinning animation
  useEffect(() => {
    if (phase === 'roulette' && rouletteValue === null) {
      rouletteTimer.current = setInterval(() => {
        setRouletteDisplay(Math.floor(Math.random() * 10) + 1);
      }, 80);
      return () => { if (rouletteTimer.current) clearInterval(rouletteTimer.current); };
    }
  }, [phase, rouletteValue]);

  // Mash countdown
  useEffect(() => {
    if (phase === 'mash' && mashTimeLeft > 0) {
      mashTimer.current = setInterval(() => {
        setMashTimeLeft(prev => {
          if (prev <= 100) {
            if (mashTimer.current) clearInterval(mashTimer.current);
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      return () => { if (mashTimer.current) clearInterval(mashTimer.current); };
    }
    if (phase === 'mash' && mashTimeLeft === 0 && mashCount >= 0 && selectedLane !== null && rouletteValue !== null) {
      // Mash phase ended
      const attacker = playerTags[selectedLane];
      const dmg = calcDamage(attacker, rouletteValue, mashCount);
      setLastDamage(dmg);

      // Calculate projectile start / end positions
      const attackerEl = laneRefs.current[selectedLane];
      const bossEl = bossRef.current;
      if (attackerEl && bossEl) {
        const aRect = attackerEl.getBoundingClientRect();
        const bRect = bossEl.getBoundingClientRect();
        setProjectileFrom({ x: aRect.left + aRect.width / 2, y: aRect.top });
        setProjectileTo({ x: bRect.left + bRect.width / 2, y: bRect.top + bRect.height / 2 });
      }

      setShowProjectile(true);
      setAnimKey(prev => prev + 1);
      setPhase('damage-anim');
      setMessage(`${attacker.name} 造成了 ${dmg} 點傷害！`);

      const projDur = getProjectileDuration(attacker.move.type);
      setTimeout(() => {
        const newHp = Math.max(0, bossHp - dmg);
        setBossHp(newHp);
        const gaugeIncrease = (dmg / bossMaxHp) * 100;
        setCatchGauge(prev => Math.min(100, prev + gaugeIncrease));

        setTurns(prev => [...prev, {
          attackerLane: selectedLane,
          roulette: rouletteValue,
          mashCount,
          damage: dmg,
        }]);

        if (newHp <= 0) {
          setMessage('頭目已擊敗！前往捕獲階段...');
          setPhase('battle-end');
        } else if (turn >= 3) {
          setMessage('3回合完成！前往捕獲階段...');
          setPhase('battle-end');
        } else {
          setPhase('turn-end');
          setMessage('回合結束！');
        }
      }, projDur + 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mashTimeLeft]);

  // Navigate to catch after battle end
  useEffect(() => {
    if (phase === 'battle-end') {
      const timer = setTimeout(() => {
        navigate('/play/catch', {
          state: {
            area,
            playerTags,
            enemies: [boss, ...minions],
            catchGauge,
            bossDefeated: bossHp <= 0,
            turns,
          },
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const selectAttacker = (lane: number) => {
    if (phase !== 'select-attacker') return;
    setSelectedLane(lane);
    setRouletteValue(null);
    setRouletteDisplay(1);
    setMashCount(0);
    setPhase('roulette');
    setMessage(`${playerTags[lane].name} 攻擊！點擊「停止」來停下轉盤！`);
  };

  const stopRoulette = () => {
    if (phase !== 'roulette') return;
    const val = rollAttackRoulette();
    setRouletteValue(val);
    setRouletteDisplay(val);
    if (rouletteTimer.current) clearInterval(rouletteTimer.current);
    setMessage(`轉盤: ${val}！現在開始連打！`);
    setMashTimeLeft(2500);
    setPhase('mash');
  };

  const handleMash = useCallback(() => {
    if (phase !== 'mash' || mashTimeLeft <= 0) return;
    setMashCount(prev => prev + 1);
  }, [phase, mashTimeLeft]);

  const handleProjectileDone = useCallback(() => {
    setShowProjectile(false);
    setShowAnim(true);
    setShowHit(true);
  }, []);

  const nextTurn = () => {
    setTurn(prev => prev + 1);
    setSelectedLane(null);
    setRouletteValue(null);
    setMashCount(0);
    setShowHit(false);
    setPhase('select-attacker');
    setMessage('選擇你的攻擊者！');
  };

  // Keyboard mash support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phase === 'mash') {
        e.preventDefault();
        handleMash();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleMash]);

  const hpPct = (bossHp / bossMaxHp) * 100;
  const hpColor = hpPct > 50 ? '#22C55E' : hpPct > 25 ? '#FBBF24' : '#EF4444';

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Top: Turn & Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="font-display text-sm">
          <span className="text-text-muted">區域:</span> {area.emoji} {area.name}
        </div>
        <div className="font-display text-sm">
          <span className="text-text-muted">回合</span>{' '}
          <span className="text-accent text-xl">{turn}</span>
          <span className="text-text-muted">/3</span>
        </div>
      </div>

      {/* Enemy Section */}
      <div className="bg-bg-card rounded-xl p-4 mb-4 border border-white/5 relative">
        {/* Battle Animation Overlay */}
        {showAnim && selectedLane !== null && (
          <BattleAnimation
            key={animKey}
            type={playerTags[selectedLane].move.type}
            onDone={() => setShowAnim(false)}
          />
        )}
        <div className="flex justify-center gap-4 items-end">
          {/* Left Minion */}
          <div className="text-center opacity-60">
            <div className="text-3xl mb-1">{TYPE_EMOJI[minions[0]?.types[0]] || '⚪'}</div>
            <div className="text-xs text-text-muted">{minions[0]?.name}</div>
          </div>
          {/* Boss */}
          <div ref={bossRef} className={`text-center ${showHit ? 'anim-hit' : ''}`}>
            <div className="text-5xl mb-2" style={{ filter: `drop-shadow(0 0 12px ${TYPE_COLORS[boss.types[0]]})` }}>
              {TYPE_EMOJI[boss.types[0]] || '⚪'}
            </div>
            <div className="font-display text-lg">{boss.name}</div>
            <div className="text-xs text-gold mb-2">{'★'.repeat(boss.grade)} 頭目</div>
            {/* HP Bar */}
            <div className="w-48 mx-auto">
              <div className="flex justify-between text-xs mb-1">
                <span>HP</span>
                <span>{bossHp}/{bossMaxHp}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${hpPct}%`, background: hpColor }}
                />
              </div>
            </div>
          </div>
          {/* Right Minion */}
          <div className="text-center opacity-60">
            <div className="text-3xl mb-1">{TYPE_EMOJI[minions[1]?.types[0]] || '⚪'}</div>
            <div className="text-xs text-text-muted">{minions[1]?.name}</div>
          </div>
        </div>
      </div>

      {/* Catch Gauge */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-muted">捕獲計量表</span>
          <span className="text-neon-cyan">{Math.round(catchGauge)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 bg-neon-cyan" style={{ width: `${catchGauge}%` }} />
        </div>
      </div>

      {/* Message */}
      <div className="text-center font-display text-sm py-2 px-4 rounded bg-primary/10 border border-primary/20 mb-4">
        {message}
      </div>

      {/* Middle: Roulette & Mash */}
      <div className="flex justify-center gap-6 mb-6">
        {/* Roulette */}
        <div className="text-center">
          <div className="text-xs text-text-muted mb-1 font-display">攻擊轉盤</div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display border-2 border-primary ${phase === 'roulette' && rouletteValue === null ? 'roulette-spin border-accent' : ''}`}
            style={{ background: rouletteValue ? `linear-gradient(135deg, ${rouletteValue > 7 ? '#22C55E' : rouletteValue > 4 ? '#FBBF24' : '#EF4444'}44, transparent)` : '' }}>
            {rouletteDisplay}
          </div>
          {phase === 'roulette' && rouletteValue === null && (
            <button
              onClick={stopRoulette}
              className="mt-2 px-4 py-1 bg-accent text-white rounded font-display text-sm hover:bg-accent-light transition-all"
            >
              停止！
            </button>
          )}
        </div>

        {/* Mash */}
        <div className="text-center">
          <div className="text-xs text-text-muted mb-1 font-display">連打！</div>
          <button
            onClick={handleMash}
            disabled={phase !== 'mash' || mashTimeLeft <= 0}
            className={`w-20 h-20 rounded-full font-display text-xl border-2 transition-all
              ${phase === 'mash' && mashTimeLeft > 0
                ? 'bg-accent/20 border-accent text-accent mash-pulse cursor-pointer active:scale-90'
                : 'bg-white/5 border-white/10 text-text-muted cursor-not-allowed'}`}
          >
            {mashCount}
          </button>
          {phase === 'mash' && (
            <div className="mt-1 text-xs">
              <span className="text-accent">{(mashTimeLeft / 1000).toFixed(1)}s</span>
            </div>
          )}
          <div className="text-[10px] text-text-muted mt-1">點擊或按空白鍵</div>
        </div>

        {/* Damage */}
        <div className="text-center">
          <div className="text-xs text-text-muted mb-1 font-display">傷害</div>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display border-2 border-white/10 bg-white/5">
            {phase === 'damage-anim' || phase === 'turn-end' || phase === 'battle-end' ? (
              <span className="text-accent catch-success">{lastDamage}</span>
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Player Tags (Lanes) */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5">
        <div className="text-xs text-text-muted mb-2 font-display">你的隊伍</div>
        <div className="flex justify-center gap-4">
          {playerTags.map((tag, i) => (
            <div key={tag.id} className="text-center" ref={el => { laneRefs.current[i] = el; }}>
              <TagCard
                tag={tag}
                size="sm"
                selected={selectedLane === i}
                onClick={() => selectAttacker(i)}
                className={`${phase === 'select-attacker' ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'} ${phase === 'damage-anim' && selectedLane === i ? 'anim-lunge' : ''}`}
              />
              {phase === 'select-attacker' && (
                <button
                  onClick={() => selectAttacker(i)}
                  className="mt-2 px-3 py-1 text-xs bg-primary/20 text-primary-light rounded hover:bg-primary/40 font-display transition-all"
                >
                  攻擊 →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Projectile overlay (position:fixed — lives outside layout flow) */}
      {showProjectile && selectedLane !== null && projectileFrom && projectileTo && (
        <BattleProjectile
          key={`proj-${animKey}`}
          type={playerTags[selectedLane].move.type}
          from={projectileFrom}
          to={projectileTo}
          onDone={handleProjectileDone}
        />
      )}

      {/* Next Turn Button */}
      {phase === 'turn-end' && (
        <div className="text-center mt-4">
          <button
            onClick={nextTurn}
            className="px-6 py-2 bg-primary hover:bg-primary-light text-white font-display rounded-lg transition-all"
          >
            下一回合 →
          </button>
        </div>
      )}
    </div>
  );
}
