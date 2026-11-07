import { useSyncExternalStore } from 'react';
import { getSettings, subscribeSettings } from './settings';
import type { GameSettings } from './settings';

/** React binding for lib/settings — re-renders when settings change. */
export function useSettings(): GameSettings {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings);
}
