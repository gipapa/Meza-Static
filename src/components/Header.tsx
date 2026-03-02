import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/play', label: 'Play', icon: '🎮' },
  { to: '/collection', label: 'Collection', icon: '📦' },
  { to: '/trainer', label: 'Trainer', icon: '👤' },
  { to: '/howto', label: 'How To', icon: '📖' },
];

export default function Header() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50 bg-bg-dark/90 backdrop-blur border-b border-primary/30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-wider text-primary-light hover:text-neon-cyan transition-colors">
          MEZA<span className="text-accent">★</span>STATIC
        </Link>
        <nav className="flex gap-1 sm:gap-3">
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
        </nav>
      </div>
    </header>
  );
}
