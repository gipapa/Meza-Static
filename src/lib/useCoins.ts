import { createContext, useContext } from 'react';

export interface CoinsContextValue {
  balance: number;
  activeGameId: string | null;
  insertCoin: (onComplete: () => void) => void;
  startGame: (onComplete: (gameId: string) => void) => void;
  finishGame: () => void;
  requestMomCoin: () => boolean;
}

export const CoinsContext = createContext<CoinsContextValue | null>(null);

export function useCoins(): CoinsContextValue {
  const context = useContext(CoinsContext);
  if (!context) throw new Error('useCoins requires CoinProvider');
  return context;
}
