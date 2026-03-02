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
      setImportStatus(ok ? '✅ Import successful! Refresh to see changes.' : '❌ Import failed — invalid JSON.');
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
      <h1 className="font-display text-3xl text-center mb-8 neon-text">SETTINGS</h1>

      <div className="space-y-6">
        {/* Export */}
        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-2">📤 Export Collection</h2>
          <p className="text-text-muted text-xs mb-3">Download your collection, trainer profile, and stats as a JSON file.</p>
          <button onClick={handleExport} className="px-4 py-1.5 bg-primary/20 text-primary-light rounded text-sm hover:bg-primary/30 font-display">
            Download JSON
          </button>
        </div>

        {/* Import */}
        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-2">📥 Import Collection</h2>
          <p className="text-text-muted text-xs mb-3">Upload a previously exported JSON file to restore your data.</p>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-1.5 bg-primary/20 text-primary-light rounded text-sm hover:bg-primary/30 font-display"
          >
            Upload JSON
          </button>
          {importStatus && <p className="text-xs mt-2">{importStatus}</p>}
        </div>

        {/* Danger Zone */}
        <div className="bg-bg-card rounded-xl p-5 border border-accent/20">
          <h2 className="font-display text-sm mb-2 text-accent">⚠️ Danger Zone</h2>
          <p className="text-text-muted text-xs mb-3">Clear all local data including collection, trainer profile, and stats. This cannot be undone.</p>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-1.5 bg-accent/20 text-accent rounded text-sm hover:bg-accent/30 font-display"
            >
              Clear All Data
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleClear} className="px-4 py-1.5 bg-accent text-white rounded text-sm font-display">
                Confirm Delete
              </button>
              <button onClick={() => setShowConfirm(false)} className="px-4 py-1.5 bg-bg-dark text-text-muted rounded text-sm">
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* About */}
        <div className="bg-bg-card rounded-xl p-5 border border-white/5">
          <h2 className="font-display text-sm mb-2">ℹ️ About</h2>
          <p className="text-text-muted text-xs leading-relaxed">
            <strong>MEZA★STATIC</strong> is a fan-made static web application inspired by arcade tag-battle games.
            This project is <strong>not affiliated</strong> with Nintendo, The Pokémon Company, or Takara Tomy Arts.
            All monster data, names, and artwork are original creations.
            No commercial use. Built for educational and entertainment purposes only.
          </p>
          <p className="text-text-muted text-xs mt-2">
            Tech: React + TypeScript + Tailwind CSS + Vite
          </p>
        </div>
      </div>
    </div>
  );
}
