export const COINS_STORAGE_KEY = 'meza_coins';
export const COINS_CHANGED_EVENT = 'meza:coins-changed';
export const INITIAL_COINS = 3;
export const DAILY_COINS = 2;

export interface CoinWallet {
  balance: number;
  lastLoginDate: string;
}

/** Login rewards follow the player's local calendar, rather than UTC. */
export function localDateKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function parseWallet(raw: string | null): CoinWallet | null {
  try {
    const data = JSON.parse(raw ?? 'null');
    if (!data || !Number.isSafeInteger(data.balance) || data.balance < 0
      || typeof data.lastLoginDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.lastLoginDate)
      || new Date(`${data.lastLoginDate}T12:00:00`).toString() === 'Invalid Date'
      || localDateKey(new Date(`${data.lastLoginDate}T12:00:00`)) !== data.lastLoginDate) return null;
    return { balance: data.balance, lastLoginDate: data.lastLoginDate };
  } catch { return null; }
}

export function saveWallet(wallet: CoinWallet): void {
  if (!parseWallet(JSON.stringify(wallet))) throw new Error('Invalid coin wallet');
  localStorage.setItem(COINS_STORAGE_KEY, JSON.stringify(wallet));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(COINS_CHANGED_EVENT));
}

/** New players receive three total; later login days receive two, with no backfill. */
export function getWallet(now = new Date()): CoinWallet {
  const today = localDateKey(now);
  const stored = parseWallet(localStorage.getItem(COINS_STORAGE_KEY));
  const wallet = stored ? { ...stored } : { balance: INITIAL_COINS, lastLoginDate: today };
  if (wallet.lastLoginDate < today) {
    wallet.balance += DAILY_COINS;
    wallet.lastLoginDate = today;
  }
  if (!stored || stored.lastLoginDate !== wallet.lastLoginDate) saveWallet(wallet);
  return wallet;
}

export function addCoin(now = new Date()): CoinWallet {
  const wallet = getWallet(now);
  const updated = { ...wallet, balance: wallet.balance + 1 };
  saveWallet(updated);
  return updated;
}

export function spendCoin(now = new Date()): CoinWallet | null {
  const wallet = getWallet(now);
  if (wallet.balance < 1) return null;
  const updated = { ...wallet, balance: wallet.balance - 1 };
  saveWallet(updated);
  return updated;
}
