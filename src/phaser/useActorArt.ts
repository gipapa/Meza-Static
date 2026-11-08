import { useEffect, useState } from 'react';
import { getCharacterImageSrc } from '../lib/characterImages';
import { loadArtBitmap, peekArtBitmap } from '../lib/imageProcessing';

export interface ResolvedArt {
  art: HTMLCanvasElement | null;
  artKey?: string;
}

/** How long an overlay may wait for art before starting with emoji. */
export const ART_WAIT_MS = 1200;

function resolveNow(ids: readonly (string | null | undefined)[]): { done: boolean; arts: ResolvedArt[]; pending: { i: number; src: string }[] } {
  const arts: ResolvedArt[] = [];
  const pending: { i: number; src: string }[] = [];
  ids.forEach((id, i) => {
    const src = getCharacterImageSrc(id);
    if (!id || !src) { arts.push({ art: null }); return; }
    const hit = peekArtBitmap(src);
    if (hit === undefined) pending.push({ i, src });
    arts.push({ art: hit ?? null, artKey: hit ? `char:${id}` : undefined });
  });
  return { done: pending.length === 0, arts, pending };
}

/** Start decoding art for these characters (e.g. when a battle page mounts). */
export function preloadCharacterArt(ids: readonly (string | null | undefined)[]): void {
  for (const id of ids) {
    const src = getCharacterImageSrc(id);
    if (src) void loadArtBitmap(src);
  }
}

/**
 * Resolve Phaser art for a fixed list of character ids, snapshotted at mount
 * (the order is preserved, so callers keep enemy/ally slots explicit).
 * `ready` turns true once every image has loaded or failed, or after
 * ART_WAIT_MS — whichever comes first — so a slow or blocked remote image can
 * never hold up the game; unresolved slots fall back to the emoji.
 */
export function useActorArt(ids: readonly (string | null | undefined)[]): { ready: boolean; arts: ResolvedArt[] } {
  const [state, setState] = useState(() => {
    const r = resolveNow(ids);
    return { ready: r.done, arts: r.arts, ids: [...ids] };
  });

  useEffect(() => {
    if (state.ready) return;
    let cancelled = false;
    const snapshot = state.ids;
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      const r = resolveNow(snapshot);
      setState({ ready: true, arts: r.arts, ids: snapshot });
    };
    const timer = window.setTimeout(finish, ART_WAIT_MS);
    const srcs = snapshot.map(id => getCharacterImageSrc(id)).filter((s): s is string => !!s);
    void Promise.all(srcs.map(loadArtBitmap)).then(finish);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ready: state.ready, arts: state.arts };
}
