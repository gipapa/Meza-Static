import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AREAS, getTagById, RENTAL_TAGS } from '../data/monsters';
import { getCollection, getBattleReadyIds } from '../lib/storage';
import TagCard from '../components/TagCard';
import { useNameReveal } from '../lib/nameMask';

export default function AreaSelectPage() {
  const navigate = useNavigate();
  const { dn } = useNameReveal();
  const collection = getCollection();
  const battleReadyIds = getBattleReadyIds();

  // Show battle-ready monsters first; if none tagged, show all
  const battleReadyTags = collection.filter(t => battleReadyIds.has(t.id));
  const availableTags = collection.length === 0
    ? RENTAL_TAGS
    : battleReadyTags.length > 0
      ? battleReadyTags
      : collection;
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const area = AREAS.find(a => a.areaId === selectedArea);

  const toggleTag = (id: string) => {
    setSelectedTags(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const startBattle = () => {
    if (!area || selectedTags.length === 0) return;
    const tags = selectedTags.map(id => availableTags.find(t => t.id === id)!);
    navigate('/play/battle', { state: { area, playerTags: tags } });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-center mb-2 neon-text">選擇區域</h1>
      <p className="text-center text-text-muted mb-8">選擇一個區域進行探索</p>

      {/* Area Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {AREAS.map(a => {
          const boss = getTagById(a.bossPool[0]);
          return (
            <button
              key={a.areaId}
              onClick={() => { setSelectedArea(a.areaId); setSelectedTags([]); }}
              className={`p-4 rounded-xl text-left transition-all border ${
                selectedArea === a.areaId
                  ? 'border-neon-cyan bg-bg-card-hover neon-border-cyan'
                  : 'border-white/5 bg-bg-card hover:bg-bg-card-hover'
              }`}
            >
              <div className="text-3xl mb-2">{a.emoji}</div>
              <h3 className="font-display text-sm mb-1">{a.name}</h3>
              <p className="text-text-muted text-xs mb-2">{a.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gold">★{a.minGrade}~★{a.maxGrade}</span>
                {boss && <span className="text-accent">頭目: {dn(boss.name)}</span>}
              </div>
              {a.dropRates.superstar > 0 && (
                <span className="text-[10px] superstar-shimmer font-bold">★６ 機會！</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Team Selection */}
      {area && (
        <div className="bg-bg-card rounded-xl p-6 neon-border">
          <h2 className="font-display text-lg mb-1">
            選擇你的隊伍 <span className="text-text-muted text-sm">({selectedTags.length}/3)</span>
          </h2>
          <p className="text-text-muted text-xs mb-4">
            {collection.length === 0
              ? '還沒有收藏 — 使用出租怪獸！'
              : battleReadyTags.length > 0
                ? `顯示 ${battleReadyTags.length} 隻出戰標記的怪獸（可在收藏頁管理）`
                : `從你的 ${collection.length} 張卡牌中選擇最多 3 隻。（提示：在收藏頁標記「出戰」可篩選常用怪獸）`}
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {availableTags.slice(0, 12).map(tag => (
              <TagCard
                key={tag.id}
                tag={tag}
                size="sm"
                selected={selectedTags.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>
          <button
            onClick={startBattle}
            disabled={selectedTags.length === 0}
            className="px-6 py-2 bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-display rounded-lg transition-all"
          >
            ⚔️ 進入對戰
          </button>
        </div>
      )}
    </div>
  );
}
