/* ────────────────────────────────────────────────────────────────────
 *  Custom character images (localStorage-backed, framework-free).
 *
 *  - Keyed by *character id* = the species id (`tag.baseId`, e.g. '045'),
 *    so a picture set from the collection also shows on wild enemies of the
 *    same species and survives duplicate merges / reloads.
 *  - Two kinds:
 *      upload  a downscaled data: URL produced on-device (imageProcessing.ts)
 *      url     a remote http(s) URL; `cache` holds a downscaled data: URL when
 *              the remote host allows CORS, so Canvas/WebGL can use it too.
 *  - Everything here is pure / storage-only so it runs under `node --test`.
 *    Rendering always falls back to the type emoji (CharacterArt.tsx,
 *    phaser/actorArt.ts).
 *  ──────────────────────────────────────────────────────────────────── */

export const CHARACTER_IMAGES_STORAGE_KEY = 'meza_character_images';

/** Max length of one stored data: URL (≈ 190 KB of image bytes). */
export const MAX_DATA_URL_LENGTH = 260_000;
/** Total budget for all stored images (localStorage is ~5 MB per origin). */
export const MAX_TOTAL_LENGTH = 3_000_000;
export const MAX_URL_LENGTH = 2048;

export type CharacterImageKind = 'upload' | 'url';

export interface CharacterImageEntry {
  kind: CharacterImageKind;
  /** data: URL (upload) or http(s) URL (url). */
  src: string;
  /** CORS-safe downscaled copy of a remote image, when available. */
  cache?: string;
  updatedAt: number;
}

export type CharacterImageMap = Readonly<Record<string, CharacterImageEntry>>;

export type Result = { ok: true } | { ok: false; error: string };

const DATA_URL_RE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/;

/** Species id for a tag (collection ids carry a `_<timestamp>` suffix). */
export function characterIdOf(tag: { id: string; baseId?: string }): string {
  return tag.baseId ?? tag.id.replace(/_\d{13,}$/, '');
}

export function isValidCharacterId(id: unknown): id is string {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id);
}

export function isAllowedDataUrl(s: unknown): s is string {
  return typeof s === 'string' && s.length <= MAX_DATA_URL_LENGTH && DATA_URL_RE.test(s);
}

/** Validate user input for a remote image. Only http(s), no credentials. */
export function validateImageUrl(input: string): { ok: true; url: string } | { ok: false; error: string } {
  const raw = input.trim();
  if (!raw) return { ok: false, error: '請輸入圖片網址' };
  if (raw.length > MAX_URL_LENGTH) return { ok: false, error: '網址太長' };
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, error: '網址格式不正確' };
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return { ok: false, error: '只支援 http:// 或 https:// 圖片網址' };
  if (u.username || u.password) return { ok: false, error: '網址不可包含帳號密碼' };
  return { ok: true, url: u.href };
}

function isValidEntry(e: unknown): e is CharacterImageEntry {
  if (!e || typeof e !== 'object') return false;
  const o = e as Record<string, unknown>;
  if (typeof o.updatedAt !== 'number') return false;
  if (o.cache !== undefined && !isAllowedDataUrl(o.cache)) return false;
  if (o.kind === 'upload') return isAllowedDataUrl(o.src);
  if (o.kind === 'url') return typeof o.src === 'string' && validateImageUrl(o.src).ok;
  return false;
}

/** Parse the stored blob, silently dropping anything malformed. */
export function parseCharacterImages(raw: string | null | undefined): CharacterImageMap {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as { images?: unknown } | null;
    const images = obj?.images;
    if (!images || typeof images !== 'object') return {};
    const out: Record<string, CharacterImageEntry> = {};
    for (const [id, e] of Object.entries(images as Record<string, unknown>)) {
      if (!isValidCharacterId(id) || !isValidEntry(e)) continue;
      const { kind, src, cache, updatedAt } = e;
      out[id] = cache ? { kind, src, cache, updatedAt } : { kind, src, updatedAt };
    }
    return out;
  } catch {
    return {};
  }
}

/** The best src to display (CORS-safe cache first). */
export function displaySrc(entry: CharacterImageEntry | undefined | null): string | null {
  if (!entry) return null;
  return entry.cache ?? entry.src;
}

/** Bytes (≈ string length) the map occupies in storage. */
export function storageSize(map: CharacterImageMap): number {
  return JSON.stringify({ v: 1, images: map }).length;
}

/* ── Store ── */

let cache: CharacterImageMap | null = null;
const listeners = new Set<() => void>();

function readStorage(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(CHARACTER_IMAGES_STORAGE_KEY);
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach(fn => fn());
}

function persist(next: CharacterImageMap): Result {
  try {
    if (Object.keys(next).length === 0) localStorage.removeItem(CHARACTER_IMAGES_STORAGE_KEY);
    else localStorage.setItem(CHARACTER_IMAGES_STORAGE_KEY, JSON.stringify({ v: 1, images: next }));
  } catch {
    return { ok: false, error: '裝置儲存空間不足，請移除其他角色圖片後再試' };
  }
  cache = next;
  emit();
  return { ok: true };
}

/** All images. Returns a stable reference until something changes. */
export function getCharacterImages(): CharacterImageMap {
  if (!cache) cache = parseCharacterImages(readStorage());
  return cache;
}

export function getCharacterImage(id: string): CharacterImageEntry | null {
  return getCharacterImages()[id] ?? null;
}

export function getCharacterImageSrc(id: string | null | undefined): string | null {
  return id ? displaySrc(getCharacterImages()[id]) : null;
}

export function setCharacterImage(id: string, entry: Omit<CharacterImageEntry, 'updatedAt'>): Result {
  if (!isValidCharacterId(id)) return { ok: false, error: '角色識別碼無效' };
  const full: CharacterImageEntry = entry.cache
    ? { kind: entry.kind, src: entry.src, cache: entry.cache, updatedAt: Date.now() }
    : { kind: entry.kind, src: entry.src, updatedAt: Date.now() };
  if (!isValidEntry(full)) {
    return { ok: false, error: entry.kind === 'upload' ? '圖片格式或大小不符' : '圖片網址無效' };
  }
  const next = { ...getCharacterImages(), [id]: full };
  if (storageSize(next) > MAX_TOTAL_LENGTH) {
    return { ok: false, error: '角色圖片總容量已滿，請先移除部分角色圖片' };
  }
  return persist(next);
}

export function removeCharacterImage(id: string): Result {
  const cur = getCharacterImages();
  if (!(id in cur)) return { ok: true };
  const next = { ...cur };
  delete next[id];
  return persist(next);
}

export function clearCharacterImages(): void {
  try { localStorage.removeItem(CHARACTER_IMAGES_STORAGE_KEY); } catch { /* ignore */ }
  cache = {};
  emit();
}

/** Subscribe to changes (this tab and other tabs). Returns an unsubscribe fn. */
export function subscribeCharacterImages(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== CHARACTER_IMAGES_STORAGE_KEY && e.key !== null) return;
    cache = null;
    fn();
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}
