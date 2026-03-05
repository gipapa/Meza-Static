import { useState, useEffect, useCallback } from 'react';

const KEY = 'meza_names_revealed';

/**
 * 將怪獸名稱加密：保留首尾字元，中間替換為 O
 * 小火龍 → 小O龍, 妙蛙種子 → 妙OO子, 超夢 → 超O
 */
export function maskName(name: string): string {
  if (name.length <= 1) return 'O';
  if (name.length === 2) return name[0] + 'O';
  return name[0] + 'O'.repeat(name.length - 2) + name[name.length - 1];
}

export function isNamesRevealed(): boolean {
  try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
}

export function revealNames(): void {
  localStorage.setItem(KEY, 'true');
  window.dispatchEvent(new Event('meza-names-revealed'));
}

/**
 * React hook：回傳 { revealed, reveal, dn }
 * - revealed: 是否已解鎖
 * - reveal(): 解鎖名稱
 * - dn(name): 根據狀態回傳原名或加密名
 */
export function useNameReveal() {
  const [revealed, setRevealed] = useState(isNamesRevealed);

  useEffect(() => {
    const handler = () => setRevealed(true);
    window.addEventListener('meza-names-revealed', handler);
    return () => window.removeEventListener('meza-names-revealed', handler);
  }, []);

  const reveal = useCallback(() => { revealNames(); }, []);
  const dn = useCallback((name: string) => revealed ? name : maskName(name), [revealed]);

  return { revealed, reveal, dn };
}
