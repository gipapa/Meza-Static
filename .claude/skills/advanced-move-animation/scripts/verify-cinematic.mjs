#!/usr/bin/env node
/* ────────────────────────────────────────────────────────────────────
 *  Browser verification for one advanced move cinematic.
 *
 *  Usage (dev server must be running: `npm run dev`):
 *    node .claude/skills/advanced-move-animation/scripts/verify-cinematic.mjs \
 *      --move 花瓣舞 [--base http://localhost:5173/Meza-Static/] [--out ./cinematic-check] [--side ally|enemy|both]
 *      [--render-samples-only] (update every 30 fps step, render only sampled frames;
 *      use separate continuous playback to review motion and rendering performance)
 *
 *  Needs Google Chrome (override with CHROME=/path/to/chrome) and Node ≥ 22.6
 *  (type stripping, to import the timelines from src/).
 *
 *  What it checks, per side (ally attacks / enemy attacks):
 *   1. quality=advanced opens the advanced overlay for this move.
 *   2. Deterministic frame stepping (fake Date.now, 30 fps): every phase
 *      starts within ±RUNTIME_TOLERANCE_MS of its design time, in order.
 *   3. onComplete fires once, at 60 s ± tolerance, and not before.
 *   4. No console errors / exceptions.
 *   5. Custom artwork: with test images for attacker and defender, cut-in /
 *      eye-catch portraits use the attacker's art, no actor sprite is flipped,
 *      and in any two-shot the enemy is above the ally.
 *   6. quality=simple plays the simple BattleScene (fallback kept).
 *  Batch: --all [--shard 1/3] --art both --no-screenshots --render-samples-only
 *  Subset: --moves 花瓣舞,幻象光線,空氣利刃 (comma-separated exact move names).
 *  --no-screenshots skips image capture; runtime/render checks still run.
 *  Screenshots of the middle of every phase go to --out.
 *  Exit code 0 = all checks passed.
 *  ──────────────────────────────────────────────────────────────────── */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), !arr[i + 1] || arr[i + 1].startsWith('--') ? 'true' : arr[i + 1]]);
  return acc;
}, []));
const ART_MODES = args.art === 'both' ? ['custom', 'emoji'] : [args.art || 'custom'];
if (ART_MODES.some(a => !['custom', 'emoji'].includes(a))) throw new Error('art must be custom, emoji or both');
const BASE = (args.base || 'http://localhost:5173/Meza-Static/').replace(/\/?$/, '/');
const OUT = resolve(args.out || 'cinematic-check');
const SIDES = args.side && args.side !== 'both' ? [args.side] : ['ally', 'enemy'];
if (SIDES.some(side => side !== 'ally' && side !== 'enemy')) throw new Error('side must be ally, enemy or both');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9300 + Math.floor(Math.random() * 500);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const src = p => pathToFileURL(join(ROOT, 'src/phaser/cinematic', p)).href;
const { ADVANCED_MOVE_ANIMATIONS } = await import(src('moveAnimations.ts'));
const { CINEMATIC_TIMELINES } = await import(src('timelines.ts'));
const { ADVANCED_MOVE_DURATION_MS, RUNTIME_TOLERANCE_MS, validateAdvancedTimeline } = await import(src('spec.ts'));

const MOVES = args.all ? Object.keys(ADVANCED_MOVE_ANIMATIONS)
  : args.moves ? [...new Set(args.moves.split(',').map(move => move.trim()).filter(Boolean))]
    : [args.move || '花瓣舞'];
const shard = args.shard ? args.shard.split('/').map(Number) : [1, 1];
if (shard.length !== 2 || !shard.every(Number.isInteger) || shard[0] < 1 || shard[0] > shard[1]) throw new Error('shard must be N/total');
const selected = MOVES.filter((_, i) => i % shard[1] === shard[0] - 1);
if (!selected.length) throw new Error('No moves selected');
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
const shot = async name => {
  if (args['no-screenshots']) return;
  // GPU-backed headless Chrome can briefly reject capture while presenting a frame.
  // Retry the read only; never advance scene time or skip a failed screenshot.
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    if (r.result?.data) {
      writeFileSync(join(OUT, name), Buffer.from(r.result.data, 'base64'));
      return;
    }
    failure = r.error;
    await sleep(200);
  }
  throw new Error(`Screenshot ${name} failed: ${JSON.stringify(failure)}`);
};

