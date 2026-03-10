# MEZA★STATIC

A fan-made arcade tag-battle web game inspired by the MEZASTAR arcade series. Battle bosses, spin roulettes, mash buttons, and collect monster tags — all in your browser with no server required.

**Live Demo:** [https://gipapa.github.io/Meza-Static/](https://gipapa.github.io/Meza-Static/)

---

## Features

### Core Game Modes
- **Battle & Catch** — Select an area, fight a boss team (speed comparison → attack roulette → button-mash), then enter Catch Time to claim a tag
- **Catch Now** — Skip the battle; encounter wild monsters directly and go straight to the Ball Wheel

### Monster System
- **151 monsters** spanning Grade ★1 (common) through ★6 (legendary tier)
- **18 elemental types** with a full effectiveness chart (super effective / not very effective / immune)
- **6 themed areas**: Volcano 🌋, Coast 🌊, Forest 🌳, Thunder Storm ⚡, Ghost Castle 👻, Starfall Peak 🐉
- Each monster has HP / ATK / DEF / SPD stats, a signature move with type and power, and a PE (Power Energy) score
- **Grade ★5** (Star) and **★6** (Legendary) monsters are rare boss-pool drops

### Battle Mechanics
- **Speed comparison** before each round — higher SPD attacks first
- **Attack Roulette** — spin and stop for a multiplier (1–10); higher = stronger hit
- **Button-mash phase** — 2.5-second window to rack up bonus damage
- **Type effectiveness** labels shown in real time (e.g. "Super Effective ×2!")
- **Damage formula** factors in ATK, move power, roulette value, mash count, and type multiplier

### Catch & Collection
- **Ball Wheel** — Spin to land Poké / Great / Ultra / Master Ball (weighted roulette with physics-based friction deceleration)
- **Bonus Catch Time** — Grass-grid cursor stops on a random slot for a free Poké Ball throw
- **Collection Wall** — Filter by grade / type, sort by PE or grade, flip cards to see back stats
- **Tag Detail Page** — Full stats, move info, type badge
- **Trainer Profile** — Customisable nickname, 40 emoji avatars, catch count & session stats

### Copyright / Name Handling
Monster names are masked by default (first and last character shown, middle replaced with `O`) to avoid trademark and copyright issues with third-party intellectual property contained in the data layer.

### Animations (Reusable Overlay System)
- **`AnimationOverlay`** — shared full-screen modal frame used by all animation sequences
- **`BattleOverlayAnimation`** — centered card duel view: attacker lunges, particles burst on defender, damage number pops; accepts any `attacker` / `defender` Tag pair — reusable anywhere
- **`BattleProjectile`** — fixed-position projectile system with 8 path variants (straight, arc, zigzag, wobble, scatter, parabolic, curve-s, fade-in) and per-type trail particles

### Phaser 3 Animations (GPU-accelerated)
- **`WheelScene`** — physics-based ball roulette wheel with smooth proportional deceleration (no re-acceleration glitch); renders 4 weighted ball segments with glow effects
- **`BattleScene`** — full GPU-accelerated battle overlay: attacker lunges, particles burst, HP bar drains, damage number pops with screen shake
- **`CatchScene`** — 5-stage cinematic catch sequence: ball throw arc → monster absorption with particles → camera zoom-in → 1–3 ball shakes with camera micro-shake → success (sparkle burst, star orbits) or escape (ball break, monster dash)
- **`PhaserContainer`** — React wrapper that mounts any Phaser game config into a `<div>`, handling StrictMode double-mount with `requestAnimationFrame` guard
- **`PhaserCatchOverlay`** — full-screen overlay using `CatchScene`; replaces the CSS-based catch animation in `CatchPage`
- **`PhaserBallWheel`** — drop-in replacement for the CSS `BallWheel` component, powered by `WheelScene`

### Other
- **Type Chart** — inline reference table, toggle during battle
- **How to Play** page — full rules explanation
- **Settings** — export collection as JSON, import from JSON, reset all data
- **Fully static** — no backend, no build-time data fetching; all state in `localStorage`
- **GitHub Pages deploy** via Actions on push to `main`

---

## Tech Stack

| Layer | Details |
|-------|---------|
| Framework | **React 19** + **TypeScript 5.8** |
| Build | **Vite 6** |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite` plugin, zero PostCSS config) |
| Routing | **react-router-dom v7** — `HashRouter` for GitHub Pages compatibility |
| Game Engine | **Phaser 3.90** — WebGL/Canvas GPU-accelerated scenes for animations |
| Fonts | Russo One (display), Chakra Petch (UI) via CSS `@import` |
| Persistence | `localStorage` only — no cookies, no external APIs |
| Deploy | GitHub Pages · GitHub Actions |

---

## Getting Started

```bash
npm install
npm run dev        # Dev server (default: localhost:5173)
npm run build      # Type-check then production build → dist/
npm run preview    # Preview the production build locally
```

---

## Project Structure

```
src/
├── components/
│   ├── AnimationOverlay.tsx       # Reusable modal frame for all animations
│   ├── BattleOverlayAnimation.tsx # Full-screen attacker-vs-defender card duel
│   ├── CatchAnimation.tsx         # CSS-based ball-throw catch sequence (legacy)
│   ├── BattleProjectile.tsx       # Per-type projectile paths + trails
│   ├── BallWheel.tsx              # Spin-to-stop ball roulette widget (CSS)
│   ├── TagCard.tsx                # Flip card with front/back stats
│   └── ...
├── phaser/
│   ├── PhaserContainer.tsx        # Generic React→Phaser mount wrapper
│   ├── PhaserBallWheel.tsx        # Phaser-powered ball roulette (WheelScene)
│   ├── PhaserBattleOverlay.tsx    # Phaser-powered battle animation overlay
│   ├── PhaserCatchOverlay.tsx     # Phaser-powered catch animation overlay
│   ├── WheelScene.ts              # Phaser scene: ball roulette with deceleration
│   ├── BattleScene.ts             # Phaser scene: GPU-accelerated battle duel
│   └── CatchScene.ts             # Phaser scene: 5-stage cinematic catch sequence
├── data/
│   └── monsters.ts  # 151 Tag definitions + 6 Area configs
├── lib/
│   ├── battle.ts    # Damage formulas, roulette, catch rate
│   ├── typeChart.ts # 18-type effectiveness matrix
│   ├── nameMask.ts  # Copyright name masking + reveal hook
│   ├── storage.ts   # localStorage helpers
│   └── rng.ts       # Seeded shuffle + random utilities
├── pages/           # 12 route pages
│   # Home → PlayMode → AreaSelect → Battle → Catch → Result
│   # Collection → TagDetail → Trainer → HowTo → Settings
│   # TestBattlePage (dev-only animation test harness)
├── types.ts         # Tag, Area, BallType, MonState interfaces
└── index.css        # Tailwind theme tokens + keyframe animations
```

---

## Legal

This is a **fan-made project** for personal educational and entertainment purposes only. It is not affiliated with, endorsed by, or connected to Nintendo, The Pokémon Company, Creatures Inc., GAME FREAK inc., or Takara Tomy Arts. No official assets, logos, or copyrighted artwork are included. Monster names in the data layer are masked by default to minimise trademark exposure. No commercial use is intended.
