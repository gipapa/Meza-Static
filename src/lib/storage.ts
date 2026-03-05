import type { Tag, TrainerProfile, GameStats } from '../types';

const STORAGE_KEYS = {
  collection: 'meza_collection',
  trainer: 'meza_trainer',
  stats: 'meza_stats',
  battleReady: 'meza_battle_ready',
};

export function getCollection(): Tag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.collection);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addToCollection(tag: Tag): void {
  const col = getCollection();
  // Allow duplicates (like real gacha)
  col.push({ ...tag, id: `${tag.id}_${Date.now()}` });
  localStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(col));
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
