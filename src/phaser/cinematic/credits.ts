import type { CinematicId } from './timelines.ts';

export interface AnimationCredit {
  createdBy: string;
  revisedBy?: readonly string[];
  evidence: string;
}

/** AI attribution is explicit provenance, never inferred from a Git user's name. */
export const ANIMATION_CREDITS: Readonly<Record<CinematicId, AnimationCredit>> = {
  'petal-dance': { createdBy: 'Claude Code', evidence: '使用者於本次對話確認；原始提交 62bf062。' },
  'solar-beam': { createdBy: 'Claude Code', evidence: '使用者於本次對話確認；原始提交 dffab68。' },
  outrage: { createdBy: 'Codex', revisedBy: ['Codex'], evidence: '本對話實作與光影粒子重製；原始提交 56319b7。' },
};
