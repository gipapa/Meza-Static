import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable full-screen overlay with a centered card frame.
 * Used by CatchAnimation, BattleOverlayAnimation, etc.
 */
export default function AnimationOverlay({ children, className }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative rounded-2xl bg-bg-card border border-white/10 shadow-2xl flex flex-col items-center justify-center overflow-hidden ${className ?? 'w-72 h-80'}`}
      >
        {children}
      </div>
    </div>
  );
}
