import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { addCoin, COINS_STORAGE_KEY, getWallet, localDateKey, parseWallet, saveWallet, spendCoin } from '../src/lib/coins.ts';
import { clearAll, exportCollection, importCollection } from '../src/lib/storage.ts';

const values = new Map<string, string>();
let failWrites = false;
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => {
    if (failWrites) throw new Error('QuotaExceededError');
    values.set(key, value);
  },
  removeItem: (key: string) => values.delete(key),
} });
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
  removeItem: (key: string) => values.delete(key),
} });
beforeEach(() => { values.clear(); failWrites = false; });

const dayOne = () => new Date(2026, 10, 11, 23, 59, 59);
const dayTwo = () => new Date(2026, 10, 12, 0, 0, 0);

test('first login grants three total and reloading never grants more that day', () => {
  assert.equal(getWallet(dayOne()).balance, 3);
  for (let i = 0; i < 5; i++) assert.equal(getWallet(dayOne()).balance, 3);
  assert.deepEqual(JSON.parse(values.get(COINS_STORAGE_KEY)!), { balance: 3, lastLoginDate: '2026-11-11' });
});

test('local midnight grants two exactly once and missed days do not accumulate rewards', () => {
  getWallet(dayOne());
  assert.equal(spendCoin(dayOne())?.balance, 2);
  assert.equal(getWallet(dayTwo()).balance, 4);
  assert.equal(getWallet(dayTwo()).balance, 4);
  assert.equal(JSON.parse(values.get(COINS_STORAGE_KEY)!).lastLoginDate, '2026-11-12');
  assert.equal(getWallet(new Date(2026, 10, 18)).balance, 6);
  assert.equal(getWallet(new Date(2026, 10, 18)).balance, 6);
});

test('clock rollback cannot repeatedly award daily coins', () => {
  getWallet(dayTwo());
  assert.equal(getWallet(dayOne()).balance, 3);
  assert.equal(getWallet(dayTwo()).balance, 3);
});

test('each game or bonus costs one, insufficient funds never become negative, mom gives one per click', () => {
  assert.equal(spendCoin(dayOne())?.balance, 2);
  assert.equal(spendCoin(dayOne())?.balance, 1);
  assert.equal(spendCoin(dayOne())?.balance, 0);
  assert.equal(spendCoin(dayOne()), null);
  assert.equal(getWallet(dayOne()).balance, 0);
  assert.equal(addCoin(dayOne()).balance, 1);
  assert.equal(addCoin(dayOne()).balance, 2);
  assert.equal(getWallet(dayOne()).balance, 2);
});

test('invalid stored wallets reset safely and local date keys keep calendar components', () => {
  for (const invalid of ['null', '[]', '{}', 'broken', '{"balance":-1,"lastLoginDate":"2026-11-11"}',
    '{"balance":0.5,"lastLoginDate":"2026-11-11"}', '{"balance":2,"lastLoginDate":"2026-02-30"}']) {
    assert.equal(parseWallet(invalid), null);
    values.set(COINS_STORAGE_KEY, invalid);
    assert.equal(getWallet(dayOne()).balance, 3);
  }
  assert.equal(localDateKey(new Date(2026, 0, 2, 0, 1)), '2026-01-02');
});

test('failed payment persistence throws and leaves the saved balance intact', () => {
  getWallet(dayOne());
  failWrites = true;
  assert.throws(() => spendCoin(dayOne()));
  assert.equal(JSON.parse(values.get(COINS_STORAGE_KEY)!).balance, 3);
});

test('backup round trips coins, old backups preserve coins, and invalid wallets are rejected', () => {
  const today = localDateKey();
  saveWallet({ balance: 7, lastLoginDate: today });
  const backup = exportCollection();
  addCoin();
  assert.equal(importCollection(backup), true);
  assert.deepEqual(getWallet(), { balance: 7, lastLoginDate: today });
  assert.equal(importCollection('{"collection":[]}'), true);
  assert.equal(getWallet().balance, 7);
  assert.equal(importCollection('{"coins":{"balance":-1}}'), false);
  assert.equal(getWallet().balance, 7);
});

test('clearing all data resets both wallet and paid game access', () => {
  saveWallet({ balance: 15, lastLoginDate: localDateKey() });
  values.set('meza_active_game', 'paid-round');
  clearAll();
  assert.equal(values.has(COINS_STORAGE_KEY), false);
  assert.equal(values.has('meza_active_game'), false);
  assert.equal(getWallet().balance, 3);
});
