import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { Tag } from '../types';
import { TYPE_COLORS, TYPE_EMOJI, TYPE_NAMES_ZH } from '../data/monsters';

export default function TagDetailPage() {
  const location = useLocation();
  const tag = (location.state as { tag: Tag })?.tag;
  const [flipped, setFlipped] = useState(false);

  if (!tag) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">找不到卡牌。</p>
        <Link to="/collection" className="text-primary-light underline text-sm">← 返回收藏</Link>
      </div>
    );
  }

  const primaryType = tag.types[0];
  const typeColor = TYPE_COLORS[primaryType] || '#A78BFA';

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Link to="/collection" className="text-text-muted text-sm hover:text-primary-light mb-4 inline-block">
        ← 返回收藏
      </Link>

      <div className="text-center">
        {/* Card */}
        <div
          className={`mx-auto w-64 h-96 cursor-pointer perspective-1000 ${flipped ? 'tag-card-flipped' : ''}`}
          onClick={() => setFlipped(!flipped)}
          style={{ perspective: '1000px' }}
        >
          <div className="tag-card-inner relative w-full h-full">
            {/* Front */}
            <div
              className="tag-card-front absolute inset-0 rounded-2xl p-6 flex flex-col"
              style={{
                background: `linear-gradient(135deg, ${typeColor}33, ${typeColor}11)`,
                border: `2px solid ${typeColor}66`,
              }}
            >
              <div className={`text-lg font-bold ${tag.grade >= 6 ? 'superstar-shimmer' : tag.grade >= 5 ? 'star-shimmer' : 'text-gold'}`}>
                {'★'.repeat(tag.grade)}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-8xl" style={{ filter: `drop-shadow(0 0 20px ${typeColor})` }}>
                  {TYPE_EMOJI[primaryType] || '⚪'}
                </div>
              </div>
              <h2 className="font-display text-2xl">{tag.name}</h2>
              <div className="flex justify-center gap-2 mt-2">
                {tag.types.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: `${TYPE_COLORS[t]}33`, color: TYPE_COLORS[t] }}>
                    {(TYPE_NAMES_ZH[t] || t).toUpperCase()}
                  </span>
                ))}
              </div>
              <div className="text-text-muted text-sm mt-2">PE {tag.pe}</div>
              {tag.flags.legendary && <div className="text-gold text-xs mt-1">⭐ 傳說</div>}
              {tag.flags.mythical && <div className="text-accent text-xs">✨ 幻之</div>}
              <p className="text-text-muted text-xs mt-3">點擊翻轉</p>
            </div>

            {/* Back */}
            <div
              className="tag-card-back absolute inset-0 rounded-2xl p-6 flex flex-col"
              style={{
                background: `linear-gradient(135deg, ${typeColor}22, #0F0F23)`,
                border: `2px solid ${typeColor}44`,
              }}
            >
              <h3 className="font-display text-lg mb-4">{tag.name} — 能力值</h3>
              <div className="space-y-3 flex-1">
                <StatBarLarge label="HP" value={tag.stats.hp} max={300} color="#22C55E" />
                <StatBarLarge label="ATK" value={tag.stats.atk} max={200} color="#EF4444" />
                <StatBarLarge label="DEF" value={tag.stats.def} max={200} color="#3B82F6" />
                <StatBarLarge label="SPD" value={tag.stats.spd} max={200} color="#FBBF24" />
              </div>
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="font-display text-sm mb-1">{tag.move.name}</div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: TYPE_COLORS[tag.move.type] }}>{(TYPE_NAMES_ZH[tag.move.type] || tag.move.type).toUpperCase()}</span>
                  <span>威力: {tag.move.power}</span>
                </div>
              </div>
              <p className="text-text-muted text-xs mt-3">點擊翻轉</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBarLarge({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-muted font-medium">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
