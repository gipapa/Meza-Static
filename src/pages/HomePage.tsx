import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="scanlines">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <h1 className="font-display text-5xl sm:text-7xl neon-text mb-4 z-10">
          MEZA<span className="text-accent">★</span>STATIC
        </h1>
        <p className="text-text-muted text-lg sm:text-xl max-w-lg mb-8 z-10">
          Battle. Spin. Catch. Collect. <br />
          <span className="text-primary-light">A fan-made arcade tag-battle experience.</span>
        </p>
        <Link
          to="/play"
          className="z-10 px-8 py-3 bg-accent hover:bg-accent-light text-white font-display text-xl rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/30"
        >
          START
        </Link>
        {/* Decorative floating elements */}
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-bounce" style={{ animationDelay: '0s' }}>🔥</div>
        <div className="absolute top-40 right-16 text-3xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>💧</div>
        <div className="absolute bottom-32 left-20 text-3xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>🌿</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>⚡</div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FeatureCard
          to="/play"
          icon="⚔️"
          title="Battle & Catch"
          description="Choose an area, battle bosses across 3 rounds, spin the roulette, and catch monsters!"
          accent="#F43F5E"
        />
        <FeatureCard
          to="/play"
          icon="🎯"
          title="Catch Now"
          description="Skip the battle — encounter and catch monsters directly from the wild!"
          accent="#7C3AED"
        />
        <FeatureCard
          to="/collection"
          icon="📦"
          title="Collection"
          description="Browse your collected tags, view stats, filter by type and grade."
          accent="#00FFFF"
        />
      </section>
    </div>
  );
}

function FeatureCard({ to, icon, title, description, accent }: {
  to: string; icon: string; title: string; description: string; accent: string;
}) {
  return (
    <Link
      to={to}
      className="block p-6 rounded-xl bg-bg-card card-glow text-center"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-display text-lg mb-2">{title}</h3>
      <p className="text-text-muted text-sm">{description}</p>
    </Link>
  );
}
