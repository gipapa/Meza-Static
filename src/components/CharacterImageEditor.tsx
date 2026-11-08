import { useEffect, useRef, useState } from 'react';
import type { Tag } from '../types';
import CharacterArt from './CharacterArt';
import { characterIdOf, removeCharacterImage, setCharacterImage, validateImageUrl } from '../lib/characterImages';
import { useCharacterImage } from '../lib/useCharacterImages';
import { clearBrokenSrc } from '../lib/characterArt';
import { ImageError, probeImageUrl, processImageFile } from '../lib/imageProcessing';
import { useNameReveal } from '../lib/nameMask';

type Status = { tone: 'info' | 'ok' | 'warn' | 'error'; text: string } | null;

const TONE: Record<NonNullable<Status>['tone'], string> = {
  info: 'text-text-muted',
  ok: 'text-neon-green',
  warn: 'text-gold',
  error: 'text-red-400',
};

/**
 * Upload / link / remove the custom image of a character (species).
 * Saved per character id in localStorage; every monster view (cards, battle,
 * catch, animations) picks it up and falls back to the type emoji.
 */
export default function CharacterImageEditor({ tag }: { tag: Tag }) {
  const id = characterIdOf(tag);
  const { entry } = useCharacterImage(id);
  const { dn } = useNameReveal();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(entry?.kind === 'url' ? entry.src : '');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const safeStatus = (s: Status) => { if (alive.current) setStatus(s); };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file || busy) return;
    setBusy(true);
    setStatus({ tone: 'info', text: '處理圖片中…' });
    try {
      const dataUrl = await processImageFile(file);
      const r = setCharacterImage(id, { kind: 'upload', src: dataUrl });
      safeStatus(r.ok
        ? { tone: 'ok', text: `已套用上傳圖片（壓縮後約 ${Math.round(dataUrl.length * 0.75 / 1024)} KB）` }
        : { tone: 'error', text: r.error });
    } catch (err) {
      safeStatus({ tone: 'error', text: err instanceof ImageError ? err.message : '無法處理這張圖片' });
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const onApplyUrl = async () => {
    if (busy) return;
    const v = validateImageUrl(url);
    if (!v.ok) { setStatus({ tone: 'error', text: v.error }); return; }
    setBusy(true);
    setStatus({ tone: 'info', text: '讀取圖片中…' });
    try {
      const probe = await probeImageUrl(v.url);
      if (!probe.loaded) {
        safeStatus({ tone: 'error', text: '無法載入這個網址的圖片，請確認網址是圖片且可公開存取' });
        return;
      }
      clearBrokenSrc(v.url);
      const r = setCharacterImage(id, { kind: 'url', src: v.url, cache: probe.cache });
      if (!r.ok) safeStatus({ tone: 'error', text: r.error });
      else if (probe.cache) safeStatus({ tone: 'ok', text: '已套用網址圖片（已存一份縮圖，動畫也會使用）' });
      else safeStatus({ tone: 'warn', text: '已套用網址圖片；但該網站不允許動畫取用，戰鬥／捕獲動畫中會顯示屬性 emoji' });
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const onRemove = () => {
    const r = removeCharacterImage(id);
    setUrl('');
    setStatus(r.ok ? { tone: 'ok', text: '已移除，恢復顯示屬性 emoji' } : { tone: 'error', text: r.error });
  };

  return (
    <section className="mt-8 rounded-2xl bg-bg-card border border-white/10 p-4 text-left" data-testid="character-image-editor">
      <h3 className="font-display text-lg mb-1">🖼️ 角色圖片</h3>
      <p className="text-xs text-text-muted mb-4">
        依角色 #{id}（{dn(tag.name)}）保存在這台裝置，卡牌、戰鬥、捕獲與攻擊動畫都會使用；同種的野生怪獸也會套用。未設定或圖片失效時顯示屬性 emoji。
      </p>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 shrink-0 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center">
          <CharacterArt tag={tag} className="text-5xl" scale={1.4} />
        </div>
        <div className="text-sm min-w-0">
          <div className="text-text-muted text-xs">目前顯示</div>
          <div data-testid="character-image-kind">
            {!entry ? '屬性 emoji（預設）' : entry.kind === 'upload' ? '上傳的圖片' : '網址圖片'}
          </div>
          {entry?.kind === 'url' && <div className="text-[11px] text-text-muted truncate">{entry.src}</div>}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={onFile}
        data-testid="character-image-file"
      />
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="min-h-11 px-4 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-display disabled:opacity-40"
        >
          📁 {entry ? '更換圖片' : '上傳圖片'}
        </button>
        {entry && (
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            className="min-h-11 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-40"
            data-testid="character-image-remove"
          >
            ↺ 移除圖片
          </button>
        )}
      </div>

      <form
        className="flex gap-2"
        onSubmit={e => { e.preventDefault(); void onApplyUrl(); }}
      >
        <input
          type="url"
          inputMode="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://… 圖片網址"
          className="flex-1 min-w-0 min-h-11 px-3 rounded-lg bg-black/30 border border-white/15 text-base sm:text-sm"
          data-testid="character-image-url"
        />
        <button
          type="submit"
          disabled={busy || !url.trim()}
          className="min-h-11 px-4 rounded-lg bg-accent hover:bg-accent-light text-white text-sm font-display disabled:opacity-40 shrink-0"
        >
          套用
        </button>
      </form>

      <p className="text-[11px] text-text-muted mt-2">支援 PNG／JPEG／WebP／GIF（取第一格），上傳後自動縮小到 384px 以內。</p>
      <p role="status" aria-live="polite" className={`text-sm mt-2 min-h-5 ${status ? TONE[status.tone] : ''}`} data-testid="character-image-status">
        {status?.text}
      </p>
    </section>
  );
}
