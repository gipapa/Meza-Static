import { useState } from 'react';
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

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleComplete = () => {
    addLog('onComplete fired — animation finished!');
    setShowOverlay(false);
  };

  const restart = () => {
    setLog([]);
    setKey((k) => k + 1);
    setShowOverlay(true);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-display text-primary-light mb-4">
        Battle Animation Test
      </h1>
      <p className="text-text-muted text-sm mb-4">
        Fixed data: {FIXED_ALLY.name} (dragon) vs {FIXED_ENEMY.name} (fire), damage=150
      </p>

      <button
        onClick={restart}
        className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-display rounded-lg mb-4"
      >
        Restart Animation
      </button>

      {showOverlay && (
        <PhaserBattleOverlay
          key={key}
          enemy={FIXED_ENEMY}
          ally={FIXED_ALLY}
          isPlayerAttacking={true}
          moveType="dragon"
          moveName="Cosmic Roar"
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
