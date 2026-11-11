import { Link, useLocation } from 'react-router-dom';
import { useCoins } from '../lib/useCoins';

const NAV_ITEMS = [
  { to: '/play', label: '遊玩', icon: '🎮' },
  { to: '/collection', label: '收藏', icon: '📦' },
];

export default function Header() {
  const location = useLocation();
  const { balance } = useCoins();

  return (
    <header className="sticky top-0 z-50 bg-bg-dark/90 backdrop-blur border-b border-primary/30">
      <div className="bg-gold/10 border-b border-gold/15">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 text-xs">
          <span className="text-text-muted">每日登入 +2 枚</span>
          <Link to="/settings" aria-label={`硬幣 ${balance} 枚，前往設定補幣`} className="min-h-8 flex items-center gap-2 rounded-full px-3 bg-gold/10 border border-gold/30 text-gold">
            <span aria-hidden="true">🪙</span>
            <span role="status" aria-live="polite" aria-atomic="true" className="font-display">{balance} <span className="text-[10px]">枚</span></span>
          </Link>
        </div>
      </div>
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
          <Link
            to="/settings"
            aria-label="設定"
            title="設定"
            className={`px-2 py-1.5 rounded text-sm transition-all ${
              location.pathname.startsWith('/settings')
                ? 'bg-primary/20 text-primary-light'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-card'
            }`}
          >
            ⚙️
          </Link>
        </nav>
      </div>
    </header>
  );
}
