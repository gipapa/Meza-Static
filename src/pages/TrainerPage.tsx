import { useState, useEffect } from 'react';
import { getTrainer, saveTrainer, getStats } from '../lib/storage';
import type { TrainerProfile, GameStats } from '../types';

const AVATARS = [
  '😎', '🧑‍🚀', '🦸', '🧙', '🐱‍👤', '🥷', '🤖', '👾',
  '🦊', '🐉', '🦅', '🐺', '🦁', '🐲', '🦄', '⭐',
  '🔥', '💧', '🌿', '⚡', '🌙', '☀️', '💎', '🪐',
  '🎮', '🎯', '🏆', '🎪', '🎭', '🃏', '🧊', '🌈',
  '👹', '👺', '👻', '🤡', '💀', '🎃', '🦇', '🕷️',
];

export default function TrainerPage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [stats, setStats] = useState<GameStats>({ totalBattles: 0, totalCatches: 0, starCount: 0, superstarCount: 0 });
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatarIdx, setAvatarIdx] = useState(0);

  useEffect(() => {
    const t = getTrainer();
    const s = getStats();
    setProfile(t);
    setStats(s);
    if (t) {
      setNickname(t.nickname);
      setAvatarIdx(t.avatarIndex);
    } else {
      setEditMode(true);
    }
  }, []);

  const save = () => {
    const p: TrainerProfile = {
      nickname: nickname.trim() || 'Trainer',
      avatarIndex: avatarIdx,
      createdAt: profile?.createdAt || new Date().toISOString(),
    };
    saveTrainer(p);
    setProfile(p);
    setEditMode(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-center mb-8 neon-text">TRAINER</h1>

      {editMode ? (
        <div className="bg-bg-card rounded-xl p-6 neon-border">
          <h2 className="font-display text-lg mb-4">
            {profile ? 'Edit Profile' : 'Create Your Trainer'}
          </h2>

          {/* Nickname */}
          <label className="block text-sm text-text-muted mb-1">Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={16}
            className="w-full px-3 py-2 bg-bg-dark border border-white/10 rounded-lg text-text-primary focus:border-primary focus:outline-none mb-4"
            placeholder="Enter nickname..."
          />

          {/* Avatar */}
          <label className="block text-sm text-text-muted mb-2">Choose Avatar</label>
          <div className="grid grid-cols-8 gap-2 mb-6">
            {AVATARS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setAvatarIdx(i)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                  avatarIdx === i
                    ? 'bg-primary/30 ring-2 ring-primary scale-110'
                    : 'bg-bg-dark hover:bg-bg-card-hover'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            onClick={save}
            className="w-full py-2 bg-primary hover:bg-primary-light text-white font-display rounded-lg transition-all"
          >
            SAVE
          </button>
        </div>
      ) : profile ? (
        <>
          {/* Profile card */}
          <div className="bg-bg-card rounded-xl p-6 neon-border text-center mb-8">
            <div className="text-6xl mb-3">{AVATARS[profile.avatarIndex] || '😎'}</div>
            <h2 className="font-display text-2xl mb-1">{profile.nickname}</h2>
            <p className="text-text-muted text-xs">
              Trainer since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-3 px-3 py-1 text-xs bg-bg-dark border border-white/10 rounded hover:bg-bg-card-hover text-text-muted"
            >
              ✏️ Edit
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Battles" value={stats.totalBattles} icon="⚔️" />
            <StatBox label="Total Catches" value={stats.totalCatches} icon="🎯" />
            <StatBox label="★5 Stars" value={stats.starCount} icon="⭐" />
            <StatBox label="★6 Superstars" value={stats.superstarCount} icon="🌟" />
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-bg-card rounded-xl p-4 text-center border border-white/5">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-display text-2xl text-primary-light">{value}</div>
      <div className="text-text-muted text-xs">{label}</div>
    </div>
  );
}
