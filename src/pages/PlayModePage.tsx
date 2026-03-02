import { Link } from 'react-router-dom';

const MODES = [
  {
    id: 'battle',
    icon: '⚔️',
    title: 'Battle & Catch',
    description: 'Choose an area, face a Boss in 3-round battles with roulette & mash mechanics. Catch monsters after battle!',
    time: '~5 min',
    reward: '★2~★6 Tags',
    color: '#F43F5E',
    to: '/play/area',
  },
  {
    id: 'catch-now',
    icon: '🎯',
    title: 'Catch Now',
    description: 'Skip battling — encounter a random monster and try to catch it directly! Quick and easy.',
    time: '~1 min',
    reward: '★2~★4 Tags',
    color: '#7C3AED',
    to: '/play/catch-now',
  },
];

export default function PlayModePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-center mb-2 neon-text">SELECT MODE</h1>
      <p className="text-center text-text-muted mb-10">Choose your adventure</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {MODES.map(mode => (
          <Link
            key={mode.id}
            to={mode.to}
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
            <button
              className="mt-4 w-full py-2 rounded-lg font-display text-sm transition-all hover:brightness-110"
              style={{ background: mode.color }}
            >
              START
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
