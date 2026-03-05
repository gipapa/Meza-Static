import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toggleMute, isMuted } from '../lib/bgm';

const NAV_ITEMS = [
  { to: '/play', label: '遊玩', icon: '🎮' },
  { to: '/collection', label: '收藏', icon: '📦' },
  { to: '/trainer', label: '訓練家', icon: '👤' },
  { to: '/howto', label: '遊戲說明', icon: '📖' },
];

export default function Header() {
  const location = useLocation();
  const [muted, setMuted] = useState(isMuted());

  const handleToggleMute = () => {
    const m = toggleMute();
    setMuted(m);
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-dark/90 backdrop-blur border-b border-primary/30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-wider text-primary-light hover:text-neon-cyan transition-colors">
          MEZA<span className="text-accent">★</span>STATIC
        </Link>
        <nav className="flex gap-1 sm:gap-3 items-center">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-2 sm:px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1
                ${location.pathname.startsWith(item.to)
                  ? 'bg-primary/20 text-primary-light neon-border'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-card'
                }`}
            >
              <span className="hidden sm:inline">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleToggleMute}
            className="ml-1 px-2 py-1.5 rounded text-sm text-text-muted hover:text-text-primary hover:bg-bg-card transition-all"
            title={muted ? '取消靜音' : '靜音'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </nav>
      </div>
    </header>
  );
}
