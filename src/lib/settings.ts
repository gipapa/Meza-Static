/* ────────────────────────────────────────────────────────────────────
 *  User settings (localStorage-backed, framework-free).
 *
 *  Kept free of React/Phaser imports so it can be unit-tested with
 *  `node --test`. The React binding lives in useSettings.ts.
 *  ──────────────────────────────────────────────────────────────────── */

/** 'simple' = the short Phaser BattleScene; 'advanced' = per-move cinematics. */
export type AnimationQuality = 'simple' | 'advanced';

export interface GameSettings {
  animationQuality: AnimationQuality;
}

export const SETTINGS_STORAGE_KEY = 'meza_settings';

export const DEFAULT_SETTINGS: GameSettings = Object.freeze({
  animationQuality: 'simple',
});

/** Parse a stored JSON blob, falling back to defaults for anything invalid. */
export function parseSettings(raw: string | null | undefined): GameSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const obj = JSON.parse(raw) as Partial<Record<keyof GameSettings, unknown>> | null;
    const q = obj?.animationQuality;
    return {
      ...DEFAULT_SETTINGS,
      animationQuality: q === 'advanced' || q === 'simple' ? q : DEFAULT_SETTINGS.animationQuality,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

let cache: GameSettings | null = null;
const listeners = new Set<() => void>();

function readStorage(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(SETTINGS_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Current settings. Returns a stable reference until settings change. */
export function getSettings(): GameSettings {
  if (!cache) cache = parseSettings(readStorage());
  return cache;
}

export function updateSettings(patch: Partial<GameSettings>): GameSettings {
  cache = parseSettings(JSON.stringify({ ...getSettings(), ...patch }));
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* private mode / quota: keep the in-memory value */
  }
  listeners.forEach(fn => fn());
  return cache;
}

/** Subscribe to changes (this tab and other tabs). Returns an unsubscribe fn. */
export function subscribeSettings(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== SETTINGS_STORAGE_KEY && e.key !== null) return;
    cache = null;
    fn();
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}
