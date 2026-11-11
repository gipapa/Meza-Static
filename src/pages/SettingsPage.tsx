import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toggleMute, isMuted } from '../lib/bgm';
import { exportCollection, importCollection, clearAll } from '../lib/storage';
import { updateSettings } from '../lib/settings';
import type { AnimationQuality } from '../lib/settings';
import { useSettings } from '../lib/useSettings';
import { useCoins } from '../lib/useCoins';

const QUALITY_OPTIONS: { value: AnimationQuality; label: string; desc: string }[] = [
  { value: 'simple', label: '簡易', desc: '約 3 秒的短動畫，對戰節奏快。' },
  { value: 'advanced', label: '進階', desc: '招式專屬的長演出（cut-in、蓄力、鏡頭運鏡），可隨時跳過。' },
];

export default function SettingsPage() {
  const [muted, setMuted] = useState(isMuted);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { animationQuality } = useSettings();
  const { balance, requestMomCoin } = useCoins();
  const [momCoins, setMomCoins] = useState(0);

  const handleExport = () => {
    const data = exportCollection();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meza-collection-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importCollection(reader.result as string);
      setImportStatus(ok ? '✅ 匯入成功！重新整理頁面以查看變更。' : '❌ 匯入失敗 — JSON 格式無效。');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    clearAll();
    setShowConfirm(false);
    window.location.reload();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-center mb-8 neon-text">設定</h1>

      <div className="space-y-6">
        <nav aria-label="訓練家與遊戲說明" className="grid grid-cols-2 gap-3">
          <Link to="/trainer" className="min-h-11 flex items-center justify-center gap-2 rounded-xl p-4 bg-bg-card border border-white/10 text-sm hover:bg-bg-card-hover">
            👤 訓練家
          </Link>
          <Link to="/howto" className="min-h-11 flex items-center justify-center gap-2 rounded-xl p-4 bg-bg-card border border-white/10 text-sm hover:bg-bg-card-hover">
            📖 遊戲說明
          </Link>
        </nav>

        <div className="bg-bg-card rounded-xl p-5 border border-gold/25">
          <h2 className="font-display text-sm mb-2 text-gold">🪙 遊戲硬幣 · {balance} 枚</h2>
          <p className="text-text-muted text-xs mb-3">初始 3 枚；之後每日首次登入領 2 枚。每次遊玩、草叢額外捕獲各需 1 枚。</p>
          <button type="button" onClick={() => {
            if (requestMomCoin()) setMomCoins(count => count + 1);
          }} className="min-h-11 w-full px-4 py-2 rounded-lg bg-gold text-bg-dark font-display text-sm hover:brightness-110">
            媽媽砸摳 · +1 枚
          </button>
          <p role="status" className="text-xs mt-2 text-gold">{momCoins > 0 ? `媽媽給你硬幣了！本次已拿 ${momCoins} 枚 🪙` : '想再玩一次？每按一次就能拿 1 枚！'}</p>
        </div>

        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-3">🔊 音量</h2>
          <button
            type="button"
            aria-label="靜音"
            aria-pressed={muted}
            onClick={() => setMuted(toggleMute())}
            className="min-h-11 w-full px-4 py-2 rounded-lg border border-white/10 bg-bg-dark text-sm hover:bg-bg-card-hover"
          >
            {muted ? '🔇 已靜音，點擊開啟聲音' : '🔊 聲音已開啟，點擊靜音'}
          </button>
        </div>

        {/* Attack animation quality */}
        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-2">🎬 攻擊動畫</h2>
          <div role="radiogroup" aria-label="攻擊動畫" className="grid grid-cols-2 gap-2 mb-3">
            {QUALITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={animationQuality === opt.value}
                data-quality={opt.value}
                onClick={() => updateSettings({ animationQuality: opt.value })}
                className={`min-h-11 px-3 py-2 rounded-lg text-left border transition-all ${
                  animationQuality === opt.value
                    ? 'border-neon-cyan bg-primary/20 neon-border-cyan'
                    : 'border-white/10 bg-bg-dark hover:bg-bg-card-hover'
                }`}
              >
                <div className="font-display text-sm">{opt.label}{opt.value === 'simple' && <span className="text-text-muted text-xs">（預設）</span>}</div>
                <div className="text-text-muted text-[11px] leading-snug mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
          <p className="text-text-muted text-xs">
            支援的招式會播放專屬演出，其餘使用簡易動畫。
          </p>
        </div>

        {/* Export */}
        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-2">📤 匯出收藏</h2>
          <p className="text-text-muted text-xs mb-3">將你的收藏、訓練家檔案、統計數據和硬幣下載為 JSON 檔案。</p>
          <button onClick={handleExport} className="px-4 py-1.5 bg-primary/20 text-primary-light rounded text-sm hover:bg-primary/30 font-display">
            下載 JSON
          </button>
        </div>

        {/* Import */}
        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-2">📥 匯入收藏</h2>
          <p className="text-text-muted text-xs mb-3">上傳之前匯出的 JSON 檔案來恢復你的資料。</p>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-1.5 bg-primary/20 text-primary-light rounded text-sm hover:bg-primary/30 font-display"
          >
            上傳 JSON
          </button>
          {importStatus && <p className="text-xs mt-2">{importStatus}</p>}
        </div>

        {/* Danger Zone */}
        <div className="bg-bg-card rounded-xl p-5 border border-accent/20">
          <h2 className="font-display text-sm mb-2 text-accent">⚠️ 危險區域</h2>
          <p className="text-text-muted text-xs mb-3">清除所有本地資料，包括收藏、訓練家檔案、統計數據和硬幣。此操作無法復原。</p>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-1.5 bg-accent/20 text-accent rounded text-sm hover:bg-accent/30 font-display"
            >
              清除所有資料
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleClear} className="px-4 py-1.5 bg-accent text-white rounded text-sm font-display">
              確認刪除
              </button>
              <button onClick={() => setShowConfirm(false)} className="px-4 py-1.5 bg-bg-dark text-text-muted rounded text-sm">
                取消
              </button>
            </div>
          )}
        </div>

        {/* About */}
        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-2">ℹ️ 關於</h2>
          <p className="text-text-muted text-xs leading-relaxed">
            <strong>MEZA★STATIC</strong> 是一個受機台卡牌對戰遊戲啟發的粉絲自製靜態網頁應用。
            本專案<strong>與任天堂、株式會社寶可夢或 TAKARA TOMY Arts 無任何關聯</strong>。
            所有怪獸資料、名稱和美術素材均為原創作品。
            無商業用途。僅供教育和娛樂用途。
          </p>
          <p className="text-text-muted text-xs mt-2">
            技術架構: React + TypeScript + Tailwind CSS + Vite + Phaser
          </p>
        </div>
      </div>
    </div>
  );
}
