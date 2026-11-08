// Unit tests for custom character image storage. Run: npm test
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_IMAGES_STORAGE_KEY, MAX_DATA_URL_LENGTH, MAX_TOTAL_LENGTH,
  characterIdOf, clearCharacterImages, displaySrc, getCharacterImage, getCharacterImageSrc,
  getCharacterImages, isAllowedDataUrl, parseCharacterImages, removeCharacterImage,
  setCharacterImage, subscribeCharacterImages, validateImageUrl,
} from '../src/lib/characterImages.ts';

/* Minimal in-memory localStorage with an optional quota. */
class MemoryStorage {
  map = new Map<string, string>();
  quota = Infinity;
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  setItem(k: string, v: string) {
    if (v.length > this.quota) throw new Error('QuotaExceededError');
    this.map.set(k, String(v));
  }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
}
const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true });

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const WEBP = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

beforeEach(() => {
  storage.quota = Infinity;
  clearCharacterImages();
  storage.clear();
});

test('character id is the species id (collection suffix stripped, baseId wins)', () => {
  assert.equal(characterIdOf({ id: '045' }), '045');
  assert.equal(characterIdOf({ id: '045_1730000000000' }), '045');
  assert.equal(characterIdOf({ id: 'x_1730000000000', baseId: '150' }), '150');
  assert.equal(characterIdOf({ id: 'rental_001' }), 'rental_001');
});

test('URL validation: only http(s), no credentials, trimmed', () => {
  assert.deepEqual(validateImageUrl('  https://example.com/a.png '), { ok: true, url: 'https://example.com/a.png' });
  assert.equal(validateImageUrl('http://example.com/a.png').ok, true);
  for (const bad of ['', '   ', 'not a url', 'javascript:alert(1)', 'data:image/png;base64,AAAA', 'ftp://x/a.png',
    'file:///etc/passwd', 'https://user:pw@example.com/a.png', 'https://example.com/' + 'a'.repeat(3000)]) {
    assert.equal(validateImageUrl(bad).ok, false, bad);
  }
});

test('data URL validation: format whitelist and size cap', () => {
  assert.equal(isAllowedDataUrl(PNG), true);
  assert.equal(isAllowedDataUrl(WEBP), true);
  assert.equal(isAllowedDataUrl('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(isAllowedDataUrl('data:text/html;base64,PGgxPg=='), false);
  assert.equal(isAllowedDataUrl('data:image/png;base64,***'), false);
  assert.equal(isAllowedDataUrl('data:image/png;base64,' + 'A'.repeat(MAX_DATA_URL_LENGTH)), false);
});

test('save upload → persisted per character and survives a reload', () => {
  assert.equal(getCharacterImageSrc('045'), null);
  const r = setCharacterImage('045', { kind: 'upload', src: PNG });
  assert.equal(r.ok, true);
  assert.equal(getCharacterImageSrc('045'), PNG);
  assert.equal(getCharacterImageSrc('046'), null, 'other characters unaffected');
  // "Reload": parse what is actually in storage.
  const reloaded = parseCharacterImages(storage.getItem(CHARACTER_IMAGES_STORAGE_KEY));
  assert.equal(reloaded['045'].kind, 'upload');
  assert.equal(reloaded['045'].src, PNG);
});

test('replace and remove restore the emoji (null src)', () => {
  setCharacterImage('045', { kind: 'upload', src: PNG });
  setCharacterImage('045', { kind: 'url', src: 'https://example.com/b.png', cache: WEBP });
  assert.equal(getCharacterImage('045')?.kind, 'url');
  assert.equal(getCharacterImageSrc('045'), WEBP, 'CORS-safe cache preferred');
  setCharacterImage('045', { kind: 'url', src: 'https://example.com/c.png' });
  assert.equal(getCharacterImageSrc('045'), 'https://example.com/c.png', 'no cache → remote URL');
  assert.equal(removeCharacterImage('045').ok, true);
  assert.equal(getCharacterImageSrc('045'), null);
  assert.equal(storage.getItem(CHARACTER_IMAGES_STORAGE_KEY), null, 'empty map removes the key');
});

test('invalid input is rejected and never stored', () => {
  assert.equal(setCharacterImage('045', { kind: 'url', src: 'javascript:alert(1)' }).ok, false);
  assert.equal(setCharacterImage('045', { kind: 'upload', src: 'https://example.com/a.png' }).ok, false);
  assert.equal(setCharacterImage('../evil', { kind: 'upload', src: PNG }).ok, false);
  assert.equal(setCharacterImage('045', { kind: 'url', src: 'https://e.com/a.png', cache: 'data:text/html;base64,AA==' }).ok, false);
  assert.deepEqual(getCharacterImages(), {});
});

test('quota errors and the total budget keep the previous state', () => {
  setCharacterImage('001', { kind: 'upload', src: PNG });
  storage.quota = 10;
  const r = setCharacterImage('002', { kind: 'upload', src: PNG });
  assert.equal(r.ok, false);
  assert.equal(getCharacterImageSrc('002'), null);
  assert.equal(getCharacterImageSrc('001'), PNG);

  storage.quota = Infinity;
  const big = 'data:image/png;base64,' + 'A'.repeat(MAX_DATA_URL_LENGTH - 40);
  let saved = 0;
  for (let i = 0; i < Math.ceil(MAX_TOTAL_LENGTH / big.length) + 2; i++) {
    if (setCharacterImage(`b${i}`, { kind: 'upload', src: big }).ok) saved++;
  }
  assert.ok(saved < Math.ceil(MAX_TOTAL_LENGTH / big.length) + 2, 'budget stops further saves');
  assert.ok((storage.getItem(CHARACTER_IMAGES_STORAGE_KEY) ?? '').length <= MAX_TOTAL_LENGTH);
});

test('corrupted storage is ignored entry by entry', () => {
  assert.deepEqual(parseCharacterImages('not json'), {});
  assert.deepEqual(parseCharacterImages('{"images":5}'), {});
  const parsed = parseCharacterImages(JSON.stringify({ v: 1, images: {
    good: { kind: 'upload', src: PNG, updatedAt: 1 },
    badKind: { kind: 'ftp', src: PNG, updatedAt: 1 },
    badUrl: { kind: 'url', src: 'javascript:1', updatedAt: 1 },
    noTime: { kind: 'upload', src: PNG },
    'bad id!': { kind: 'upload', src: PNG, updatedAt: 1 },
  } }));
  assert.deepEqual(Object.keys(parsed), ['good']);
  assert.equal(displaySrc(null), null);
});

test('subscribers are notified on change and get a new snapshot', () => {
  let calls = 0;
  const unsub = subscribeCharacterImages(() => calls++);
  const before = getCharacterImages();
  setCharacterImage('045', { kind: 'upload', src: PNG });
  assert.equal(calls, 1);
  assert.notEqual(getCharacterImages(), before);
  assert.equal(getCharacterImages(), getCharacterImages(), 'stable between changes');
  removeCharacterImage('045');
  assert.equal(calls, 2);
  unsub();
  setCharacterImage('045', { kind: 'upload', src: PNG });
  assert.equal(calls, 2);
});
