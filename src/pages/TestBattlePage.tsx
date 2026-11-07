import { useEffect, useRef, useState } from 'react';
import MoveAnimationOverlay from '../phaser/MoveAnimationOverlay';
import { getTagById } from '../data/monsters';
import { useSettings } from '../lib/useSettings';
import type { AnimationQuality } from '../lib/settings';
import PhaserBattleOverlay from '../phaser/PhaserBattleOverlay';
import PhaserBallWheel from '../phaser/PhaserBallWheel';
import PhaserCatchOverlay from '../phaser/PhaserCatchOverlay';
import type { Tag, BallType } from '../types';
import { randInt } from '../lib/rng';

/**
 * Test page for Phaser animations with fixed data.
 * Access via /#/test/battle and /#/test/wheel
 */

const FIXED_ALLY: Tag = {
  id: 'test-ally-001',
  name: 'COOOOOOOm',
  grade: 6,
  types: ['dragon', 'psychic'],
  pe: 280,
  stats: { hp: 230, atk: 120, def: 90, spd: 110 },
  move: { name: 'Cosmic Roar', type: 'dragon', power: 90 },
  flags: {},
  plusLevel: 1,
};

const FIXED_ENEMY: Tag = {
  id: 'test-enemy-001',
  name: '烈焰馬',
  grade: 4,
  types: ['fire'],
  pe: 200,
  stats: { hp: 65, atk: 100, def: 70, spd: 105 },
  move: { name: '火焰衝擊', type: 'fire', power: 75 },
  flags: {},
};

export function TestBattlePage() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [key, setKey] = useState(0);
  // Default from ?side=enemy so both directions can be opened directly.
  const [playerAttacking, setPlayerAttacking] = useState(
    () => !window.location.hash.includes('side=enemy'),
  );

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleComplete = () => {
    addLog(`onComplete fired — ${playerAttacking ? 'ally' : 'enemy'} attack finished!`);
    setShowOverlay(false);
  };

  const restart = (isPlayer: boolean) => {
    setLog([]);
    setPlayerAttacking(isPlayer);
    setKey((k) => k + 1);
    setShowOverlay(true);
  };

  const attacker = playerAttacking ? FIXED_ALLY : FIXED_ENEMY;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-display text-primary-light mb-4">
        Battle Animation Test
      </h1>
      <p className="text-text-muted text-sm mb-4">
        Fixed data: {FIXED_ALLY.name} (dragon, 我方/下方) vs {FIXED_ENEMY.name} (fire, 敵方/上方), damage=150
      </p>
      <p className="text-text-muted text-xs mb-4">
        預期：上方永遠是敵方 🔥 + {FIXED_ENEMY.name}，下方永遠是我方 🐉 + {FIXED_ALLY.name}；
        我方攻擊由下往上，敵方攻擊由上往下。
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => restart(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-display rounded-lg"
        >
          我方攻擊（↑）
        </button>
        <button
          onClick={() => restart(false)}
          className="px-4 py-2 bg-accent hover:bg-accent-light text-white font-display rounded-lg"
        >
          敵方攻擊（↓）
        </button>
      </div>

      {showOverlay && (
        <PhaserBattleOverlay
          key={key}
          enemy={FIXED_ENEMY}
          ally={FIXED_ALLY}
          isPlayerAttacking={playerAttacking}
          moveType={attacker.move.type}
          moveName={attacker.move.name}
          damage={150}
          onComplete={handleComplete}
        />
      )}

      <div className="mt-4 bg-surface rounded-lg p-3 max-h-48 overflow-y-auto text-xs font-mono">
        <div className="text-text-muted mb-1">Log:</div>
        {log.length === 0 && (
          <div className="text-text-muted">Waiting for animation...</div>
        )}
        {log.map((l, i) => (
          <div key={i} className="text-green-400">{l}</div>
        ))}
      </div>
    </div>
  );
}

export function TestWheelPage() {
  const [result, setResult] = useState<BallType | null>(null);
  const [key, setKey] = useState(0);

  const handleResult = (ball: BallType) => {
    setResult(ball);
  };

  const restart = () => {
    setResult(null);
    setKey((k) => k + 1);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-display text-primary-light mb-4">
        Wheel Animation Test
      </h1>

      <button
        onClick={restart}
        className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-display rounded-lg mb-4"
      >
        Restart Wheel
      </button>

      {result && (
        <div className="mb-4 text-lg text-green-400 font-display">
          Result: {result}
        </div>
      )}

      <PhaserBallWheel key={key} onResult={handleResult} />
    </div>
  );
}

