import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Area, Tag } from '../types';
import { getTagById, TYPE_COLORS, TYPE_EMOJI, TYPE_NAMES_ZH } from '../data/monsters';
import { calcDamage, calcEnemyDamage, rollAttackRoulette } from '../lib/battle';
import { getTypeMultiplier, getEffectivenessLabel, getEffectivenessColor } from '../lib/typeChart';
import TagCard from '../components/TagCard';
import BattleAnimation from '../components/BattleAnimation';
import BattleProjectile, { getProjectileDuration } from '../components/BattleProjectile';
import TypeChartTable from '../components/TypeChartTable';
import { playBGM, stopBGM } from '../lib/bgm';

/* ── Types ── */

type Phase =
  | 'enemy-send'
  | 'select-attacker'
  | 'speed-compare'
  | 'roulette'
  | 'mash'
  | 'player-attack-anim'
  | 'enemy-attack-anim'
  | 'round-result'
  | 'battle-end';

interface MonState {
  tag: Tag;
  hp: number;
  maxHp: number;
  fainted: boolean;
}

/* ── Entry ── */

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

/* ── Main Arena ── */

function BattleArena({ area, playerTags }: { area: Area; playerTags: Tag[] }) {
  const navigate = useNavigate();

  /* Start battle BGM */
  useEffect(() => {
    playBGM('battle');
    return () => stopBGM();
  }, []);

  /* Build enemy team (boss + 2 minions) */
  const enemyTagsRaw = [
    getTagById(area.bossPool[0])!,
    ...area.minionPool.map(id => getTagById(id)!),
  ].slice(0, 3);

  /* Mon state arrays */
  const [enemies, setEnemies] = useState<MonState[]>(() =>
    enemyTagsRaw.map(t => ({ tag: t, hp: t.stats.hp, maxHp: t.stats.hp, fainted: false })),
  );
  const [allies, setAllies] = useState<MonState[]>(() =>
    playerTags.slice(0, 3).map(t => ({ tag: t, hp: t.stats.hp, maxHp: t.stats.hp, fainted: false })),
  );

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>('enemy-send');
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');

  /* Current combatant indices */
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [allyIdx, setAllyIdx] = useState<number | null>(null);

  /* Roulette / mash */
  const [rouletteValue, setRouletteValue] = useState<number | null>(null);
  const [rouletteDisplay, setRouletteDisplay] = useState(1);
  const [mashCount, setMashCount] = useState(0);
  const [mashTimeLeft, setMashTimeLeft] = useState(0);
  const mashTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rouletteTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Damage tracking */
  const [lastPlayerDmg, setLastPlayerDmg] = useState(0);
  const [lastEnemyDmg, setLastEnemyDmg] = useState(0);

  /* Animation */
  const [showAnim, setShowAnim] = useState(false);
  const [animType, setAnimType] = useState('fire');
  const [animKey, setAnimKey] = useState(0);
  const [showProjectile, setShowProjectile] = useState(false);
  const [projectileFrom, setProjectileFrom] = useState<{x:number;y:number}|null>(null);
  const [projectileTo, setProjectileTo] = useState<{x:number;y:number}|null>(null);
  const [projType, setProjType] = useState('fire');
  const [showHitEnemy, setShowHitEnemy] = useState(false);
  const [showHitAlly, setShowHitAlly] = useState(false);

  /* Speed */
  const [playerFirst, setPlayerFirst] = useState(true);

  /* Effectiveness */
  const [effectLabel, setEffectLabel] = useState<string | null>(null);
  const [effectColor, setEffectColor] = useState('#E2E8F0');

  /* Type chart toggle */
  const [showTypeChart, setShowTypeChart] = useState(false);

  /* DOM refs */
  const enemyRef = useRef<HTMLDivElement>(null);
  const allyRef = useRef<HTMLDivElement>(null);

  /* ── Derived ── */
  const activeEnemy = enemies[enemyIdx];
  const activeAlly = allyIdx !== null ? allies[allyIdx] : null;
  const aliveEnemies = enemies.filter(e => !e.fainted);
  const aliveAllies = allies.filter(a => !a.fainted);

  const nextAliveEnemyIdx = (): number => {
    for (let i = 0; i < enemies.length; i++) if (!enemies[i].fainted) return i;
    return 0;
  };

  /* ================================================================
   *  PHASE : enemy-send
   * ================================================================ */
  useEffect(() => {
    if (phase !== 'enemy-send') return;
    const idx = nextAliveEnemyIdx();
    setEnemyIdx(idx);
    const e = enemies[idx];
    setMessage(`對手派出了 ${e.tag.name}！`);
    setSubMessage('選擇你的應戰怪獸！');
    const t = setTimeout(() => setPhase('select-attacker'), 1200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ================================================================
   *  PHASE : speed-compare
   * ================================================================ */
  useEffect(() => {
    if (phase !== 'speed-compare' || allyIdx === null) return;
    const ally = allies[allyIdx];
    const enemy = enemies[enemyIdx];
    const aSpd = ally.tag.stats.spd;
    const eSpd = enemy.tag.stats.spd;
    const first = aSpd >= eSpd;
    setPlayerFirst(first);
    setMessage(`⚡ 速度比較 — ${ally.tag.name} SPD ${aSpd}  vs  ${enemy.tag.name} SPD ${eSpd}`);
    setSubMessage(first ? `${ally.tag.name} 先攻！` : `${enemy.tag.name} 先攻！`);

    const t = setTimeout(() => {
      if (first) {
        setPhase('roulette');
        setMessage(`${ally.tag.name} 先攻！點擊「停止」來停下轉盤！`);
        setSubMessage('');
      } else {
        doEnemyAttack();
      }
    }, 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, allyIdx]);

  /* ================================================================
   *  Roulette spin
   * ================================================================ */
  useEffect(() => {
    if (phase === 'roulette' && rouletteValue === null) {
      rouletteTimer.current = setInterval(() => {
        setRouletteDisplay(Math.floor(Math.random() * 10) + 1);
      }, 80);
      return () => { if (rouletteTimer.current) clearInterval(rouletteTimer.current); };
    }
  }, [phase, rouletteValue]);

  /* ================================================================
   *  Mash countdown
   * ================================================================ */
  useEffect(() => {
    if (phase === 'mash' && mashTimeLeft > 0) {
      mashTimer.current = setInterval(() => {
        setMashTimeLeft(prev => {
          if (prev <= 100) { if (mashTimer.current) clearInterval(mashTimer.current); return 0; }
          return prev - 100;
        });
      }, 100);
      return () => { if (mashTimer.current) clearInterval(mashTimer.current); };
    }
    if (phase === 'mash' && mashTimeLeft === 0 && mashCount >= 0 && allyIdx !== null && rouletteValue !== null) {
      doPlayerAttack();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mashTimeLeft]);

  /* Keyboard mash */
  const handleMash = useCallback(() => {
    if (phase !== 'mash' || mashTimeLeft <= 0) return;
    setMashCount(prev => prev + 1);
  }, [phase, mashTimeLeft]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phase === 'mash') { e.preventDefault(); handleMash(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleMash]);

  /* ================================================================
   *  Battle-end → navigate
   * ================================================================ */
  useEffect(() => {
    if (phase !== 'battle-end') return;
    const won = enemies.every(e => e.fainted);
    playBGM(won ? 'victory' : 'defeat');
    const t = setTimeout(() => {
      navigate('/play/catch', {
        state: {
          area,
          playerTags,
          enemies: enemyTagsRaw,
          catchGauge: 50,
          bossDefeated: enemies.every(e => e.fainted),
          turns: [],
        },
      });
    }, 2500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ================================================================
   *  ACTIONS
   * ================================================================ */

  const selectAttacker = (idx: number) => {
    if (phase !== 'select-attacker') return;
    if (allies[idx].fainted) return;
    setAllyIdx(idx);
    setRouletteValue(null);
    setRouletteDisplay(1);
    setMashCount(0);
    setLastPlayerDmg(0);
    setLastEnemyDmg(0);
    setEffectLabel(null);
    setPhase('speed-compare');
  };

  const stopRoulette = () => {
    if (phase !== 'roulette') return;
    const val = rollAttackRoulette();
    setRouletteValue(val);
    setRouletteDisplay(val);
    if (rouletteTimer.current) clearInterval(rouletteTimer.current);
    setMessage(`轉盤: ${val}！現在開始連打！`);
    setSubMessage('');
    setMashTimeLeft(2500);
    setPhase('mash');
  };

  /* ── Player attack ── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doPlayerAttack = () => {
    if (allyIdx === null || rouletteValue === null) return;
    const ally = allies[allyIdx];
    const enemy = enemies[enemyIdx];
    const dmg = calcDamage(ally.tag, rouletteValue, mashCount, enemy.tag);
    setLastPlayerDmg(dmg);

    const mult = getTypeMultiplier(ally.tag.types, enemy.tag.types);
    setEffectLabel(getEffectivenessLabel(mult));
    setEffectColor(getEffectivenessColor(mult));

    // Projectile ally → enemy
    const aEl = allyRef.current;
    const eEl = enemyRef.current;
    if (aEl && eEl) {
      const aR = aEl.getBoundingClientRect();
      const eR = eEl.getBoundingClientRect();
      setProjectileFrom({ x: aR.left + aR.width / 2, y: aR.top });
      setProjectileTo({ x: eR.left + eR.width / 2, y: eR.top + eR.height / 2 });
    }
    setProjType(ally.tag.move.type);
    setShowProjectile(true);
    setAnimKey(prev => prev + 1);
    setPhase('player-attack-anim');
    setMessage(`${ally.tag.name} 使用了 ${ally.tag.move.name}！`);
    setSubMessage('');

    const projDur = getProjectileDuration(ally.tag.move.type);
    setTimeout(() => {
      /* Apply dmg */
      const newHp = Math.max(0, enemy.hp - dmg);
      setEnemies(prev => {
        const n = [...prev];
        n[enemyIdx] = { ...n[enemyIdx], hp: newHp, fainted: newHp <= 0 };
        return n;
      });
      setTimeout(() => {
        if (newHp <= 0) {
          handleMonFainted('enemy', newHp);
        } else if (!playerFirst) {
          afterBothAttacked();
        } else {
          setTimeout(() => doEnemyAttack(), 800);
        }
      }, 600);
    }, projDur + 400);
  };

  /* ── Enemy attack ── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doEnemyAttack = () => {
    if (allyIdx === null) return;
    const ally = allies[allyIdx];
    const enemy = enemies[enemyIdx];
    const dmg = calcEnemyDamage(enemy.tag, ally.tag);
    setLastEnemyDmg(dmg);

    const mult = getTypeMultiplier(enemy.tag.types, ally.tag.types);
    setEffectLabel(getEffectivenessLabel(mult));
    setEffectColor(getEffectivenessColor(mult));

    // Projectile enemy → ally
    const eEl = enemyRef.current;
    const aEl = allyRef.current;
    if (eEl && aEl) {
      const eR = eEl.getBoundingClientRect();
      const aR = aEl.getBoundingClientRect();
      setProjectileFrom({ x: eR.left + eR.width / 2, y: eR.top + eR.height });
      setProjectileTo({ x: aR.left + aR.width / 2, y: aR.top });
    }
    setProjType(enemy.tag.move.type);
    setShowProjectile(true);
    setAnimKey(prev => prev + 1);
    setPhase('enemy-attack-anim');
    setMessage(`${enemy.tag.name} 使用了 ${enemy.tag.move.name}！`);
    setSubMessage('');

    const projDur = getProjectileDuration(enemy.tag.move.type);
    setTimeout(() => {
      const newHp = Math.max(0, ally.hp - dmg);
      setAllies(prev => {
        const n = [...prev];
        n[allyIdx] = { ...n[allyIdx], hp: newHp, fainted: newHp <= 0 };
        return n;
      });

      setTimeout(() => {
        if (newHp <= 0) {
          handleMonFainted('ally', newHp);
        } else if (playerFirst) {
          afterBothAttacked();
        } else {
          setPhase('roulette');
          setMessage(`換你攻擊！點擊「停止」來停下轉盤！`);
          setSubMessage('');
        }
      }, 600);
    }, projDur + 400);
  };

  /* ── Mon fainted ── */
  const handleMonFainted = (who: 'ally' | 'enemy', _newHp?: number) => {
    if (who === 'enemy') {
      setMessage(`${enemies[enemyIdx].tag.name} 被擊敗了！`);
    } else if (allyIdx !== null) {
      setMessage(`${allies[allyIdx].tag.name} 倒下了！`);
    }
    setSubMessage('');

    setTimeout(() => {
      const updatedEnemies = enemies.map((e, i) =>
        i === enemyIdx && who === 'enemy' ? { ...e, hp: 0, fainted: true } : e,
      );
      const updatedAllies = allyIdx !== null
        ? allies.map((a, i) =>
            i === allyIdx && who === 'ally' ? { ...a, hp: 0, fainted: true } : a,
          )
        : allies;

      const eAlive = updatedEnemies.filter(e => !e.fainted).length;
      const aAlive = updatedAllies.filter(a => !a.fainted).length;

      if (eAlive === 0) {
        setMessage('🎉 你贏了！全部敵方怪獸被擊敗！');
        setSubMessage('前往捕獲階段...');
        setPhase('battle-end');
      } else if (aAlive === 0) {
        setMessage('💀 你的隊伍全滅了...');
        setSubMessage('');
        setPhase('battle-end');
      } else {
        afterBothAttacked();
      }
    }, 1200);
  };

  /* ── Round result ── */
  const afterBothAttacked = () => {
    setPhase('round-result');
    setSubMessage(`第 ${round} 回合結束`);
  };

  const nextRound = () => {
    /* Battle continues until one side is fully wiped — no forced round cap */
    setRound(prev => prev + 1);
    setAllyIdx(null);
    setRouletteValue(null);
    setMashCount(0);
    setLastPlayerDmg(0);
    setLastEnemyDmg(0);
    setShowHitEnemy(false);
    setShowHitAlly(false);
    setEffectLabel(null);
    setPhase('enemy-send');
  };

  /* ── Projectile done callbacks ── */
  const handlePlayerProjDone = useCallback(() => {
    setShowProjectile(false);
    setAnimType(projType);
    setShowAnim(true);
    setShowHitEnemy(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projType]);

  const handleEnemyProjDone = useCallback(() => {
    setShowProjectile(false);
    setAnimType(projType);
    setShowAnim(true);
    setShowHitAlly(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projType]);

  /* ── Render helpers ── */
  const hpBar = (mon: MonState, width = 'w-36') => {
    const pct = (mon.hp / mon.maxHp) * 100;
    const color = pct > 50 ? '#22C55E' : pct > 25 ? '#FBBF24' : '#EF4444';
    return (
      <div className={`${width} mx-auto`}>
        <div className="flex justify-between text-xs mb-0.5">
          <span>HP</span>
          <span>{mon.hp}/{mon.maxHp}</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    );
  };

  const monEmoji = (tag: Tag) => TYPE_EMOJI[tag.types[0]] || '⚪';
  const monGlow = (tag: Tag) => `drop-shadow(0 0 10px ${TYPE_COLORS[tag.types[0]]})`;

  /* ================================================================
   *  RENDER
   * ================================================================ */
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 select-none">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-3">
        <div className="font-display text-sm">
          <span className="text-text-muted">區域:</span> {area.emoji} {area.name}
        </div>
        <div className="font-display text-sm">
          <span className="text-text-muted">回合</span>{' '}
          <span className="text-accent text-xl">{round}</span>
        </div>
        <button
          onClick={() => setShowTypeChart(c => !c)}
          className="text-xs px-2 py-1 rounded bg-primary/20 text-primary-light hover:bg-primary/40 font-display transition-all"
        >
          {showTypeChart ? '隱藏相剋表' : '📊 屬性相剋表'}
        </button>
      </div>

      {/* Type chart image */}
      {showTypeChart && (
        <div className="mb-4 bg-bg-card rounded-xl p-3 border border-white/5 overflow-auto max-h-80">
          <TypeChartTable />
        </div>
      )}

      {/* ── Enemy Side ── */}
      <div className="bg-bg-card rounded-xl p-4 mb-3 border border-white/5 relative">
        <div className="text-xs text-text-muted mb-2 font-display">敵方隊伍 — 存活 {aliveEnemies.length}/{enemies.length}</div>

        {/* Enemy bench */}
        <div className="flex justify-center gap-3 mb-3">
          {enemies.map((e, i) => (
            <div key={e.tag.id} className={`text-center transition-all ${e.fainted ? 'opacity-20 grayscale' : ''} ${i === enemyIdx ? 'scale-110' : 'scale-90 opacity-60'}`}>
              <div className="text-2xl">{monEmoji(e.tag)}</div>
              <div className="text-[10px] text-text-muted">{e.tag.name}</div>
              {e.fainted && <div className="text-[10px] text-accent">✕</div>}
            </div>
          ))}
        </div>

        {/* Active enemy */}
        {activeEnemy && !activeEnemy.fainted && (
          <div className="relative">
            {showAnim && phase === 'player-attack-anim' && (
              <BattleAnimation key={`ea-${animKey}`} type={animType} onDone={() => { setShowAnim(false); setShowHitEnemy(false); }} />
            )}
            <div ref={enemyRef} className={`text-center ${showHitEnemy ? 'anim-hit' : ''}`}>
              <div className="text-5xl mb-2" style={{ filter: monGlow(activeEnemy.tag) }}>{monEmoji(activeEnemy.tag)}</div>
              <div className="font-display text-lg">{activeEnemy.tag.name}</div>
              <div className="flex justify-center gap-1 my-1">
                {activeEnemy.tag.types.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${TYPE_COLORS[t]}33`, color: TYPE_COLORS[t] }}>{TYPE_NAMES_ZH[t]}</span>
                ))}
              </div>
              <div className="text-xs text-text-muted mb-1">SPD {activeEnemy.tag.stats.spd}</div>
              {hpBar(activeEnemy, 'w-48')}
            </div>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="text-center mb-3">
        <div className="font-display text-sm py-2 px-4 rounded bg-primary/10 border border-primary/20">{message}</div>
        {subMessage && <div className="text-xs text-text-muted mt-1">{subMessage}</div>}
        {effectLabel && <div className="text-sm font-display mt-1" style={{ color: effectColor }}>{effectLabel}</div>}
      </div>

      {/* ── Roulette & Mash ── */}
      {(phase === 'roulette' || phase === 'mash' || phase === 'player-attack-anim') && (
        <div className="flex justify-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-xs text-text-muted mb-1 font-display">攻擊轉盤</div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display border-2 border-primary ${phase === 'roulette' && rouletteValue === null ? 'roulette-spin border-accent' : ''}`}
              style={{ background: rouletteValue ? `linear-gradient(135deg, ${rouletteValue > 7 ? '#22C55E' : rouletteValue > 4 ? '#FBBF24' : '#EF4444'}44, transparent)` : '' }}>
              {rouletteDisplay}
            </div>
            {phase === 'roulette' && rouletteValue === null && (
              <button onClick={stopRoulette} className="mt-2 px-4 py-1 bg-accent text-white rounded font-display text-sm hover:bg-accent-light transition-all">停止！</button>
            )}
          </div>
          <div className="text-center">
            <div className="text-xs text-text-muted mb-1 font-display">連打！</div>
            <button onClick={handleMash} disabled={phase !== 'mash' || mashTimeLeft <= 0}
              className={`w-16 h-16 rounded-full font-display text-xl border-2 transition-all ${phase === 'mash' && mashTimeLeft > 0 ? 'bg-accent/20 border-accent text-accent mash-pulse cursor-pointer active:scale-90' : 'bg-white/5 border-white/10 text-text-muted cursor-not-allowed'}`}>
              {mashCount}
            </button>
            {phase === 'mash' && <div className="mt-1 text-xs text-accent">{(mashTimeLeft / 1000).toFixed(1)}s</div>}
            <div className="text-[10px] text-text-muted mt-1">點擊或按空白鍵</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-text-muted mb-1 font-display">傷害</div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-display border-2 border-white/10 bg-white/5">
              {lastPlayerDmg > 0 ? <span className="text-accent catch-success">{lastPlayerDmg}</span> : <span className="text-text-muted">—</span>}
            </div>
          </div>
        </div>
      )}

      {/* Enemy damage display */}
      {phase === 'enemy-attack-anim' && lastEnemyDmg > 0 && (
        <div className="text-center mb-4"><span className="text-accent font-display text-lg catch-success">-{lastEnemyDmg} HP</span></div>
      )}



      {/* ── Ally Side ── */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5 relative">
        <div className="text-xs text-text-muted mb-2 font-display">你的隊伍 — 存活 {aliveAllies.length}/{allies.length}</div>

        {/* Active ally */}
        {activeAlly && !activeAlly.fainted && (
          <div className="relative mb-3">
            {showAnim && phase === 'enemy-attack-anim' && (
              <BattleAnimation key={`aa-${animKey}`} type={animType} onDone={() => { setShowAnim(false); setShowHitAlly(false); }} />
            )}
            <div ref={allyRef} className={`text-center ${showHitAlly ? 'anim-hit' : ''}`}>
              <div className="text-4xl mb-1" style={{ filter: monGlow(activeAlly.tag) }}>{monEmoji(activeAlly.tag)}</div>
              <div className="font-display text-sm">{activeAlly.tag.name}</div>
              <div className="text-xs text-text-muted mb-1">SPD {activeAlly.tag.stats.spd}</div>
              {hpBar(activeAlly, 'w-40')}
            </div>
          </div>
        )}

        {/* Ally bench / selection */}
        <div className="flex justify-center gap-4">
          {allies.map((a, i) => (
            <div key={a.tag.id} className="text-center">
              <TagCard
                tag={a.tag}
                size="sm"
                selected={allyIdx === i}
                onClick={() => selectAttacker(i)}
                className={`${a.fainted ? 'opacity-30 grayscale pointer-events-none' : ''} ${phase === 'select-attacker' && !a.fainted ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'} ${phase === 'player-attack-anim' && allyIdx === i ? 'anim-lunge' : ''}`}
              />
              <div className="mt-1">{hpBar(a, 'w-28')}</div>
              {a.fainted && <div className="text-xs text-accent mt-0.5">退場</div>}
              {phase === 'select-attacker' && !a.fainted && (
                <button onClick={() => selectAttacker(i)} className="mt-1 px-3 py-1 text-xs bg-primary/20 text-primary-light rounded hover:bg-primary/40 font-display transition-all">出戰！</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Projectile Overlay */}
      {showProjectile && projectileFrom && projectileTo && (
        <BattleProjectile
          key={`proj-${animKey}`}
          type={projType}
          from={projectileFrom}
          to={projectileTo}
          onDone={phase === 'player-attack-anim' ? handlePlayerProjDone : handleEnemyProjDone}
        />
      )}

      {/* Next Round */}
      {phase === 'round-result' && (
        <div className="text-center mt-4">
          <button onClick={nextRound} className="px-6 py-2 bg-primary hover:bg-primary-light text-white font-display rounded-lg transition-all">
            下一回合 →
          </button>
        </div>
      )}
    </div>
  );
}