const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass: !!pass, detail }); console.log(`${pass ? '✔' : '✖'} ${name}${detail && !pass ? ` — ${detail}` : ''}`); };

/* Actor sprites (custom art or emoji) of the running scene, incl. containers. */
const SPRITES = `(() => { const s = window.__mezaPhaserGame?.scene.getScenes(true)[0]; if (!s) return [];
  const out = []; const walk = (list, inC) => list.forEach(o => { if (o.list) walk(o.list, true);
    const a = o.getData?.('actorArt'); if (a && o.visible && o.alpha > 0.05) out.push({ art: a, key: o.texture?.key, x: o.x, y: o.y, inC,
      flip: !!(o.flipX || o.flipY) || o.scaleX < 0 || o.scaleY < 0 }); });
  walk(s.children.list, false); return out; })()`;

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

  for (const MOVE of selected) {
    const id = ADVANCED_MOVE_ANIMATIONS[MOVE], tl = CINEMATIC_TIMELINES[id];
    const resultStart = results.length;
  for (const artMode of ART_MODES) for (const side of SIDES) {
    const tag = `[${MOVE}/${artMode}/${side}]`;
    await send('Emulation.setDeviceMetricsOverride', { width: Number(args.width) || (artMode === 'emoji' ? 360 : 390), height: 844, deviceScaleFactor: 2, mobile: true });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: args['reduced-motion'] || artMode === 'emoji' ? 'reduce' : 'no-preference' }] });
    events.length = 0;
    // Test artwork per character id (red attacker, blue enemy / green ally
    // defender). Ids come from the test page's DEV hook, then we reload.
    await go(`#/test/cinematic?quality=simple&side=${side}&move=${encodeURIComponent(MOVE)}`);
    await waitFor(`!!window.__mezaCinematicTest`, 60000);
    await q(`(async () => { const mk = c => { const k = document.createElement('canvas'); k.width = k.height = 64; const x = k.getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 64, 32); x.fillStyle = '#fff'; x.fillRect(0, 32, 64, 32); return k.toDataURL('image/png'); };
      const tags = window.__mezaCinematicTest; const img = {};
      img[tags.attackerId] = { kind: 'upload', src: mk('#d22'), updatedAt: 1 };
      img[tags.defenderId] = { kind: 'upload', src: mk(tags.defenderSide === 'enemy' ? '#23d' : '#2c4'), updatedAt: 1 };
      const store = await import(${JSON.stringify(new URL('src/lib/characterImages.ts', BASE).href)});
      store.clearCharacterImages();
      for (const [id, entry] of Object.entries(img)) store.setCharacterImage(id, entry);
    })()`);
    if (artMode === 'emoji') await q(`import(${JSON.stringify(new URL('src/lib/characterImages.ts', BASE).href)}).then(s => s.clearCharacterImages())`);
    const roles = await q(`window.__mezaCinematicTest`);
    if (!roles?.attackerId) throw new Error('test page DEV hook window.__mezaCinematicTest missing');
    await go(`#/test/cinematic?quality=advanced&side=${side}&move=${encodeURIComponent(MOVE)}`);
    const opened = await waitFor(`document.querySelector('[data-testid=advanced-move-overlay]')?.dataset.cinematic === ${JSON.stringify(id)} && !!window.__mezaPhaserGame?.scene.getScenes(true)[0]`, 60000);
    check(`${tag} advanced overlay opens cinematic "${id}"`, opened);
    if (!opened) continue;
    await waitFor(`document.querySelector('[data-testid=phase]')?.textContent === 'intro'`, 30000);

    // Pause the RAF loop and drive time manually (fake Date.now, 30 fps) until
    // the scene's own design clock (CinematicScene#elapsedMs) reaches the target.
    const t0 = await q(`(() => { const g = window.__mezaPhaserGame; g.loop.sleep();
      const scene = g.scene.getScenes(true)[0];
      if (typeof scene.elapsedMs !== 'number') throw new Error('scene is not a CinematicScene');
      window.__realDateNow = Date.now; window.__fakeNow = Date.now(); Date.now = () => window.__fakeNow;
      const renderAt = new Set(${JSON.stringify(tl.phases.slice(3, 6).map(p => Math.round(p.start + (p.end - p.start) * 0.75)))});
      window.__stepTo = ms => {
        const dt = 1000 / 30; let n = 0; let stagnant = 0; let last = scene.elapsedMs;
        const alive = () => scene.sys?.isActive?.() !== false;
        while (alive() && scene.elapsedMs < ms && n++ < 100000) {
          window.__fakeNow += dt;
          g.${args['render-samples-only'] ? 'headlessStep' : 'step'}(performance.now(), dt);
          const now = scene.elapsedMs;
          stagnant = now === last ? stagnant + 1 : 0;
          last = now;
          if (stagnant > 120) break; // destroyed/paused scene; avoid a runaway test loop
        }
        ${args['render-samples-only'] ? `if (alive() ${args['no-screenshots'] ? '&& renderAt.has(ms)' : ''}) g.step(performance.now(), 0);` : ''}
        return scene.elapsedMs;
      };
      return scene.elapsedMs; })()`);
    if (t0 > tl.phases[1].start - RUNTIME_TOLERANCE_MS) throw new Error(`scene already at ${t0}ms before stepping started`);
    const phaseNow = async ms => {
      await q(`window.__stepTo(${ms})`);
      // The design clock is frozen here. Let React commit its phase label:
      // a fixed 60 ms delay can read stale UI under software-rendering load.
      // No additional engine frames are stepped while waiting, so an early
      // or late scene cue still fails the same ±100 ms design-time boundary.
      const expected = tl.phases.find(p => p.start <= ms && ms < p.end)?.id ?? tl.phases.at(-1).id;
      await waitFor(`document.querySelector('[data-testid=phase]')?.textContent === ${JSON.stringify(expected)}`, 3000);
      return q(`document.querySelector('[data-testid=phase]').textContent`);
    };
    const done = () => q(`document.querySelector('[data-testid=log]').textContent.includes('onComplete')`);

    const sprites = [];
    const health = [];
    const inspectScene = () => q(`(() => {
      const s = window.__mezaPhaserGame?.scene.getScenes(true)[0];
      if (!s) return null;
      const list = []; const walk = xs => xs.forEach(o => { list.push(o); if (o.list) walk(o.list); }); walk(s.children.list);
      return { finite: list.every(o => ['x', 'y', 'scaleX', 'scaleY', 'alpha', 'rotation'].every(k => o[k] === undefined || Number.isFinite(o[k]))),
        particles: list.reduce((sum, o) => sum + (o.getAliveParticleCount?.() || 0), 0),
        custom: list.filter(o => o.texture?.key?.startsWith('energy-')).length,
        skip: (() => { const b = document.querySelector('[data-testid=advanced-move-overlay] button'); const r = b?.getBoundingClientRect(); return !!r && r.left >= 0 && r.right <= innerWidth && r.height >= 44 && getComputedStyle(b).pointerEvents !== 'none'; })() };
    })()`);

    const tol = RUNTIME_TOLERANCE_MS;
    for (const [i, p] of tl.phases.entries()) {
      if (i > 0) {
        const before = await phaseNow(p.start - tol);
        check(`${tag} before ${p.id} (${(p.start - tol) / 1000}s) still in ${tl.phases[i - 1].id}`, before === tl.phases[i - 1].id, `got ${before}`);
      }
      const at = await phaseNow(p.start + tol);
      check(`${tag} phase ${p.id} starts at ${p.start / 1000}s ±${tol}ms`, at === p.id, `got ${at}`);
      // Sample sprites across the phase and capture its midpoint.
      for (const f of [0.25, 0.5, 0.75]) {
        await q(`window.__stepTo(${Math.round(p.start + (p.end - p.start) * f)})`);
        for (const s of await q(SPRITES)) sprites.push({ ...s, phase: p.id });
        health.push(await inspectScene());
        if (f === 0.5) { await sleep(60); await shot(`${id}-${side}-${String(i + 1).padStart(2, '0')}-${p.id}.png`); }
      }
    }
    await phaseNow(ADVANCED_MOVE_DURATION_MS - tol);
    check(`${tag} no onComplete before ${(ADVANCED_MOVE_DURATION_MS - tol) / 1000}s`, !(await done()));
    await phaseNow(ADVANCED_MOVE_DURATION_MS + tol);
    check(`${tag} onComplete at ${ADVANCED_MOVE_DURATION_MS / 1000}s ±${tol}ms`, await done());
    const completions = await q(`(document.querySelector('[data-testid=log]').textContent.match(/onComplete/g) || []).length`);
    check(`${tag} onComplete fires exactly once`, completions === 1, `fired ${completions}×`);

    const atkKey = `char:${roles.attackerId}`, defKey = `char:${roles.defenderId}`;
    const enemyKey = roles.attackerSide === 'enemy' ? atkKey : defKey, allyKey = roles.attackerSide === 'ally' ? atkKey : defKey;
    const portraits = sprites.filter(s => s.inC);
    if (artMode === 'custom') {
      check(`${tag} attacker custom art is used`, sprites.some(s => s.key === atkKey));
      check(`${tag} defender custom art is used`, sprites.some(s => s.key === defKey));
      check(`${tag} cut-in/eye-catch portraits use the attacker's art`, portraits.length > 0 && portraits.every(s => s.key === atkKey));
      const pairs = sprites.filter(s => !s.inC && s.key === enemyKey).flatMap(e => sprites
        .filter(a => !a.inC && a.key === allyKey && a.phase === e.phase && Math.abs(a.x - e.x) < 200).map(a => ({ e, a })));
      check(`${tag} in two-shots the enemy is above the ally`, pairs.length > 0 && pairs.every(({ e, a }) => e.y < a.y));
    } else {
      check(`${tag} all actors and portraits use emoji fallback`, sprites.length >= 4 && sprites.every(s => s.art === 'emoji'));
      check(`${tag} emoji cut-in and eye-catch exist`, portraits.length > 0);
    }
    check(`${tag} no actor sprite is flipped`, sprites.every(s => !s.flip));
    check(`${tag} finite geometry throughout all phases`, health.length > 0 && health.every(h => h?.finite));
    check(`${tag} particle budget stays at or below 300`, health.every(h => h?.particles <= 300), `peak ${Math.max(...health.map(h => h?.particles || 0))}`);
    check(`${tag} mobile skip button is reachable in every phase`, health.every(h => h?.skip));

    check(`${tag} no console errors`, errors().length === 0, errors().slice(0, 3).join(' | '));

    // Simple fallback is preserved.
    events.length = 0;
    await go(`#/test/cinematic?quality=simple&side=${side}&move=${encodeURIComponent(MOVE)}`);
    const simple = await waitFor(`window.__mezaPhaserGame?.scene.getScenes(true)[0]?.sys.settings.key === 'BattleScene'`, 60000);
    check(`${tag} quality=simple plays the simple BattleScene`, simple && !(await q(`!!document.querySelector('[data-testid=advanced-move-overlay]')`)));
    check(`${tag} simple playback has no console errors`, errors().length === 0, errors().join(' | '));
    await q(`localStorage.removeItem('meza_character_images')`);
  }
    writeFileSync(join(OUT, `${id}-report.json`), JSON.stringify({ move: MOVE, id, totalMs: tl.totalMs, results: results.slice(resultStart) }, null, 2));
    console.log(`Completed ${MOVE} (${selected.indexOf(MOVE) + 1}/${selected.length})`);
  }
} catch (e) {
  check('run', false, [String(e.message || e), ...errors().slice(0, 3)].join(' | '));
} finally {
  chrome.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
  writeFileSync(join(OUT, `summary-${shard[0]}-of-${shard[1]}.json`), JSON.stringify({ moves: selected, art: ART_MODES, sides: SIDES, screenshots: !args['no-screenshots'], results }, null, 2));
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${failed ? '✖' : '✔'} ${results.length - failed}/${results.length} checks passed — ${args['no-screenshots'] ? 'reports' : 'screenshots & reports'} in ${OUT}`);
  process.exit(failed ? 1 : 0);
}
