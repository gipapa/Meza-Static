import { useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import type { Tag } from '../types';
import { TYPE_COLORS, TYPE_NAMES_ZH } from '../data/monsters';
import CharacterArt from '../components/CharacterArt';
import CharacterImageEditor from '../components/CharacterImageEditor';
import { getCollection, getEffectiveTag } from '../lib/storage';
import MovePickerDialog from '../components/MovePickerDialog';
import { useNameReveal } from '../lib/nameMask';

export default function TagDetailPage() {
  const location = useLocation();
  const { tagId } = useParams();
  const [tag, setTag] = useState(() => getCollection().find(item => item.id === tagId)
    ?? (location.state as { tag: Tag } | null)?.tag);
  const [editingMove, setEditingMove] = useState(false);
  const [moveNotice, setMoveNotice] = useState('');
  const [flipped, setFlipped] = useState(false);
  const { dn } = useNameReveal();

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
                {(tag.plusLevel ?? 0) > 0 && (
                  <span className="text-neon-cyan ml-1">+{tag.plusLevel}</span>
                )}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <CharacterArt tag={tag} className="text-8xl" style={{ filter: `drop-shadow(0 0 20px ${typeColor})` }} scale={1.6} />
              </div>
              <h2 className="font-display text-2xl">{dn(tag.name)}</h2>
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
              <h3 className="font-display text-lg mb-4">{dn(tag.name)} — 能力值</h3>
              <div className="space-y-3 flex-1">
                {(() => { const s = getEffectiveTag(tag).stats; return (<>
                  <StatBarLarge label="HP" value={s.hp} max={300} color="#22C55E" />
                  <StatBarLarge label="ATK" value={s.atk} max={200} color="#EF4444" />
                  <StatBarLarge label="DEF" value={s.def} max={200} color="#3B82F6" />
                  <StatBarLarge label="SPD" value={s.spd} max={200} color="#FBBF24" />
                </>); })()}
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

      <div className="mt-6 rounded-xl border border-white/10 bg-bg-card p-4">
        <h3 className="font-display mb-2">出戰招式</h3>
        <div className="flex justify-between text-sm mb-3">
          <span>{tag.move.name} <span style={{ color: TYPE_COLORS[tag.move.type] }}>{TYPE_NAMES_ZH[tag.move.type] ?? tag.move.type}</span></span>
          <span>威力 {tag.move.power}</span>
        </div>
        <button type="button" onClick={() => setEditingMove(true)} className="w-full min-h-12 bg-primary/20 text-primary-light rounded-lg font-display">更換招式</button>
        {moveNotice && <p role="status" className="text-neon-cyan text-sm mt-3">{moveNotice}</p>}
      </div>
      {editingMove && <MovePickerDialog tag={tag} onClose={() => setEditingMove(false)} onSaved={updated => {
        setTag(updated);
        setEditingMove(false);
        setMoveNotice(`已學會 ${updated.move.name}！`);
      }} />}
      <CharacterImageEditor tag={tag} />
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
