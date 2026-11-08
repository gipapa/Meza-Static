import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALL_MOVES, groupMovesByType } from '../src/data/moves.ts';
import { TYPE_NAMES_ZH } from '../src/data/monsters.ts';
import { ADVANCED_MOVE_ANIMATIONS } from '../src/phaser/cinematic/moveAnimations.ts';
import { ANIMATION_CREDITS } from '../src/phaser/cinematic/credits.ts';

const root = new URL('../', import.meta.url);
const file = new URL('docs/move-animation-status.md', root);
const completed = ALL_MOVES.filter(move => Object.hasOwn(ADVANCED_MOVE_ANIMATIONS, move.name)).length;
const lines = [
  '# 全招式進階動畫清單', '',
  `共 ${ALL_MOVES.length} 招；已實作並通過技術驗證 ${completed} 招，未製作 ${ALL_MOVES.length - completed} 招。視覺品質仍由使用者審閱。`, '',
  '「AI 製作者」指進階動畫的實作者；未製作的招式不分配 AI 作者。花瓣舞、日光束由使用者確認為 Claude Code；逆鱗由本次 Codex 對話實作與重製。Git 使用者名稱不作為 AI 歸屬證據。', '',
  '來源：`src/data/moves.ts`、`moveAnimations.ts`、`credits.ts`。更新：`npm run moves:status`；檢查是否同步：`npm run moves:status -- --check`。', '',
  '| 屬性 | 招式 | 進階動畫 | AI 製作者 | 重製／修訂 | Cinematic ID |',
  '|---|---|---|---|---|---|',
];
for (const { type, moves } of groupMovesByType(ALL_MOVES)) {
  for (const move of moves) {
    const id = Object.hasOwn(ADVANCED_MOVE_ANIMATIONS, move.name) ? ADVANCED_MOVE_ANIMATIONS[move.name] : null;
    const credit = id ? ANIMATION_CREDITS[id] : null;
    if (id && !credit) throw new Error(`Missing animation credit: ${id}`);
    lines.push(`| ${TYPE_NAMES_ZH[type] ?? type} | ${move.name} | ${id ? '已完成' : '未製作（簡易版）'} | ${credit?.createdBy ?? '—'} | ${credit?.revisedBy?.join('、') ?? '—'} | ${id ? `\`${id}\`` : '—'} |`);
  }
}
lines.push('', '## 製作歸屬依據', '');
for (const [id, credit] of Object.entries(ANIMATION_CREDITS)) lines.push(`- \`${id}\`：${credit.evidence}`);
const output = lines.join('\n') + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(file, 'utf8') !== output) throw new Error('招式清單已過期，請執行 npm run moves:status。');
  console.log(`✔ ${ALL_MOVES.length} moves, ${completed} advanced animations; catalog is current.`);
} else {
  mkdirSync(new URL('docs/', root), { recursive: true });
  writeFileSync(file, output);
  console.log(`Updated ${fileURLToPath(file)}`);
}
