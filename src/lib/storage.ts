import type { Tag, TrainerProfile, GameStats } from '../types';

const STORAGE_KEYS = {
  collection: 'meza_collection',
  trainer: 'meza_trainer',
  stats: 'meza_stats',
  battleReady: 'meza_battle_ready',
};

function getBaseId(tag: Tag): string {
  return tag.baseId ?? tag.id.replace(/_\d{13,}$/, '');
}

/** Auto-migrate old duplicate entries into plusLevel system */
function deduplicateCollection(tags: Tag[]): Tag[] {
  const grouped = new Map<string, Tag[]>();
  for (const tag of tags) {
    const bid = getBaseId(tag);
    if (!grouped.has(bid)) grouped.set(bid, []);
    grouped.get(bid)!.push(tag);
  }
  const result: Tag[] = [];
  for (const [bid, group] of grouped) {
    const base = group[0];
    const extraDupes = group.length - 1;
    result.push({
      ...base,
      baseId: bid,
      plusLevel: Math.min((base.plusLevel ?? 0) + extraDupes, 5),
    });
  }
  return result;
}

export function getCollection(): Tag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.collection);
    const tags: Tag[] = raw ? JSON.parse(raw) : [];
    // Auto-migrate old duplicates
    if (tags.length > 0 && tags.some(t => t.baseId === undefined)) {
      const migrated = deduplicateCollection(tags);
      localStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(migrated));
      return migrated;
    }
    return tags;
  } catch { return []; }
}

export function addToCollection(tag: Tag): { plusLevel: number; isNew: boolean } {
  const col = getCollection();
  const baseId = tag.baseId ?? tag.id;
  const existing = col.find(t => getBaseId(t) === baseId);

  if (existing) {
    const cur = existing.plusLevel ?? 0;
    if (cur < 5) {
      existing.plusLevel = cur + 1;
      localStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(col));
      return { plusLevel: existing.plusLevel, isNew: false };
    }
    return { plusLevel: 5, isNew: false };
  }
  col.push({ ...tag, id: `${baseId}_${Date.now()}`, baseId, plusLevel: 0 });
  localStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(col));
  return { plusLevel: 0, isNew: true };
}

export function removeFromCollection(tagIds: string[]): void {
  const col = getCollection();
  const filtered = col.filter(t => !tagIds.includes(t.id));
  localStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(filtered));
}

/** Return a tag with stats boosted by plusLevel */
export function getEffectiveTag(tag: Tag): Tag {
  const bonus = (tag.plusLevel ?? 0) * 10;
  if (bonus === 0) return tag;
  return {
    ...tag,
    stats: {
      hp: tag.stats.hp + bonus,
      atk: tag.stats.atk + bonus,
      def: tag.stats.def + bonus,
      spd: tag.stats.spd + bonus,
    },
  };
}

export function clearCollection(): void {
  localStorage.removeItem(STORAGE_KEYS.collection);
}

/* ── Battle-ready set ── */
export function getBattleReadyIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.battleReady);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

export function toggleBattleReady(tagId: string): boolean {
  const set = getBattleReadyIds();
  if (set.has(tagId)) { set.delete(tagId); } else { set.add(tagId); }
  localStorage.setItem(STORAGE_KEYS.battleReady, JSON.stringify([...set]));
  return set.has(tagId);
}

export function isBattleReady(tagId: string): boolean {
  return getBattleReadyIds().has(tagId);
}

export function getTrainer(): TrainerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.trainer);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveTrainer(profile: TrainerProfile): void {
  localStorage.setItem(STORAGE_KEYS.trainer, JSON.stringify(profile));
}

export function getStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stats);
    return raw ? JSON.parse(raw) : { totalBattles: 0, totalCatches: 0, starCount: 0, superstarCount: 0 };
  } catch {
    return { totalBattles: 0, totalCatches: 0, starCount: 0, superstarCount: 0 };
  }
}

export function updateStats(partial: Partial<GameStats>): void {
  const s = getStats();
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify({ ...s, ...partial }));
}

export function incrementStat(key: keyof GameStats, amount = 1): void {
  const s = getStats();
  s[key] += amount;
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(s));
}

export function exportCollection(): string {
  return JSON.stringify({ collection: getCollection(), trainer: getTrainer(), stats: getStats() }, null, 2);
}

export function importCollection(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.collection) localStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(data.collection));
    if (data.trainer) localStorage.setItem(STORAGE_KEYS.trainer, JSON.stringify(data.trainer));
    if (data.stats) localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(data.stats));
    return true;
  } catch { return false; }
}

export function clearAll(): void {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}
