import type { Tag, Area } from '../types';

export const TYPE_COLORS: Record<string, string> = {
  fire: '#F97316',
  water: '#3B82F6',
  grass: '#22C55E',
  electric: '#FBBF24',
  psychic: '#EC4899',
  dark: '#6B7280',
  dragon: '#7C3AED',
  fairy: '#F9A8D4',
  fighting: '#DC2626',
  normal: '#A8A29E',
  ice: '#67E8F9',
  ghost: '#8B5CF6',
  steel: '#94A3B8',
  poison: '#A855F7',
  ground: '#D97706',
  flying: '#93C5FD',
  bug: '#84CC16',
  rock: '#A16207',
};

export const TYPE_EMOJI: Record<string, string> = {
  fire: '🔥', water: '💧', grass: '🌿', electric: '⚡',
  psychic: '🔮', dark: '🌑', dragon: '🐉', fairy: '✨',
  fighting: '🥊', normal: '⚪', ice: '❄️', ghost: '👻',
  steel: '⚙️', poison: '☠️', ground: '🏔️', flying: '🕊️',
  bug: '🐛', rock: '🪨',
};

/** 寶可夢官方中文屬性名稱 */
export const TYPE_NAMES_ZH: Record<string, string> = {
  fire: '火', water: '水', grass: '草', electric: '電',
  psychic: '超能力', dark: '惡', dragon: '龍', fairy: '妖精',
  fighting: '格鬥', normal: '一般', ice: '冰', ghost: '幽靈',
  steel: '鋼', poison: '毒', ground: '地面', flying: '飛行',
  bug: '蟲', rock: '岩石',
};

export const ALL_TAGS: Tag[] = [
  // Area 1: Ember Volcano - Fire themed
  { id: 'tag_001', name: 'Blazeclaw', grade: 3, types: ['fire'], pe: 110, stats: { hp: 100, atk: 85, def: 55, spd: 70 }, move: { name: 'Flame Slash', type: 'fire', power: 55 }, flags: {} },
  { id: 'tag_002', name: 'Pyrodon', grade: 4, types: ['fire', 'dragon'], pe: 160, stats: { hp: 140, atk: 100, def: 80, spd: 65 }, move: { name: 'Dragon Blaze', type: 'fire', power: 75 }, flags: {} },
  { id: 'tag_003', name: 'Cinderfox', grade: 2, types: ['fire'], pe: 80, stats: { hp: 70, atk: 60, def: 45, spd: 85 }, move: { name: 'Ember Rush', type: 'fire', power: 40 }, flags: {} },
  // Area 2: Azure Coast - Water themed
  { id: 'tag_004', name: 'Tidecrest', grade: 3, types: ['water'], pe: 120, stats: { hp: 110, atk: 70, def: 80, spd: 65 }, move: { name: 'Tidal Wave', type: 'water', power: 60 }, flags: {} },
  { id: 'tag_005', name: 'Abyssking', grade: 5, types: ['water', 'dark'], pe: 200, stats: { hp: 180, atk: 120, def: 100, spd: 75 }, move: { name: 'Deep Crush', type: 'water', power: 90 }, flags: { legendary: true } },
  { id: 'tag_006', name: 'Shellspark', grade: 2, types: ['water', 'electric'], pe: 90, stats: { hp: 80, atk: 65, def: 70, spd: 55 }, move: { name: 'Volt Splash', type: 'electric', power: 45 }, flags: {} },
  // Area 3: Forest Shrine - Grass themed
  { id: 'tag_007', name: 'Thornveil', grade: 3, types: ['grass', 'fairy'], pe: 115, stats: { hp: 95, atk: 75, def: 85, spd: 60 }, move: { name: 'Petal Guard', type: 'grass', power: 55 }, flags: {} },
  { id: 'tag_008', name: 'Mossdrake', grade: 4, types: ['grass', 'dragon'], pe: 170, stats: { hp: 150, atk: 95, def: 90, spd: 70 }, move: { name: 'Vine Fang', type: 'grass', power: 70 }, flags: {} },
  { id: 'tag_009', name: 'Sproutling', grade: 2, types: ['grass'], pe: 75, stats: { hp: 65, atk: 50, def: 55, spd: 80 }, move: { name: 'Leaf Shot', type: 'grass', power: 35 }, flags: {} },
  // Area 4: Thunder Peak - Electric themed
  { id: 'tag_010', name: 'Voltstrike', grade: 4, types: ['electric', 'fighting'], pe: 155, stats: { hp: 130, atk: 110, def: 65, spd: 95 }, move: { name: 'Thunder Fist', type: 'electric', power: 80 }, flags: {} },
  { id: 'tag_011', name: 'Sparkwing', grade: 3, types: ['electric', 'flying'], pe: 125, stats: { hp: 100, atk: 80, def: 60, spd: 100 }, move: { name: 'Sky Bolt', type: 'electric', power: 60 }, flags: {} },
  { id: 'tag_012', name: 'Zappup', grade: 2, types: ['electric'], pe: 70, stats: { hp: 60, atk: 55, def: 40, spd: 90 }, move: { name: 'Static Bite', type: 'electric', power: 35 }, flags: {} },
  // Area 5: Phantom Castle - Ghost/Psychic
  { id: 'tag_013', name: 'Spectralis', grade: 5, types: ['ghost', 'psychic'], pe: 210, stats: { hp: 170, atk: 130, def: 95, spd: 85 }, move: { name: 'Soul Rend', type: 'ghost', power: 95 }, flags: { legendary: true } },
  { id: 'tag_014', name: 'Hauntwisp', grade: 3, types: ['ghost'], pe: 105, stats: { hp: 85, atk: 90, def: 50, spd: 95 }, move: { name: 'Shadow Flicker', type: 'ghost', power: 55 }, flags: {} },
  { id: 'tag_015', name: 'Mindshade', grade: 4, types: ['psychic', 'dark'], pe: 150, stats: { hp: 120, atk: 105, def: 75, spd: 80 }, move: { name: 'Dark Pulse', type: 'dark', power: 70 }, flags: {} },
  // Area 6: Starfall Summit - Dragon/Legendary
  { id: 'tag_016', name: 'Cosmowyrm', grade: 6, types: ['dragon', 'psychic'], pe: 280, stats: { hp: 220, atk: 150, def: 120, spd: 100 }, move: { name: 'Cosmic Roar', type: 'dragon', power: 110 }, flags: { legendary: true, mythical: true } },
  { id: 'tag_017', name: 'Stardusk', grade: 4, types: ['dragon', 'fairy'], pe: 175, stats: { hp: 145, atk: 100, def: 95, spd: 75 }, move: { name: 'Starfall', type: 'fairy', power: 75 }, flags: {} },
  { id: 'tag_018', name: 'Meteorite', grade: 3, types: ['rock', 'fire'], pe: 130, stats: { hp: 120, atk: 95, def: 100, spd: 40 }, move: { name: 'Impact Burn', type: 'rock', power: 65 }, flags: {} },
];

