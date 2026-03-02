import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { Tag } from '../types';
import { addToCollection, incrementStat } from '../lib/storage';
import TagCard from '../components/TagCard';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { caughtTags: Tag[]; isCatchNow?: boolean } | null;
  const saved = useRef(false);

  useEffect(() => {
    if (!state) {
      navigate('/play');
      return;
    }
    if (saved.current) return;
    saved.current = true;
    // Save caught tags to collection
    state.caughtTags.forEach(tag => {
      addToCollection(tag);
      if (tag.grade >= 6) incrementStat('superstarCount');
      else if (tag.grade >= 5) incrementStat('starCount');
    });
    incrementStat('totalBattles');
    incrementStat('totalCatches', state.caughtTags.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;

  const { caughtTags } = state;
  const hasSpecial = caughtTags.some(t => t.grade >= 5);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h1 className="font-display text-3xl mb-2 neon-text">RESULTS</h1>

      {caughtTags.length === 0 ? (
        <div className="my-12">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-text-muted text-lg">No monsters caught this time...</p>
          <p className="text-text-muted text-sm mt-2">Keep trying — better luck next round!</p>
        </div>
      ) : (
        <>
          {hasSpecial && (
            <div className="my-4">
              <div className="text-4xl mb-2">🌟✨🌟</div>
              <p className="font-display text-xl superstar-shimmer">★ RARE CATCH ★</p>
            </div>
          )}
          <p className="text-text-muted mb-6">
            You caught <span className="text-neon-cyan font-bold">{caughtTags.length}</span> monster{caughtTags.length > 1 ? 's' : ''}!
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {caughtTags.map((tag, i) => (
              <div key={i} className="catch-success" style={{ animationDelay: `${i * 0.2}s` }}>
                <TagCard tag={tag} size="lg" />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Link
          to="/play"
          className="px-6 py-2 bg-accent hover:bg-accent-light text-white font-display rounded-lg transition-all"
        >
          🎮 PLAY AGAIN
        </Link>
        <Link
          to="/collection"
          className="px-6 py-2 bg-primary/20 border border-primary/40 text-primary-light font-display rounded-lg hover:bg-primary/30 transition-all"
        >
          📦 VIEW COLLECTION
        </Link>
      </div>
    </div>
  );
}
