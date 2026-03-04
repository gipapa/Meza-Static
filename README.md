# MEZA★STATIC

A fan-made arcade tag-battle web game inspired by Pokémon MEZASTAR. Battle bosses, spin roulettes, mash buttons, and collect monster tags — all in your browser!

**Live Demo:** [https://gipapa.github.io/Meza-Static/](https://gipapa.github.io/Meza-Static/)

## Features

- **Battle & Catch** — 3-round boss battles with attack roulette + mash mechanics
- **Catch Now** — Quick encounter mode for instant tag collecting
- **18 Original Monsters** across 6 themed areas (★2–★6 rarity)
- **Battle Animations** — Per-type CSS particle effects (18 types mapped to 5 animation variants: rise, expand, bolt, slam, sweep) with card lunge/hit reactions
- **Ball Roulette** — Poké / Great / Ultra / Master ball chance system
- **Bonus Catch** — Grass-grid mini-game for extra catches
- **Collection** — Card wall with grade/type filters, sorting, and card flip
- **Trainer Profile** — Nickname, 40 emoji avatars, stats tracking
- **Settings** — Export/import JSON, clear data
- **Fully Static** — No backend, localStorage persistence, deployable anywhere

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | react-router-dom (HashRouter) |
| Design | Retro-Futurism / Cyberpunk (Russo One + Chakra Petch) |
| Deploy | GitHub Pages via Actions |

## Getting Started

```bash
npm install
npm run dev        # Dev server at localhost:5173
npm run build      # Production build (tsc + vite)
npm run preview    # Preview production build
```

## Battle Animation System

Attacks trigger type-specific CSS particle animations during the damage phase:

| Variant | Types | Style |
|---------|-------|-------|
| **rise** | fire, grass, poison, bug | Emoji particles scatter outward and fade |
| **expand** | water, ice, psychic, fairy, ghost | Particles grow from center and dissolve |
| **bolt** | electric | Zigzag horizontal flash |
| **slam** | fighting, steel, ground, rock | Impact drop from above |
| **sweep** | dragon, dark, normal, flying | Diagonal arc sweep |

Each attack also features a colored ring burst matching the move's type color, an attacker card lunge animation, and a boss hit-shake with brightness flash.

## Project Structure

```
src/
├── components/     # TagCard, Header, Footer, BattleAnimation
├── data/           # Monster definitions, type maps
├── lib/            # Battle mechanics, RNG, localStorage
├── pages/          # 11 route pages (Home→Battle→Catch→Collection→...)
├── types.ts        # TypeScript interfaces
└── index.css       # Tailwind theme + battle animations
```

## Legal

This is a **fan-made project** for educational & entertainment purposes only. Not affiliated with Nintendo, The Pokémon Company, or Takara Tomy Arts. All monster data and artwork are original creations.
