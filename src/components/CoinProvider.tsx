import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { addCoin, COINS_CHANGED_EVENT, COINS_STORAGE_KEY, getWallet, spendCoin } from '../lib/coins';
import { CoinsContext } from '../lib/useCoins';
import StepDialog from './StepDialog';

const ACTIVE_GAME_KEY = 'meza_active_game';

function readActiveGame(): string | null {
  try { return sessionStorage.getItem(ACTIVE_GAME_KEY); } catch { return null; }
}

export default function CoinProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(() => {
    try { return getWallet().balance; } catch { return 0; }
  });
  const [activeGameId, setActiveGameId] = useState(readActiveGame);
  const [payment, setPayment] = useState<{ onComplete: () => void } | null>(null);
  const [error, setError] = useState<'empty' | 'storage' | null>(null);
  const busy = useRef(false);

  // Refresh on return to the app and across midnight, including other tabs.
  useEffect(() => {
    const refresh = () => {
      try { setBalance(getWallet().balance); } catch { /* Keep the last known balance. */ }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === COINS_STORAGE_KEY || event.key === null) refresh();
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);
    window.addEventListener(COINS_CHANGED_EVENT, refresh);
    document.addEventListener('visibilitychange', refresh);
    const interval = window.setInterval(refresh, 30_000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(COINS_CHANGED_EVENT, refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!payment) return;
    const timer = window.setTimeout(() => {
      setPayment(null);
      busy.current = false;
      payment.onComplete();
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [payment]);

  const insertCoin = (onComplete: () => void) => {
    if (busy.current) return;
    busy.current = true;
    try {
      const wallet = spendCoin();
      if (!wallet) {
        setBalance(0);
        setError('empty');
        busy.current = false;
        return;
      }
      setBalance(wallet.balance);
      setPayment({ onComplete });
    } catch {
      setError('storage');
      busy.current = false;
    }
  };

  const startGame = (onComplete: (gameId: string) => void) => {
    insertCoin(() => {
      const id = crypto.randomUUID();
      try { sessionStorage.setItem(ACTIVE_GAME_KEY, id); } catch { /* In-memory play still works. */ }
      setActiveGameId(id);
      onComplete(id);
    });
  };

  const finishGame = () => {
    try { sessionStorage.removeItem(ACTIVE_GAME_KEY); } catch { /* Clear in memory as well. */ }
    setActiveGameId(null);
  };

  const requestMomCoin = () => {
    try {
      setBalance(addCoin().balance);
      return true;
    } catch {
      setError('storage');
      return false;
    }
  };

  return (
    <CoinsContext.Provider value={{ balance, activeGameId, insertCoin, startGame, finishGame, requestMomCoin }}>
      {children}
      {payment && (
        <StepDialog title="INSERT COIN">
          <div className="coin-insert-animation" aria-hidden="true">
            <div className="coin-insert-token">★</div>
            <div className="coin-insert-slot" />
            <div className="coin-insert-flash">CREDIT +1</div>
          </div>
          <p role="status" className="text-center text-gold font-display">投幣中 · 1 枚</p>
          <p className="text-center text-xs text-text-muted mt-2">剩餘 {balance} 枚硬幣</p>
        </StepDialog>
      )}
      {error && (
        <StepDialog title={error === 'empty' ? '🪙 硬幣不足' : '無法儲存硬幣'}>
          <p className="text-center text-sm text-text-muted mb-5">
            {error === 'empty'
              ? '每次遊玩或草叢額外捕獲需要 1 枚。找媽媽砸摳補 1 枚，或明天登入領取 2 枚！'
              : '請確認瀏覽器允許儲存本機資料，再試一次。'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setError(null)} className="min-h-11 px-4 rounded-lg border border-white/20">返回</button>
            {error === 'empty' && (
              <button type="button" onClick={() => {
                if (requestMomCoin()) setError(null);
              }} className="min-h-11 px-4 rounded-lg bg-gold text-bg-dark font-display">媽媽砸摳 · +1 枚</button>
            )}
          </div>
        </StepDialog>
      )}
    </CoinsContext.Provider>
  );
}
