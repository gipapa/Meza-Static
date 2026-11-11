import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCoins } from '../lib/useCoins';

/** A paid round covers both battle and its main catch, until the results screen. */
export default function PaidGame({ children }: { children: ReactNode }) {
  const { activeGameId } = useCoins();
  const { state } = useLocation();
  if (!activeGameId || state?.gameId !== activeGameId) return <Navigate to="/play" replace />;
  return children;
}
