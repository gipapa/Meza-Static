/**
 * BGM Manager — Web Audio API synthesized background music
 * Four tracks: menu, battle, victory, defeat
 *
 * Uses simple oscillator patterns so no external audio files are needed.
 */

type TrackName = 'menu' | 'battle' | 'victory' | 'defeat';

let ctx: AudioContext | null = null;
let gainNode: GainNode | null = null;
let currentTrack: TrackName | null = null;
let stopFns: (() => void)[] = [];
let _volume = 0.3;
let _muted = false;

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext();
    gainNode = ctx.createGain();
    gainNode.gain.value = _muted ? 0 : _volume;
    gainNode.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return { ctx, gain: gainNode! };
}

/* ── Note helpers ── */
const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50,
};

interface LoopNote { note: string; dur: number; }

/** Schedule a looping melody and return a stop function */
function playLoop(melody: LoopNote[], wave: OscillatorType, tempo: number, loopGain = 0.25): () => void {
  const { ctx: ac, gain } = getCtx();
  let running = true;
  let timeoutId: ReturnType<typeof setTimeout>;

  const oscGain = ac.createGain();
  oscGain.gain.value = loopGain;
  oscGain.connect(gain);

  function scheduleLoop() {
    if (!running) return;
    const totalDur = melody.reduce((s, n) => s + n.dur, 0) * tempo;

    const osc = ac.createOscillator();
    osc.type = wave;
    osc.connect(oscGain);

    let t = ac.currentTime;
    melody.forEach(({ note, dur }) => {
      const freq = NOTE_FREQ[note] || 0;
      if (freq > 0) {
        osc.frequency.setValueAtTime(freq, t);
      } else {
        // rest: set very low
        osc.frequency.setValueAtTime(0.001, t);
      }
      t += dur * tempo;
    });

    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + totalDur);

    timeoutId = setTimeout(() => {
      if (running) scheduleLoop();
    }, totalDur * 1000 - 50);
  }

  scheduleLoop();

  return () => {
    running = false;
    clearTimeout(timeoutId);
    try { oscGain.disconnect(); } catch { /* noop */ }
  };
}

/* ── Track definitions ── */

const MENU_MELODY: LoopNote[] = [
  { note: 'C4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'C5', dur: 2 },
  { note: 'B4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'C4', dur: 2 },
  { note: 'D4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'D5', dur: 2 },
  { note: 'C5', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'F4', dur: 1 }, { note: 'D4', dur: 2 },
];

const MENU_BASS: LoopNote[] = [
  { note: 'C3', dur: 4 }, { note: 'G3', dur: 4 },
  { note: 'D3', dur: 4 }, { note: 'A3', dur: 4 },
];

const BATTLE_MELODY: LoopNote[] = [
  { note: 'E4', dur: 0.5 }, { note: 'E4', dur: 0.5 }, { note: 'E5', dur: 0.5 }, { note: 'E4', dur: 0.5 },
  { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 1 },
  { note: 'A4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'B4', dur: 0.5 },
  { note: 'C5', dur: 1 }, { note: 'B4', dur: 0.5 }, { note: 'A4', dur: 0.5 },
  { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'B4', dur: 0.5 }, { note: 'C5', dur: 0.5 },
  { note: 'D5', dur: 1 }, { note: 'E5', dur: 1 },
];

const BATTLE_BASS: LoopNote[] = [
  { note: 'E3', dur: 1 }, { note: 'E3', dur: 1 }, { note: 'A3', dur: 1 }, { note: 'A3', dur: 1 },
  { note: 'G3', dur: 1 }, { note: 'G3', dur: 1 }, { note: 'D3', dur: 1 }, { note: 'E3', dur: 1 },
];

const VICTORY_MELODY: LoopNote[] = [
  { note: 'C5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, { note: 'G5', dur: 1 },
  { note: 'G5', dur: 0.5 }, { note: 'A5', dur: 0.5 }, { note: 'G5', dur: 0.5 }, { note: 'E5', dur: 0.5 },
  { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, { note: 'F5', dur: 0.5 },
  { note: 'G5', dur: 1 }, { note: 'C6', dur: 2 },
  { note: 'B5', dur: 0.5 }, { note: 'A5', dur: 0.5 }, { note: 'G5', dur: 1 }, { note: 'C5', dur: 2 },
];

const DEFEAT_MELODY: LoopNote[] = [
  { note: 'E4', dur: 1 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1.5 },
  { note: 'E4', dur: 0.5 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1 }, { note: 'B3', dur: 1.5 },
  { note: 'C4', dur: 0.5 }, { note: 'D4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'C4', dur: 2 },
];

function startTrack(track: TrackName) {
  const tempo = track === 'battle' ? 0.14 : track === 'menu' ? 0.28 : track === 'victory' ? 0.22 : 0.35;

  switch (track) {
    case 'menu':
      stopFns.push(playLoop(MENU_MELODY, 'triangle', tempo, 0.2));
      stopFns.push(playLoop(MENU_BASS, 'sine', tempo, 0.12));
      break;
    case 'battle':
      stopFns.push(playLoop(BATTLE_MELODY, 'square', tempo, 0.15));
      stopFns.push(playLoop(BATTLE_BASS, 'sawtooth', tempo, 0.08));
      break;
    case 'victory':
      stopFns.push(playLoop(VICTORY_MELODY, 'triangle', tempo, 0.22));
      break;
    case 'defeat':
      stopFns.push(playLoop(DEFEAT_MELODY, 'sine', tempo, 0.2));
      break;
  }
}

/* ── Public API ── */

export function playBGM(track: TrackName): void {
  if (currentTrack === track) return;
  stopBGM();
  currentTrack = track;
  try { startTrack(track); } catch { /* AudioContext not available */ }
}

export function stopBGM(): void {
  stopFns.forEach(fn => fn());
  stopFns = [];
  currentTrack = null;
}

export function setVolume(v: number): void {
  _volume = Math.max(0, Math.min(1, v));
  if (gainNode) gainNode.gain.value = _muted ? 0 : _volume;
  try { localStorage.setItem('meza_bgm_vol', String(_volume)); } catch { /* noop */ }
}

export function toggleMute(): boolean {
  _muted = !_muted;
  if (gainNode) gainNode.gain.value = _muted ? 0 : _volume;
  try { localStorage.setItem('meza_bgm_muted', _muted ? '1' : '0'); } catch { /* noop */ }
  return _muted;
}

export function isMuted(): boolean {
  return _muted;
}

export function getCurrentTrack(): TrackName | null {
  return currentTrack;
}

// Restore saved preferences
try {
  const sv = localStorage.getItem('meza_bgm_vol');
  if (sv) _volume = parseFloat(sv);
  _muted = localStorage.getItem('meza_bgm_muted') === '1';
} catch { /* noop */ }
