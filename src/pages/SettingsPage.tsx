import { useState, useRef } from 'react';
import { exportCollection, importCollection, clearAll } from '../lib/storage';

export default function SettingsPage() {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        {/* Export */}
        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-2">📤 匯出收藏</h2>
          <p className="text-text-muted text-xs mb-3">將你的收藏、訓練家檔案和統計數據下載為 JSON 檔案。</p>
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
          <p className="text-text-muted text-xs mb-3">清除所有本地資料，包括收藏、訓練家檔案和統計數據。此操作無法復原。</p>
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
            技術架構: React + TypeScript + Tailwind CSS + Vite
          </p>
        </div>
      </div>
    </div>
  );
}
