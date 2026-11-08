#!/usr/bin/env node
/* Type-check + lint the skill templates against the current codebase.
 * Copies them into src/phaser/cinematic/ temporarily (removed afterwards).
 * Usage: node .claude/skills/advanced-move-animation/scripts/check-templates.mjs */
import { copyFileSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../../../..');
const T = join(here, '../templates');
const DIR = join(ROOT, 'src/phaser/cinematic');
const files = [
  [join(T, 'moveTimeline.ts.tmpl'), join(DIR, 'templateMoveTimeline.ts')],
  [join(T, 'MoveScene.ts.tmpl'), join(DIR, 'TemplateMoveScene.ts')],
];
let ok = true;
try {
  for (const [from, to] of files) copyFileSync(from, to);
  const run = (cmd, args) => {
    try { execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' }); console.log(`✔ ${cmd} ${args.join(' ')}`); }
    catch { ok = false; console.error(`✖ ${cmd} ${args.join(' ')}`); }
  };
  run('npx', ['tsc', '-p', 'tsconfig.app.json', '--noEmit']);
  run('npx', ['eslint', ...files.map(([, to]) => to)]);
  const { TEMPLATE_MOVE_TIMELINE } = await import(pathToFileURL(files[0][1]).href);
  if (TEMPLATE_MOVE_TIMELINE.totalMs === 60000) console.log('✔ template timeline is 60 s');
  else { ok = false; console.error(`✖ template timeline is ${TEMPLATE_MOVE_TIMELINE.totalMs}ms`); }
} catch (e) {
  ok = false;
  console.error('✖', e.message);
} finally {
  for (const [, to] of files) rmSync(to, { force: true });
}
process.exit(ok ? 0 : 1);
