import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCollection } from '../lib/storage';
import { TYPE_COLORS } from '../data/monsters';
import TagCard from '../components/TagCard';

type SortKey = 'newest' | 'grade-desc' | 'pe-desc';
const TYPE_LIST = ['fire', 'water', 'grass', 'electric', 'psychic', 'dark', 'dragon', 'fairy', 'fighting', 'normal', 'ice', 'ghost', 'steel', 'poison', 'ground', 'flying', 'bug', 'rock'];

export default function CollectionPage() {
  const collection = getCollection();
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('newest');
  const [showBack, setShowBack] = useState(false);

  const filtered = useMemo(() => {
    let items = [...collection];
    if (gradeFilter !== null) items = items.filter(t => t.grade === gradeFilter);
    if (typeFilter !== null) items = items.filter(t => t.types.includes(typeFilter));
    switch (sort) {
      case 'grade-desc': items.sort((a, b) => b.grade - a.grade); break;
      case 'pe-desc': items.sort((a, b) => b.pe - a.pe); break;
      default: items.reverse(); break; // newest first
    }
    return items;
  }, [collection, gradeFilter, typeFilter, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-center mb-2 neon-text">COLLECTION</h1>
      <p className="text-center text-text-muted mb-6">
        {collection.length} tag{collection.length !== 1 ? 's' : ''} collected
      </p>

      {collection.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-text-muted text-lg mb-4">Your collection is empty!</p>
          <Link
            to="/play"
            className="px-6 py-2 bg-accent hover:bg-accent-light text-white font-display rounded-lg"
          >
            START PLAYING
          </Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Grade */}
            <div className="flex gap-1 items-center">
              <span className="text-xs text-text-muted mr-1">Grade:</span>
              <button
                onClick={() => setGradeFilter(null)}
                className={`px-2 py-0.5 text-xs rounded ${gradeFilter === null ? 'bg-primary text-white' : 'bg-bg-card text-text-muted'}`}
              >All</button>
              {[2, 3, 4, 5, 6].map(g => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(gradeFilter === g ? null : g)}
                  className={`px-2 py-0.5 text-xs rounded ${gradeFilter === g ? 'bg-primary text-white' : 'bg-bg-card text-text-muted hover:bg-bg-card-hover'}`}
                >★{g}</button>
              ))}
            </div>
            {/* Type */}
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-xs text-text-muted mr-1">Type:</span>
              <button
                onClick={() => setTypeFilter(null)}
                className={`px-2 py-0.5 text-xs rounded ${typeFilter === null ? 'bg-primary text-white' : 'bg-bg-card text-text-muted'}`}
              >All</button>
              {TYPE_LIST.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                  className={`px-2 py-0.5 text-xs rounded capitalize ${typeFilter === t ? 'text-white' : 'text-text-muted hover:opacity-80'}`}
                  style={{ background: typeFilter === t ? TYPE_COLORS[t] : `${TYPE_COLORS[t]}22` }}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Sort & View toggles */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {([['newest', 'Newest'], ['grade-desc', '★ High→Low'], ['pe-desc', 'PE High→Low']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`px-2 py-0.5 text-xs rounded ${sort === key ? 'bg-primary/30 text-primary-light' : 'bg-bg-card text-text-muted'}`}
                >{label}</button>
              ))}
            </div>
            <button
              onClick={() => setShowBack(!showBack)}
              className="px-2 py-0.5 text-xs rounded bg-bg-card text-text-muted hover:bg-bg-card-hover"
            >
              {showBack ? '📋 Front' : '🔄 Stats'}
            </button>
          </div>

          {/* Grid */}
          <div className="flex flex-wrap gap-3 justify-center">
            {filtered.map((tag, i) => (
              <Link key={`${tag.id}-${i}`} to={`/collection/${tag.id}`} state={{ tag }}>
                <TagCard tag={tag} size="md" showBack={showBack} />
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-text-muted py-8">No tags match your filters.</p>
          )}
        </>
      )}
    </div>
  );
}
