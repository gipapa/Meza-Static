import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { Tag } from '../types';
import { addToCollection, incrementStat } from '../lib/storage';
import TagCard from '../components/TagCard';

interface CaughtInfo {
  tag: Tag;
  isNew: boolean;
  plusLevel: number;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { caughtTags: Tag[]; isCatchNow?: boolean } | null;
  const saved = useRef(false);
  const [caughtInfos, setCaughtInfos] = useState<CaughtInfo[]>([]);

  useEffect(() => {
    if (!state) {
      navigate('/play');
      return;
    }
    if (saved.current) return;
    saved.current = true;
    const infos: CaughtInfo[] = [];
    state.caughtTags.forEach(tag => {
      const result = addToCollection(tag);
      infos.push({ tag, ...result });
      if (tag.grade >= 6) incrementStat('superstarCount');
      else if (tag.grade >= 5) incrementStat('starCount');
    });
    setCaughtInfos(infos);
    incrementStat('totalBattles');
    incrementStat('totalCatches', state.caughtTags.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;

  const { caughtTags } = state;
  const hasSpecial = caughtTags.some(t => t.grade >= 5);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h1 className="font-display text-3xl mb-2 neon-text">結果</h1>

      {caughtTags.length === 0 ? (
        <div className="my-12">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-text-muted text-lg">這次沒有捕獲到怪獸...</p>
          <p className="text-text-muted text-sm mt-2">繼續加油 — 下次運氣會更好！</p>
        </div>
      ) : (
        <>
          {hasSpecial && (
            <div className="my-4">
              <div className="text-4xl mb-2">🌟✨🌟</div>
              <p className="font-display text-xl superstar-shimmer">★ 稀有捕獲 ★</p>
            </div>
          )}
          <p className="text-text-muted mb-6">
            你捕獲了 <span className="text-neon-cyan font-bold">{caughtTags.length}</span> 隻怪獸！
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {caughtTags.map((tag, i) => {
              const info = caughtInfos[i];
              return (
                <div key={i} className="catch-success text-center" style={{ animationDelay: `${i * 0.2}s` }}>
                  <TagCard tag={tag} size="lg" />
                  {info && !info.isNew && (
                    <div className="mt-1 text-xs font-display text-neon-cyan">
                      重複捕獲！ +{info.plusLevel}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Link
          to="/play"
          className="px-6 py-2 bg-accent hover:bg-accent-light text-white font-display rounded-lg transition-all"
        >
          🎮 再玩一次
        </Link>
        <Link
          to="/collection"
          className="px-6 py-2 bg-primary/20 border border-primary/40 text-primary-light font-display rounded-lg hover:bg-primary/30 transition-all"
        >
          📦 查看收藏
        </Link>
      </div>
    </div>
  );
}