export function TestCatchPage() {
  const [show, setShow] = useState(true);
  const [success, setSuccess] = useState(true);
  const [key, setKey] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleComplete = () => {
    addLog(`onComplete — ${success ? 'caught!' : 'escaped!'}`);
    setShow(false);
  };

  const restart = (s: boolean) => {
    setSuccess(s);
    setLog([]);
    setKey((k) => k + 1);
    setShow(true);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-display text-primary-light mb-4">
        Catch Animation Test
      </h1>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => restart(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-display rounded-lg"
        >
          Test Catch Success
        </button>
        <button
          onClick={() => restart(false)}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-display rounded-lg"
        >
          Test Catch Fail
        </button>
      </div>

      {show && (
        <PhaserCatchOverlay
          key={key}
          ballType="ultra"
          monsterEmoji="🔥"
          monsterName="烈焰馬"
          success={success}
          shakeCount={randInt(1, 3)}
          onComplete={handleComplete}
        />
      )}

      <div className="mt-4 bg-surface rounded-lg p-3 max-h-48 overflow-y-auto text-xs font-mono">
        <div className="text-text-muted mb-1">Log:</div>
        {log.length === 0 && <div className="text-text-muted">Waiting...</div>}
        {log.map((l, i) => (
          <div key={i} className="text-green-400">{l}</div>
        ))}
      </div>
    </div>
  );
}

/**
 * Advanced-animation test page: /#/test/cinematic
 * Query params (for manual QA and automated checks):
 *   quality=simple|advanced|setting  (default advanced)
 *   side=ally|enemy                  (who uses 花瓣舞, default ally)
 *   speed=1..20                      (playback speed, default 1)
 */
const PETAL_TAG: Tag = getTagById('045') ?? {
  id: '045', name: '霸王花', grade: 4, types: ['grass', 'poison'], pe: 490,
  stats: { hp: 75, atk: 80, def: 85, spd: 50 }, move: { name: '花瓣舞', type: 'grass', power: 120 }, flags: {},
};

function readQuery() {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const quality = q.get('quality');
  return {
    quality: (quality === 'simple' || quality === 'setting' ? quality : 'advanced') as AnimationQuality | 'setting',
    side: q.get('side') === 'enemy' ? 'enemy' : 'ally',
    speed: Math.min(20, Math.max(0.25, Number(q.get('speed')) || 1)),
  };
}

export function TestCinematicPage() {
  const [opts, setOpts] = useState(readQuery);
  const [key, setKey] = useState(0);
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState('—');
  const [log, setLog] = useState<string[]>([]);
  const settings = useSettings();
  const started = useRef(0);

  const addLog = (msg: string) => {
    const t = ((performance.now() - started.current) / 1000).toFixed(1);
    setLog(prev => [...prev, `[${t}s] ${msg}`]);
  };

  const restart = (patch: Partial<typeof opts>) => {
    setOpts(o => ({ ...o, ...patch }));
    setLog([]);
    setPhase('—');
    setKey(k => k + 1);
    setShow(true);
  };

  useEffect(() => { started.current = performance.now(); }, [key]);

  const isPlayer = opts.side === 'ally';
  const ally = isPlayer ? PETAL_TAG : FIXED_ALLY;
  const enemy = isPlayer ? FIXED_ENEMY : PETAL_TAG;
  const effective = opts.quality === 'setting' ? settings.animationQuality : opts.quality;

  const btn = (active: boolean) =>
    `min-h-11 px-3 py-2 rounded-lg text-sm font-display border ${active ? 'border-neon-cyan bg-primary/30' : 'border-white/10 bg-bg-card'}`;

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-display text-primary-light mb-2">Cinematic Test — 花瓣舞</h1>
      <p className="text-text-muted text-xs mb-4">
        {isPlayer ? `我方 ${PETAL_TAG.name}（下方）→ 敵方 ${FIXED_ENEMY.name}` : `敵方 ${PETAL_TAG.name}（上方）→ 我方 ${FIXED_ALLY.name}`}，
        damage=150。進階版約 60 秒，右上角可跳過。目前設定：{settings.animationQuality}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2">
          {(['advanced', 'simple', 'setting'] as const).map(q => (
            <button key={q} type="button" className={btn(opts.quality === q)} onClick={() => restart({ quality: q })}>
              {q === 'advanced' ? '進階' : q === 'simple' ? '簡易' : '跟隨設定'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn(isPlayer)} onClick={() => restart({ side: 'ally' })}>我方使用（↑）</button>
          <button type="button" className={btn(!isPlayer)} onClick={() => restart({ side: 'enemy' })}>敵方使用（↓）</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 4, 10].map(s => (
            <button key={s} type="button" className={btn(opts.speed === s)} onClick={() => restart({ speed: s })}>{s}×</button>
          ))}
        </div>
      </div>

      <div className="text-sm mb-2">
        實際播放：<span data-testid="variant" className="font-display text-neon-cyan">{effective}</span>
        ・階段：<span data-testid="phase" className="font-display text-gold">{phase}</span>
      </div>

      {show && (
        <MoveAnimationOverlay
          key={key}
          enemy={enemy}
          ally={ally}
          isPlayerAttacking={isPlayer}
          moveType={PETAL_TAG.move.type}
          moveName={PETAL_TAG.move.name}
          damage={150}
          quality={opts.quality === 'setting' ? undefined : opts.quality}
          speed={opts.speed}
          onPhase={(id, label) => { setPhase(id); addLog(`phase ${id}（${label}）`); }}
          onComplete={() => { addLog('onComplete'); setShow(false); }}
        />
      )}

      <div data-testid="log" className="mt-4 bg-surface rounded-lg p-3 max-h-64 overflow-y-auto text-xs font-mono">
        <div className="text-text-muted mb-1">Log:</div>
        {log.map((l, i) => (
          <div key={i} className="text-green-400">{l}</div>
        ))}
      </div>
    </div>
  );
}
