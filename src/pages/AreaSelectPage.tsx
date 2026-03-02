import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AREAS, getTagById, RENTAL_TAGS } from '../data/monsters';
import { getCollection } from '../lib/storage';
import type { Tag } from '../types';
import TagCard from '../components/TagCard';

export default function AreaSelectPage() {
  const navigate = useNavigate();
  const collection = getCollection();
  const availableTags = collection.length > 0 ? collection : RENTAL_TAGS;
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
      <h1 className="font-display text-3xl text-center mb-2 neon-text">SELECT AREA</h1>
      <p className="text-center text-text-muted mb-8">Choose a region to explore</p>

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
                {boss && <span className="text-accent">Boss: {boss.name}</span>}
              </div>
              {a.dropRates.superstar > 0 && (
                <span className="text-[10px] superstar-shimmer font-bold">★6 CHANCE!</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Team Selection */}
      {area && (
        <div className="bg-bg-card rounded-xl p-6 neon-border">
          <h2 className="font-display text-lg mb-1">
            Choose Your Team <span className="text-text-muted text-sm">({selectedTags.length}/3)</span>
          </h2>
          <p className="text-text-muted text-xs mb-4">
            {collection.length === 0
              ? 'No collection yet — using rental monsters!'
              : `Select up to 3 from your ${collection.length} collected tags.`}
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
            ⚔️ ENTER BATTLE
          </button>
        </div>
      )}
    </div>
  );
}
