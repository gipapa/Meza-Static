import { useNavigate } from 'react-router-dom';
import { useCoins } from '../lib/useCoins';

const MODES = [
  {
    id: 'battle',
    icon: '⚔️',
    title: '對戰 & 捕獲',
    description: '選擇區域，挑戰頭目進行3回合對戰，搭配轉盤與連打機制。對戰後捕獲怪獸！',
    time: '~5 分鐘',
    reward: '★2~★6 卡牌',
    color: '#F43F5E',
    to: '/play/area',
  },
  {
    id: 'catch-now',
    icon: '🎯',
    title: '快速捕獲',
    description: '跳過對戰 — 直接遇見隨機怪獸並嘗試捕獲！快速又簡單。',
    time: '~1 分鐘',
    reward: '★2~★4 卡牌',
    color: '#7C3AED',
    to: '/play/catch-now',
  },
];

export default function PlayModePage() {
  const navigate = useNavigate();
  const { startGame } = useCoins();

  const selectMode = (mode: typeof MODES[number]) => {
    if (mode.id === 'battle') navigate(mode.to);
    else startGame(gameId => navigate(mode.to, { state: { gameId } }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-center mb-2 neon-text">選擇模式</h1>
      <p className="text-center text-text-muted mb-10">每次遊玩 1 枚硬幣 · 草叢額外捕獲另投 1 枚</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {MODES.map(mode => (
          <button
            type="button"
            key={mode.id}
            onClick={() => selectMode(mode)}
            className="block p-6 rounded-xl bg-bg-card card-glow border border-white/5 hover:border-primary/40 transition-all"
          >
            <div className="text-5xl mb-4 text-center">{mode.icon}</div>
            <h2 className="font-display text-xl mb-2 text-center" style={{ color: mode.color }}>
              {mode.title}
            </h2>
            <p className="text-text-muted text-sm mb-4 text-center">{mode.description}</p>
            <div className="flex justify-between text-xs text-text-muted border-t border-white/5 pt-3">
              <span>⏱ {mode.time}</span>
              <span>🎁 {mode.reward}</span>
            </div>
            <span
              className="block mt-4 w-full py-2 rounded-lg font-display text-sm transition-all hover:brightness-110"
              style={{ background: mode.color }}
            >
              {mode.id === 'battle' ? '選擇區域 · 開始時投 1 枚' : '投幣開始 · 1 枚'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
