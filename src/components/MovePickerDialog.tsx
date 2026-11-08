import { useId, useState } from 'react';
import type { Tag } from '../types';
import { ALL_MOVES, groupMovesByType, moveKey } from '../data/moves';
import { TYPE_COLORS, TYPE_NAMES_ZH } from '../data/monsters';
import { updateCollectionMove } from '../lib/storage';
import { useNameReveal } from '../lib/nameMask';
import StepDialog from './StepDialog';

export default function MovePickerDialog({ tag, onSaved, onClose }: {
  tag: Tag;
  onSaved: (tag: Tag) => void;
  onClose: () => void;
}) {
  const { dn } = useNameReveal();
  const selectId = useId();
  const [selectedKey, setSelectedKey] = useState(moveKey(tag.move));
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const moves = ALL_MOVES.some(move => moveKey(move) === moveKey(tag.move))
    ? ALL_MOVES : [...ALL_MOVES, tag.move];
  const selected = moves.find(move => moveKey(move) === selectedKey)!;
  const groups = groupMovesByType(moves.filter(move =>
    `${move.name} ${TYPE_NAMES_ZH[move.type] ?? move.type}`.includes(query.trim()),
  ));

  const save = () => {
    try {
      const updated = updateCollectionMove(tag.id, selected);
      if (!updated) { setError('找不到這張收藏卡牌，請重新整理後再試。'); return; }
      onSaved(updated);
    } catch {
      setError('無法儲存招式，請確認瀏覽器儲存空間後重試。');
    }
  };

  return (
    <StepDialog title={`${dn(tag.name)}・更換招式`}>
      <p className="text-sm text-text-muted mb-4">可自由學習任意屬性的招式，儲存後下次出戰即可使用。</p>
      <p className="text-sm mb-4">目前招式：<strong>{tag.move.name}</strong> · 威力 {tag.move.power}</p>
      <input aria-label="搜尋招式或屬性" placeholder="搜尋招式或屬性…" value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full min-h-11 mb-3 rounded-lg border border-white/20 bg-bg-card px-3 text-sm" />
      <label htmlFor={selectId} className="block text-sm mb-2">選擇招式（依屬性分組）</label>
      <select id={selectId} value={selectedKey} onChange={e => setSelectedKey(e.target.value)}
        className="w-full min-h-12 rounded-lg border border-primary/50 bg-bg-card px-3 text-base">
        {!groups.some(group => group.moves.some(move => moveKey(move) === selectedKey)) && (
          <option value={selectedKey}>{selected.name}（已選擇）</option>
        )}
        {groups.map(group => (
          <optgroup key={group.type} label={`${TYPE_NAMES_ZH[group.type] ?? group.type}屬性`}>
            {group.moves.map(move => (
              <option key={moveKey(move)} value={moveKey(move)}>{move.name} · 威力 {move.power}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {groups.length === 0 && <p role="status" className="text-sm text-text-muted mt-2">沒有符合的招式，請試試其他關鍵字。</p>}
      <div className="my-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="font-display text-lg mb-1">{selected.name}</div>
        <div className="flex justify-between text-sm">
          <span style={{ color: TYPE_COLORS[selected.type] ?? '#A78BFA' }}>{TYPE_NAMES_ZH[selected.type] ?? selected.type}屬性</span>
          <span>威力 {selected.power}</span>
        </div>
      </div>
      {error && <p role="alert" className="text-red-300 text-sm mb-3">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="min-h-12 flex-1 rounded-lg bg-white/10">取消</button>
        <button type="button" onClick={save} className="min-h-12 flex-1 rounded-lg bg-primary text-white font-display">儲存招式</button>
      </div>
    </StepDialog>
  );
}
