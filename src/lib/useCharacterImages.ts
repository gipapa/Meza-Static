import { useSyncExternalStore } from 'react';
import { displaySrc, getCharacterImages, subscribeCharacterImages } from './characterImages';
import type { CharacterImageEntry, CharacterImageMap } from './characterImages';

/** All custom character images (re-renders on change, incl. other tabs). */
export function useCharacterImages(): CharacterImageMap {
  return useSyncExternalStore(subscribeCharacterImages, getCharacterImages, getCharacterImages);
}

export function useCharacterImage(id: string | null | undefined): { entry: CharacterImageEntry | null; src: string | null } {
  const map = useCharacterImages();
  const entry = id ? map[id] ?? null : null;
  return { entry, src: displaySrc(entry) };
}
