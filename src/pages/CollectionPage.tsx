import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCollection, getBattleReadyIds, toggleBattleReady } from '../lib/storage';
import { TYPE_COLORS, TYPE_NAMES_ZH } from '../data/monsters';
import TagCard from '../components/TagCard';

type SortKey = 'newest' | 'grade-desc' | 'pe-desc';
const TYPE_LIST = ['fire', 'water', 'grass', 'electric', 'psychic', 'dark', 'dragon', 'fairy', 'fighting', 'normal', 'ice', 'ghost', 'steel', 'poison', 'ground', 'flying', 'bug', 'rock'];

export default function CollectionPage() {
  const collection = getCollection();
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('newest');
  const [showBack, setShowBack] = useState(false);
  const [battleReadyOnly, setBattleReadyOnly] = useState(false);
  const [readyIds, setReadyIds] = useState(() => getBattleReadyIds());

  const handleToggleReady = (tagId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBattleReady(tagId);
    setReadyIds(getBattleReadyIds());
  };

  const filtered = useMemo(() => {
    let items = [...collection];
    if (gradeFilter !== null) items = items.filter(t => t.grade === gradeFilter);
    if (typeFilter !== null) items = items.filter(t => t.types.includes(typeFilter));
    if (battleReadyOnly) items = items.filter(t => readyIds.has(t.id));
    switch (sort) {
      case 'grade-desc': items.sort((a, b) => b.grade - a.grade); break;
      case 'pe-desc': items.sort((a, b) => b.pe - a.pe); break;
      default: items.reverse(); break; // newest first
    }
    return items;
  }, [collection, gradeFilter, typeFilter, sort, battleReadyOnly, readyIds]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-center mb-2 neon-text">收藏</h1>
      <p className="text-center text-text-muted mb-6">
        已收集 {collection.length} 張卡牌
      </p>

      {collection.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-text-muted text-lg mb-4">你的收藏是空的！</p>
          <Link
            to="/play"
            className="px-6 py-2 bg-accent hover:bg-accent-light text-white font-display rounded-lg"
          >
            開始遊玩
          </Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Grade */}
            <div className="flex gap-1 items-center">
              <span className="text-xs text-text-muted mr-1">星等:</span>
              <button
                onClick={() => setGradeFilter(null)}
                className={`px-2 py-0.5 text-xs rounded ${gradeFilter === null ? 'bg-primary text-white' : 'bg-bg-card text-text-muted'}`}
              >全部</button>
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
              <span className="text-xs text-text-muted mr-1">屬性:</span>
              <button
                onClick={() => setTypeFilter(null)}
                className={`px-2 py-0.5 text-xs rounded ${typeFilter === null ? 'bg-primary text-white' : 'bg-bg-card text-text-muted'}`}
              >全部</button>
              {TYPE_LIST.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                  className={`px-2 py-0.5 text-xs rounded ${typeFilter === t ? 'text-white' : 'text-text-muted hover:opacity-80'}`}
                  style={{ background: typeFilter === t ? TYPE_COLORS[t] : `${TYPE_COLORS[t]}22` }}
                >{TYPE_NAMES_ZH[t] || t}</button>
              ))}
            </div>
          </div>

          {/* Sort & View toggles */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 flex-wrap">
              {([['newest', '最新'], ['grade-desc', '★ 高→低'], ['pe-desc', 'PE 高→低']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`px-2 py-0.5 text-xs rounded ${sort === key ? 'bg-primary/30 text-primary-light' : 'bg-bg-card text-text-muted'}`}
                >{label}</button>
              ))}
              <button
                onClick={() => setBattleReadyOnly(v => !v)}
                className={`px-2 py-0.5 text-xs rounded ${battleReadyOnly ? 'bg-accent text-white' : 'bg-bg-card text-text-muted'}`}
              >⚔️ 出戰</button>
            </div>
            <button
              onClick={() => setShowBack(!showBack)}
              className="px-2 py-0.5 text-xs rounded bg-bg-card text-text-muted hover:bg-bg-card-hover"
            >
              {showBack ? '📋 正面' : '🔄 能力值'}
            </button>
          </div>

          {/* Grid */}
          <div className="flex flex-wrap gap-3 justify-center">
            {filtered.map((tag, i) => (
              <div key={`${tag.id}-${i}`} className="relative">
                <Link to={`/collection/${tag.id}`} state={{ tag }}>
                  <TagCard tag={tag} size="md" showBack={showBack} />
                </Link>
                <button
                  onClick={(e) => handleToggleReady(tag.id, e)}
                  className={`absolute top-1 right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center transition-all z-10 ${
                    readyIds.has(tag.id)
                      ? 'bg-accent text-white shadow-lg shadow-accent/30'
                      : 'bg-black/50 text-text-muted hover:bg-black/70'
                  }`}
                  title={readyIds.has(tag.id) ? '取消出戰' : '設為出戰'}
                >
                  ⚔️
                </button>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-text-muted py-8">沒有符合篩選條件的卡牌。</p>
          )}
        </>
      )}
    </div>
  );
}
