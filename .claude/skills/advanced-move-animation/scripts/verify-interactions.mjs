#!/usr/bin/env node
/**
 * Verify skip at all seven phases, cancellation, once-only completion and
 * settings changes while an overlay is mounted. Never captures screenshots.
 * Run with the dev server active:
 * node .claude/skills/advanced-move-animation/scripts/verify-interactions.mjs
 *   [--move 大字爆炎] [--base http://localhost:5173/Meza-Static/] [--out cinematic-check]
 * Needs Chrome (CHROME may override its path) and Node >=22.6.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), !arr[i + 1] || arr[i + 1].startsWith('--') ? 'true' : arr[i + 1]]);
  return acc;
}, []));
const ART_MODES = ['emoji'];
const BASE = (args.base || 'http://localhost:5173/Meza-Static/').replace(/\/?$/, '/');
const OUT = resolve(args.out || 'cinematic-check');
const SIDES = ['ally'];
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9300 + Math.floor(Math.random() * 500);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const src = p => pathToFileURL(join(ROOT, 'src/phaser/cinematic', p)).href;
const { ADVANCED_MOVE_ANIMATIONS } = await import(src('moveAnimations.ts'));
const { CINEMATIC_TIMELINES } = await import(src('timelines.ts'));
const { validateAdvancedTimeline } = await import(src('spec.ts'));

const selected = [args.move || '大字爆炎'];
for (const move of selected) {
  const id = ADVANCED_MOVE_ANIMATIONS[move];
  if (!id) throw new Error(`${move} has no advanced animation`);
  const errors = validateAdvancedTimeline(CINEMATIC_TIMELINES[id]);
  if (errors.length) throw new Error(`${id}: ${errors.join('; ')}`);
}
mkdirSync(OUT, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'meza-cine-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });

let ws, seq = 0; const pending = new Map(); const events = [];
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const i = ++seq;
  const timeout = setTimeout(() => { pending.delete(i); reject(new Error(`CDP timeout: ${method}`)); }, 60000);
  pending.set(i, reply => { clearTimeout(timeout); resolve(reply); });
  ws.send(JSON.stringify({ id: i, method, params }));
});
const q = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'evaluate failed');
  return r.result?.result?.value;
};
const waitFor = async (expr, ms = 60000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await q(expr).catch(() => false)) return true; await sleep(150); } return false; };
const errors = () => events.filter(e => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error'))
  .map(e => (e.params.exceptionDetails?.exception?.description || e.params.args?.map(a => a.value ?? a.description).join(' ') || '').split('\n')[0]);
let nav = 0;
const go = async hash => {
  if (hash.startsWith('#/test/cinematic') && await q(`!!document.querySelector('[data-testid=move]')`)) {
    const params = new URLSearchParams(hash.split('?')[1]);
    await q(`(() => {
      if (window.__realDateNow) Date.now = window.__realDateNow;
      const g = window.__mezaPhaserGame;
      if (g?.pendingDestroy) g.step(performance.now(), 0);
      const buttons = [...document.querySelectorAll('button')];
      for (const label of ${JSON.stringify([params.get('move'), params.get('quality') === 'simple' ? '簡易' : '進階', params.get('side') === 'enemy' ? '敵方使用（↓）' : '我方使用（↑）'])}) {
        const b = buttons.find(b => b.textContent.trim() === label);
        if (!b) throw new Error('Test control missing: ' + label);
        b.click();
      }
    })()`);
    await sleep(80);
  } else {
    await send('Page.navigate', { url: `${BASE}?r=${++nav}${hash}` }); await sleep(400);
  }
};
const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass: !!pass, detail }); console.log(`${pass ? '✔' : '✖'} ${name}${detail && !pass ? ` — ${detail}` : ''}`); };

try {
  for (let i = 0; i < 300 && !ws; i++) {
    try { const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); const p = list.find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch { /* not up yet */ }
    if (!ws) await sleep(200);
  }
  if (!ws) throw new Error(`cannot start Chrome at ${CHROME}`);
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await go('#/');
  if (!(await waitFor(`!!document.querySelector('#root *')`, 30000))) throw new Error(`app not reachable at ${BASE} (is \`npm run dev\` running?)`);


  const MOVE = selected[0], id = ADVANCED_MOVE_ANIMATIONS[MOVE];
  const click = label => q(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!b) throw new Error('Missing control'); b.click(); })()`);
  const completions = () => q(`(document.querySelector('[data-testid=log]').textContent.match(/onComplete/g) || []).length`);
  const advanced = () => waitFor(`(() => { const s = window.__mezaPhaserGame?.scene.getScenes(true)[0]; return document.querySelector('[data-testid=advanced-move-overlay]')?.dataset.cinematic === ${JSON.stringify(id)} && typeof s?.elapsedMs === 'number' && s.elapsedMs < 1000 && s.cues?.length > 0; })()`);
  const releaseOld = () => q(`(() => { if (window.__realDateNow) Date.now = window.__realDateNow; const g = window.__mezaPhaserGame; if (g?.pendingDestroy) g.headlessStep(performance.now(), 0); })()`);
  await go(`#/test/cinematic?move=${encodeURIComponent(MOVE)}&quality=simple&side=ally`);
  for (const at of [1000, 7000, 17000, 26000, 34000, 50000, 56000]) {
    await releaseOld();
    await go(`#/test/cinematic?move=${encodeURIComponent(MOVE)}&quality=advanced&side=ally`);
    if (!(await advanced())) throw new Error('advanced overlay not ready');
    const clock = await q(`(() => {
      const g = window.__mezaPhaserGame, s = g.scene.getScenes(true)[0]; g.loop.sleep();
      window.__skipScene = s; window.__skipGame = g;
      window.__realDateNow = Date.now; window.__fakeNow = Date.now(); Date.now = () => window.__fakeNow;
      let n = 0;
      while (s.elapsedMs < ${at} && n++ < 3000) { window.__fakeNow += 1000 / 30; g.headlessStep(performance.now(), 1000 / 30); }
      return s.elapsedMs;
    })()`);
    check(`skip at ${at}ms reaches the requested phase`, Math.abs(clock - at) < 100);
    await q(`document.querySelector('[data-testid=advanced-move-overlay] button').click()`);
    await sleep(80);
    check(`skip at ${at}ms closes overlay and completes once`, !(await q(`!!document.querySelector('[data-testid=advanced-move-overlay]')`)) && await completions() === 1);
    await q(`window.__skipScene.d.onComplete(); window.__skipScene.d.onComplete()`);
    await sleep(30);
    check(`skip at ${at}ms suppresses duplicate completion`, await completions() === 1);
    check(`skip at ${at}ms cancels pending cinematic cues`, await q(`window.__skipScene.cues.length === 0`));
    await releaseOld();
    check(`skip at ${at}ms destroys the Phaser scene`, await q(`!window.__skipScene.sys?.isActive?.()`));
  }
  const setting = async quality => q(`import(${JSON.stringify(new URL('src/lib/settings.ts', BASE).href)}).then(s => s.updateSettings({ animationQuality: ${JSON.stringify(quality)} }))`);
  await setting('advanced'); await click('跟隨設定');
  check('advanced user setting opens advanced overlay', await advanced());
  await setting('simple');
  check('quality is fixed while an advanced animation is playing', await q(`!!document.querySelector('[data-testid=advanced-move-overlay]')`));
  await q(`document.querySelector('[data-testid=advanced-move-overlay] button').click()`); await sleep(80); await releaseOld();
  await click('跟隨設定');
  check('switching setting to simple selects BattleScene on next attack', await waitFor(`window.__mezaPhaserGame?.scene.getScenes(true)[0]?.sys.settings.key === 'BattleScene'`));
  await setting('advanced');
  check('quality is fixed while a simple animation is playing', await q(`window.__mezaPhaserGame?.scene.getScenes(true)[0]?.sys.settings.key === 'BattleScene'`));
  await click('跟隨設定');
  check('switching back to advanced selects the cinematic on next attack', await advanced());
  check('interaction checks have no console errors', errors().length === 0, errors().join(' | '));
} catch (e) {
  check('run', false, [String(e.message || e), ...errors().slice(0, 3)].join(' | '));
} finally {
  chrome.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
  writeFileSync(join(OUT, `interactions-report.json`), JSON.stringify({ moves: selected, art: ART_MODES, sides: SIDES, screenshots: false, results }, null, 2));
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${failed ? '✖' : '✔'} ${results.length - failed}/${results.length} checks passed — reports in ${OUT}`);
  process.exit(failed ? 1 : 0);
}