// Rental tags for players with no collection
export const RENTAL_TAGS: Tag[] = [
  { id: 'rental_001', name: 'Firepup', grade: 2, types: ['fire'], pe: 80, stats: { hp: 70, atk: 60, def: 50, spd: 65 }, move: { name: 'Quick Flame', type: 'fire', power: 40 }, flags: {} },
  { id: 'rental_002', name: 'Aquapup', grade: 2, types: ['water'], pe: 80, stats: { hp: 75, atk: 55, def: 60, spd: 60 }, move: { name: 'Water Jet', type: 'water', power: 40 }, flags: {} },
  { id: 'rental_003', name: 'Leafpup', grade: 2, types: ['grass'], pe: 80, stats: { hp: 70, atk: 55, def: 55, spd: 70 }, move: { name: 'Razor Leaf', type: 'grass', power: 40 }, flags: {} },
];

export const AREAS: Area[] = [
  {
    areaId: 'area_volcano',
    name: '燼焰火山',
    emoji: '🌋',
    bossPool: ['tag_002'],
    minionPool: ['tag_001', 'tag_003'],
    minGrade: 2,
    maxGrade: 6,
    dropRates: { star: 0.04, superstar: 0.005 },
    description: '烈焰燃燒的怒火之山。',
  },
  {
    areaId: 'area_coast',
    name: '蒼藍海岸',
    emoji: '🌊',
    bossPool: ['tag_005'],
    minionPool: ['tag_004', 'tag_006'],
    minGrade: 2,
    maxGrade: 6,
    dropRates: { star: 0.06, superstar: 0.008 },
    description: '深海之中潛藏著遠古巨獸。',
  },
  {
    areaId: 'area_forest',
    name: '森林神殿',
    emoji: '🌳',
    bossPool: ['tag_008'],
    minionPool: ['tag_007', 'tag_009'],
    minGrade: 2,
    maxGrade: 6,
    dropRates: { star: 0.04, superstar: 0.005 },
    description: '由自然精靈守護的神秘森林。',
  },
  {
    areaId: 'area_thunder',
    name: '雷霆之巎',
    emoji: '⚡',
    bossPool: ['tag_010'],
    minionPool: ['tag_011', 'tag_012'],
    minGrade: 2,
    maxGrade: 6,
    dropRates: { star: 0.04, superstar: 0.005 },
    description: '風暴肆虐的山巔閃爍著電光。',
  },
  {
    areaId: 'area_phantom',
    name: '幽靈古堡',
    emoji: '👻',
    bossPool: ['tag_013'],
    minionPool: ['tag_014', 'tag_015'],
    minGrade: 3,
    maxGrade: 6,
    dropRates: { star: 0.06, superstar: 0.008 },
    description: '幽魂在鬧鬼的廳堂中遊蕩。',
  },
  {
    areaId: 'area_starfall',
    name: '星隕之頂',
    emoji: '🐉',
    bossPool: ['tag_016'],
    minionPool: ['tag_017', 'tag_018'],
    minGrade: 3,
    maxGrade: 6,
    dropRates: { star: 0.08, superstar: 0.02 },
    description: '傳說從宇宙降臨的最高峰。',
  },
];

export function getTagById(id: string): Tag | undefined {
  return ALL_TAGS.find(t => t.id === id) || RENTAL_TAGS.find(t => t.id === id);
}
