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

/* ------------------------------------------------------------------ */
/*  Generation I — 151 Pokémon (Kanto Pokédex)                        */
/*  Stats: HP / ATK(攻擊) / DEF(防禦) / SPD(速度)                      */
/*  pe = 種族值總和 (full base stat total from canonical sources)     */
/*  Grade: 1 (≤330) / 2 (331-410) / 3 (411-480) / 4 (481-524)        */
/*         5 (525-579) / 6 (≥580)                                     */
/* ------------------------------------------------------------------ */

export const ALL_TAGS: Tag[] = [
  { id: '001', name: '妙蛙種子', grade: 1, types: ['grass', 'poison'], pe: 318, stats: { hp: 45, atk: 49, def: 49, spd: 45 }, move: { name: '藤鞭', type: 'grass', power: 45 }, flags: {} },
  { id: '002', name: '妙蛙草', grade: 2, types: ['grass', 'poison'], pe: 405, stats: { hp: 60, atk: 62, def: 63, spd: 60 }, move: { name: '飛葉快刀', type: 'grass', power: 55 }, flags: {} },
  { id: '003', name: '妙蛙花', grade: 5, types: ['grass', 'poison'], pe: 525, stats: { hp: 80, atk: 82, def: 83, spd: 80 }, move: { name: '日光束', type: 'grass', power: 120 }, flags: {} },

  { id: '004', name: '小火龍', grade: 1, types: ['fire'], pe: 309, stats: { hp: 39, atk: 52, def: 43, spd: 65 }, move: { name: '火花', type: 'fire', power: 40 }, flags: {} },
  { id: '005', name: '火恐龍', grade: 2, types: ['fire'], pe: 405, stats: { hp: 58, atk: 64, def: 58, spd: 80 }, move: { name: '火焰牙', type: 'fire', power: 65 }, flags: {} },
  { id: '006', name: '噴火龍', grade: 5, types: ['fire', 'flying'], pe: 534, stats: { hp: 78, atk: 84, def: 78, spd: 100 }, move: { name: '大字爆炎', type: 'fire', power: 110 }, flags: {} },

  { id: '007', name: '傑尼龜', grade: 1, types: ['water'], pe: 314, stats: { hp: 44, atk: 48, def: 65, spd: 43 }, move: { name: '水槍', type: 'water', power: 40 }, flags: {} },
  { id: '008', name: '卡咪龜', grade: 2, types: ['water'], pe: 405, stats: { hp: 59, atk: 63, def: 80, spd: 58 }, move: { name: '水之波動', type: 'water', power: 60 }, flags: {} },
  { id: '009', name: '水箭龜', grade: 5, types: ['water'], pe: 530, stats: { hp: 79, atk: 83, def: 100, spd: 78 }, move: { name: '水炮', type: 'water', power: 110 }, flags: {} },

  { id: '010', name: '綠毛蟲', grade: 1, types: ['bug'], pe: 195, stats: { hp: 45, atk: 30, def: 35, spd: 45 }, move: { name: '蟲咬', type: 'bug', power: 60 }, flags: {} },
  { id: '011', name: '鐵甲蛹', grade: 1, types: ['bug'], pe: 205, stats: { hp: 50, atk: 20, def: 55, spd: 30 }, move: { name: '撞擊', type: 'normal', power: 40 }, flags: {} },
  { id: '012', name: '巴大蝶', grade: 2, types: ['bug', 'flying'], pe: 395, stats: { hp: 60, atk: 45, def: 50, spd: 70 }, move: { name: '蟲鳴', type: 'bug', power: 90 }, flags: {} },

  { id: '013', name: '獨角蟲', grade: 1, types: ['bug', 'poison'], pe: 195, stats: { hp: 40, atk: 35, def: 30, spd: 50 }, move: { name: '毒針', type: 'poison', power: 15 }, flags: {} },
  { id: '014', name: '鐵殼蛹', grade: 1, types: ['bug', 'poison'], pe: 205, stats: { hp: 45, atk: 25, def: 50, spd: 35 }, move: { name: '撞擊', type: 'normal', power: 40 }, flags: {} },
  { id: '015', name: '大針蜂', grade: 2, types: ['bug', 'poison'], pe: 395, stats: { hp: 65, atk: 90, def: 40, spd: 75 }, move: { name: '毒擊', type: 'poison', power: 80 }, flags: {} },

  { id: '016', name: '波波', grade: 1, types: ['normal', 'flying'], pe: 251, stats: { hp: 40, atk: 45, def: 40, spd: 56 }, move: { name: '電光一閃', type: 'normal', power: 40 }, flags: {} },
  { id: '017', name: '比比鳥', grade: 2, types: ['normal', 'flying'], pe: 349, stats: { hp: 63, atk: 60, def: 55, spd: 71 }, move: { name: '翅膀攻擊', type: 'flying', power: 60 }, flags: {} },
  { id: '018', name: '大比鳥', grade: 3, types: ['normal', 'flying'], pe: 479, stats: { hp: 83, atk: 80, def: 75, spd: 101 }, move: { name: '暴風', type: 'flying', power: 110 }, flags: {} },

  { id: '019', name: '小拉達', grade: 1, types: ['normal'], pe: 253, stats: { hp: 30, atk: 56, def: 35, spd: 72 }, move: { name: '電光一閃', type: 'normal', power: 40 }, flags: {} },
  { id: '020', name: '拉達', grade: 3, types: ['normal'], pe: 413, stats: { hp: 55, atk: 81, def: 60, spd: 97 }, move: { name: '必殺門牙', type: 'normal', power: 80 }, flags: {} },

  { id: '021', name: '烈雀', grade: 1, types: ['normal', 'flying'], pe: 262, stats: { hp: 40, atk: 60, def: 30, spd: 70 }, move: { name: '啄', type: 'flying', power: 35 }, flags: {} },
  { id: '022', name: '大嘴雀', grade: 3, types: ['normal', 'flying'], pe: 442, stats: { hp: 65, atk: 90, def: 65, spd: 100 }, move: { name: '鑽喙', type: 'flying', power: 80 }, flags: {} },

  { id: '023', name: '阿柏蛇', grade: 1, types: ['poison'], pe: 288, stats: { hp: 35, atk: 60, def: 44, spd: 55 }, move: { name: '溶解液', type: 'poison', power: 40 }, flags: {} },
  { id: '024', name: '阿柏怪', grade: 3, types: ['poison'], pe: 448, stats: { hp: 60, atk: 95, def: 69, spd: 80 }, move: { name: '毒擊', type: 'poison', power: 80 }, flags: {} },

  { id: '025', name: '皮卡丘', grade: 1, types: ['electric'], pe: 320, stats: { hp: 35, atk: 55, def: 40, spd: 90 }, move: { name: '十萬伏特', type: 'electric', power: 90 }, flags: {} },
  { id: '026', name: '雷丘', grade: 4, types: ['electric'], pe: 485, stats: { hp: 60, atk: 90, def: 55, spd: 110 }, move: { name: '打雷', type: 'electric', power: 110 }, flags: {} },

  { id: '027', name: '穿山鼠', grade: 1, types: ['ground'], pe: 300, stats: { hp: 50, atk: 75, def: 85, spd: 40 }, move: { name: '泥巴射擊', type: 'ground', power: 55 }, flags: {} },
  { id: '028', name: '穿山王', grade: 3, types: ['ground'], pe: 450, stats: { hp: 75, atk: 100, def: 110, spd: 65 }, move: { name: '地震', type: 'ground', power: 100 }, flags: {} },

  { id: '029', name: '尼多蘭', grade: 1, types: ['poison'], pe: 275, stats: { hp: 55, atk: 47, def: 52, spd: 41 }, move: { name: '咬住', type: 'dark', power: 60 }, flags: {} },
  { id: '030', name: '尼多娜', grade: 2, types: ['poison'], pe: 365, stats: { hp: 70, atk: 62, def: 67, spd: 56 }, move: { name: '毒擊', type: 'poison', power: 80 }, flags: {} },
  { id: '031', name: '尼多后', grade: 4, types: ['poison', 'ground'], pe: 505, stats: { hp: 90, atk: 92, def: 87, spd: 76 }, move: { name: '大地之力', type: 'ground', power: 90 }, flags: {} },

  { id: '032', name: '尼多朗', grade: 1, types: ['poison'], pe: 273, stats: { hp: 46, atk: 57, def: 40, spd: 50 }, move: { name: '角撞', type: 'normal', power: 65 }, flags: {} },
  { id: '033', name: '尼多力諾', grade: 2, types: ['poison'], pe: 365, stats: { hp: 61, atk: 72, def: 57, spd: 65 }, move: { name: '毒擊', type: 'poison', power: 80 }, flags: {} },
  { id: '034', name: '尼多王', grade: 4, types: ['poison', 'ground'], pe: 505, stats: { hp: 81, atk: 102, def: 77, spd: 85 }, move: { name: '大地之力', type: 'ground', power: 90 }, flags: {} },

  { id: '035', name: '皮皮', grade: 1, types: ['fairy'], pe: 323, stats: { hp: 70, atk: 45, def: 48, spd: 35 }, move: { name: '月亮之力', type: 'fairy', power: 95 }, flags: {} },
  { id: '036', name: '皮可西', grade: 4, types: ['fairy'], pe: 483, stats: { hp: 95, atk: 70, def: 73, spd: 60 }, move: { name: '月亮之力', type: 'fairy', power: 95 }, flags: {} },

  { id: '037', name: '六尾', grade: 1, types: ['fire'], pe: 299, stats: { hp: 38, atk: 41, def: 40, spd: 65 }, move: { name: '火花', type: 'fire', power: 40 }, flags: {} },
  { id: '038', name: '九尾', grade: 4, types: ['fire'], pe: 505, stats: { hp: 73, atk: 76, def: 75, spd: 100 }, move: { name: '噴射火焰', type: 'fire', power: 90 }, flags: {} },

  { id: '039', name: '胖丁', grade: 1, types: ['normal', 'fairy'], pe: 270, stats: { hp: 115, atk: 45, def: 20, spd: 20 }, move: { name: '泰山壓頂', type: 'normal', power: 85 }, flags: {} },
  { id: '040', name: '胖可丁', grade: 3, types: ['normal', 'fairy'], pe: 435, stats: { hp: 140, atk: 70, def: 45, spd: 45 }, move: { name: '捨身撞擊', type: 'normal', power: 120 }, flags: {} },

  { id: '041', name: '超音蝠', grade: 1, types: ['poison', 'flying'], pe: 245, stats: { hp: 40, atk: 45, def: 35, spd: 55 }, move: { name: '空氣利刃', type: 'flying', power: 60 }, flags: {} },
  { id: '042', name: '大嘴蝠', grade: 3, types: ['poison', 'flying'], pe: 455, stats: { hp: 75, atk: 80, def: 70, spd: 90 }, move: { name: '毒擊', type: 'poison', power: 80 }, flags: {} },

  { id: '043', name: '走路草', grade: 1, types: ['grass', 'poison'], pe: 320, stats: { hp: 45, atk: 50, def: 55, spd: 30 }, move: { name: '吸取', type: 'grass', power: 50 }, flags: {} },
  { id: '044', name: '臭臭花', grade: 2, types: ['grass', 'poison'], pe: 395, stats: { hp: 60, atk: 65, def: 70, spd: 40 }, move: { name: '飛葉快刀', type: 'grass', power: 55 }, flags: {} },
  { id: '045', name: '霸王花', grade: 4, types: ['grass', 'poison'], pe: 490, stats: { hp: 75, atk: 80, def: 85, spd: 50 }, move: { name: '花瓣舞', type: 'grass', power: 120 }, flags: {} },

  { id: '046', name: '派拉斯', grade: 1, types: ['bug', 'grass'], pe: 285, stats: { hp: 35, atk: 70, def: 55, spd: 25 }, move: { name: '蟲咬', type: 'bug', power: 60 }, flags: {} },
  { id: '047', name: '派拉斯特', grade: 2, types: ['bug', 'grass'], pe: 405, stats: { hp: 60, atk: 95, def: 80, spd: 30 }, move: { name: '十字剪', type: 'bug', power: 80 }, flags: {} },

  { id: '048', name: '毛球', grade: 1, types: ['bug', 'poison'], pe: 305, stats: { hp: 60, atk: 55, def: 50, spd: 45 }, move: { name: '蟲咬', type: 'bug', power: 60 }, flags: {} },
  { id: '049', name: '摩魯蛾', grade: 3, types: ['bug', 'poison'], pe: 450, stats: { hp: 70, atk: 65, def: 60, spd: 90 }, move: { name: '蟲鳴', type: 'bug', power: 90 }, flags: {} },

  { id: '050', name: '地鼠', grade: 1, types: ['ground'], pe: 265, stats: { hp: 10, atk: 55, def: 25, spd: 95 }, move: { name: '挖洞', type: 'ground', power: 80 }, flags: {} },
  { id: '051', name: '三地鼠', grade: 3, types: ['ground'], pe: 425, stats: { hp: 35, atk: 100, def: 50, spd: 120 }, move: { name: '地震', type: 'ground', power: 100 }, flags: {} },

  { id: '052', name: '喵喵', grade: 1, types: ['normal'], pe: 290, stats: { hp: 40, atk: 45, def: 35, spd: 90 }, move: { name: '劈開', type: 'normal', power: 70 }, flags: {} },
  { id: '053', name: '貓老大', grade: 3, types: ['normal'], pe: 440, stats: { hp: 65, atk: 70, def: 60, spd: 115 }, move: { name: '劈開', type: 'normal', power: 70 }, flags: {} },

  { id: '054', name: '可達鴨', grade: 1, types: ['water'], pe: 320, stats: { hp: 50, atk: 52, def: 48, spd: 55 }, move: { name: '水之波動', type: 'water', power: 60 }, flags: {} },
  { id: '055', name: '哥達鴨', grade: 4, types: ['water'], pe: 500, stats: { hp: 80, atk: 82, def: 78, spd: 85 }, move: { name: '衝浪', type: 'water', power: 90 }, flags: {} },

  { id: '056', name: '猴怪', grade: 1, types: ['fighting'], pe: 305, stats: { hp: 40, atk: 80, def: 35, spd: 70 }, move: { name: '空手劈', type: 'fighting', power: 50 }, flags: {} },
  { id: '057', name: '火暴猴', grade: 3, types: ['fighting'], pe: 455, stats: { hp: 65, atk: 105, def: 60, spd: 95 }, move: { name: '近身戰', type: 'fighting', power: 120 }, flags: {} },

  { id: '058', name: '卡蒂狗', grade: 2, types: ['fire'], pe: 350, stats: { hp: 55, atk: 70, def: 45, spd: 60 }, move: { name: '火焰牙', type: 'fire', power: 65 }, flags: {} },
  { id: '059', name: '風速狗', grade: 5, types: ['fire'], pe: 555, stats: { hp: 90, atk: 110, def: 80, spd: 95 }, move: { name: '閃焰衝鋒', type: 'fire', power: 120 }, flags: {} },

  { id: '060', name: '蚊香蝌蚪', grade: 1, types: ['water'], pe: 300, stats: { hp: 40, atk: 50, def: 40, spd: 90 }, move: { name: '泡沫', type: 'water', power: 40 }, flags: {} },
  { id: '061', name: '蚊香君', grade: 2, types: ['water'], pe: 385, stats: { hp: 65, atk: 65, def: 65, spd: 90 }, move: { name: '水之波動', type: 'water', power: 60 }, flags: {} },
  { id: '062', name: '蚊香泳士', grade: 4, types: ['water', 'fighting'], pe: 510, stats: { hp: 90, atk: 95, def: 95, spd: 70 }, move: { name: '衝浪', type: 'water', power: 90 }, flags: {} },

  { id: '063', name: '凱西', grade: 1, types: ['psychic'], pe: 310, stats: { hp: 25, atk: 20, def: 15, spd: 90 }, move: { name: '念力', type: 'psychic', power: 50 }, flags: {} },
  { id: '064', name: '勇基拉', grade: 2, types: ['psychic'], pe: 400, stats: { hp: 40, atk: 35, def: 30, spd: 105 }, move: { name: '幻象光線', type: 'psychic', power: 65 }, flags: {} },
  { id: '065', name: '胡地', grade: 4, types: ['psychic'], pe: 500, stats: { hp: 55, atk: 50, def: 45, spd: 120 }, move: { name: '精神強念', type: 'psychic', power: 90 }, flags: {} },

  { id: '066', name: '腕力', grade: 1, types: ['fighting'], pe: 305, stats: { hp: 70, atk: 80, def: 50, spd: 35 }, move: { name: '空手劈', type: 'fighting', power: 50 }, flags: {} },
  { id: '067', name: '豪力', grade: 2, types: ['fighting'], pe: 405, stats: { hp: 80, atk: 100, def: 70, spd: 45 }, move: { name: '劈瓦', type: 'fighting', power: 75 }, flags: {} },
  { id: '068', name: '怪力', grade: 4, types: ['fighting'], pe: 505, stats: { hp: 90, atk: 130, def: 80, spd: 55 }, move: { name: '爆裂拳', type: 'fighting', power: 100 }, flags: {} },

  { id: '069', name: '喇叭芽', grade: 1, types: ['grass', 'poison'], pe: 300, stats: { hp: 50, atk: 75, def: 35, spd: 40 }, move: { name: '藤鞭', type: 'grass', power: 45 }, flags: {} },
  { id: '070', name: '口呆花', grade: 2, types: ['grass', 'poison'], pe: 390, stats: { hp: 65, atk: 90, def: 50, spd: 55 }, move: { name: '飛葉快刀', type: 'grass', power: 55 }, flags: {} },
  { id: '071', name: '大食花', grade: 4, types: ['grass', 'poison'], pe: 490, stats: { hp: 80, atk: 105, def: 65, spd: 70 }, move: { name: '強力鞭打', type: 'grass', power: 120 }, flags: {} },

  { id: '072', name: '瑪瑙水母', grade: 2, types: ['water', 'poison'], pe: 335, stats: { hp: 40, atk: 40, def: 35, spd: 70 }, move: { name: '泡沫光線', type: 'water', power: 65 }, flags: {} },
  { id: '073', name: '毒刺水母', grade: 4, types: ['water', 'poison'], pe: 515, stats: { hp: 80, atk: 70, def: 65, spd: 100 }, move: { name: '衝浪', type: 'water', power: 90 }, flags: {} },

  { id: '074', name: '小拳石', grade: 1, types: ['rock', 'ground'], pe: 300, stats: { hp: 40, atk: 80, def: 100, spd: 20 }, move: { name: '落石', type: 'rock', power: 50 }, flags: {} },
  { id: '075', name: '隆隆石', grade: 2, types: ['rock', 'ground'], pe: 390, stats: { hp: 55, atk: 95, def: 115, spd: 35 }, move: { name: '岩崩', type: 'rock', power: 75 }, flags: {} },
  { id: '076', name: '隆隆岩', grade: 4, types: ['rock', 'ground'], pe: 495, stats: { hp: 80, atk: 120, def: 130, spd: 45 }, move: { name: '地震', type: 'ground', power: 100 }, flags: {} },

  { id: '077', name: '小火馬', grade: 2, types: ['fire'], pe: 410, stats: { hp: 50, atk: 85, def: 55, spd: 90 }, move: { name: '火焰車', type: 'fire', power: 60 }, flags: {} },
  { id: '078', name: '烈焰馬', grade: 4, types: ['fire'], pe: 500, stats: { hp: 65, atk: 100, def: 70, spd: 105 }, move: { name: '閃焰衝鋒', type: 'fire', power: 120 }, flags: {} },

  { id: '079', name: '呆呆獸', grade: 1, types: ['water', 'psychic'], pe: 315, stats: { hp: 90, atk: 65, def: 65, spd: 15 }, move: { name: '水槍', type: 'water', power: 40 }, flags: {} },
  { id: '080', name: '呆殼獸', grade: 4, types: ['water', 'psychic'], pe: 490, stats: { hp: 95, atk: 75, def: 110, spd: 30 }, move: { name: '衝浪', type: 'water', power: 90 }, flags: {} },

  { id: '081', name: '小磁怪', grade: 1, types: ['electric', 'steel'], pe: 325, stats: { hp: 25, atk: 35, def: 70, spd: 45 }, move: { name: '電擊', type: 'electric', power: 40 }, flags: {} },
  { id: '082', name: '三合一磁怪', grade: 3, types: ['electric', 'steel'], pe: 465, stats: { hp: 50, atk: 60, def: 95, spd: 70 }, move: { name: '十萬伏特', type: 'electric', power: 90 }, flags: {} },

  { id: '083', name: '大蔥鴨', grade: 2, types: ['normal', 'flying'], pe: 377, stats: { hp: 52, atk: 90, def: 55, spd: 60 }, move: { name: '劈開', type: 'normal', power: 70 }, flags: {} },

  { id: '084', name: '嘟嘟', grade: 1, types: ['normal', 'flying'], pe: 310, stats: { hp: 35, atk: 85, def: 45, spd: 75 }, move: { name: '啄', type: 'flying', power: 35 }, flags: {} },
  { id: '085', name: '嘟嘟利', grade: 3, types: ['normal', 'flying'], pe: 470, stats: { hp: 60, atk: 110, def: 70, spd: 110 }, move: { name: '鑽喙', type: 'flying', power: 80 }, flags: {} },

  { id: '086', name: '小海獅', grade: 1, types: ['water'], pe: 325, stats: { hp: 65, atk: 45, def: 55, spd: 45 }, move: { name: '極光束', type: 'ice', power: 65 }, flags: {} },
  { id: '087', name: '白海獅', grade: 3, types: ['water', 'ice'], pe: 475, stats: { hp: 90, atk: 70, def: 80, spd: 70 }, move: { name: '冰凍光束', type: 'ice', power: 90 }, flags: {} },

  { id: '088', name: '臭泥', grade: 1, types: ['poison'], pe: 325, stats: { hp: 80, atk: 80, def: 50, spd: 25 }, move: { name: '污泥攻擊', type: 'poison', power: 65 }, flags: {} },
  { id: '089', name: '臭臭泥', grade: 4, types: ['poison'], pe: 500, stats: { hp: 105, atk: 105, def: 75, spd: 50 }, move: { name: '污泥炸彈', type: 'poison', power: 90 }, flags: {} },

  { id: '090', name: '大舌貝', grade: 1, types: ['water'], pe: 305, stats: { hp: 30, atk: 65, def: 100, spd: 40 }, move: { name: '冰錐', type: 'ice', power: 40 }, flags: {} },
  { id: '091', name: '刺甲貝', grade: 5, types: ['water', 'ice'], pe: 525, stats: { hp: 50, atk: 95, def: 180, spd: 70 }, move: { name: '冰凍光束', type: 'ice', power: 90 }, flags: {} },

  { id: '092', name: '鬼斯', grade: 1, types: ['ghost', 'poison'], pe: 310, stats: { hp: 30, atk: 35, def: 30, spd: 80 }, move: { name: '舔舐', type: 'ghost', power: 30 }, flags: {} },
  { id: '093', name: '鬼斯通', grade: 2, types: ['ghost', 'poison'], pe: 405, stats: { hp: 45, atk: 50, def: 45, spd: 95 }, move: { name: '暗影球', type: 'ghost', power: 80 }, flags: {} },
  { id: '094', name: '耿鬼', grade: 4, types: ['ghost', 'poison'], pe: 500, stats: { hp: 60, atk: 65, def: 60, spd: 110 }, move: { name: '暗影球', type: 'ghost', power: 80 }, flags: {} },

  { id: '095', name: '大岩蛇', grade: 2, types: ['rock', 'ground'], pe: 385, stats: { hp: 35, atk: 45, def: 160, spd: 70 }, move: { name: '岩崩', type: 'rock', power: 75 }, flags: {} },

  { id: '096', name: '催眠貘', grade: 1, types: ['psychic'], pe: 328, stats: { hp: 60, atk: 48, def: 45, spd: 42 }, move: { name: '念力', type: 'psychic', power: 50 }, flags: {} },
  { id: '097', name: '引夢貘人', grade: 4, types: ['psychic'], pe: 483, stats: { hp: 85, atk: 73, def: 70, spd: 67 }, move: { name: '精神強念', type: 'psychic', power: 90 }, flags: {} },

  { id: '098', name: '大鉗蟹', grade: 1, types: ['water'], pe: 325, stats: { hp: 30, atk: 105, def: 90, spd: 50 }, move: { name: '蟹鉗錘', type: 'water', power: 100 }, flags: {} },
  { id: '099', name: '巨鉗蟹', grade: 3, types: ['water'], pe: 475, stats: { hp: 55, atk: 130, def: 115, spd: 75 }, move: { name: '蟹鉗錘', type: 'water', power: 100 }, flags: {} },

  { id: '100', name: '霹靂電球', grade: 1, types: ['electric'], pe: 330, stats: { hp: 40, atk: 30, def: 50, spd: 100 }, move: { name: '電擊', type: 'electric', power: 40 }, flags: {} },
  { id: '101', name: '頑皮雷彈', grade: 4, types: ['electric'], pe: 490, stats: { hp: 60, atk: 50, def: 70, spd: 150 }, move: { name: '放電', type: 'electric', power: 80 }, flags: {} },

  { id: '102', name: '蛋蛋', grade: 1, types: ['grass', 'psychic'], pe: 325, stats: { hp: 60, atk: 40, def: 80, spd: 40 }, move: { name: '種子炸彈', type: 'grass', power: 80 }, flags: {} },
  { id: '103', name: '椰蛋樹', grade: 5, types: ['grass', 'psychic'], pe: 530, stats: { hp: 95, atk: 95, def: 85, spd: 55 }, move: { name: '精神強念', type: 'psychic', power: 90 }, flags: {} },

  { id: '104', name: '卡拉卡拉', grade: 1, types: ['ground'], pe: 320, stats: { hp: 50, atk: 50, def: 95, spd: 35 }, move: { name: '骨棒', type: 'ground', power: 65 }, flags: {} },
  { id: '105', name: '嘎啦嘎啦', grade: 3, types: ['ground'], pe: 425, stats: { hp: 60, atk: 80, def: 110, spd: 45 }, move: { name: '地震', type: 'ground', power: 100 }, flags: {} },

  { id: '106', name: '飛腿郎', grade: 3, types: ['fighting'], pe: 455, stats: { hp: 50, atk: 120, def: 53, spd: 87 }, move: { name: '百萬噸飛踢', type: 'fighting', power: 120 }, flags: {} },
  { id: '107', name: '快拳郎', grade: 3, types: ['fighting'], pe: 455, stats: { hp: 50, atk: 105, def: 79, spd: 76 }, move: { name: '近身戰', type: 'fighting', power: 120 }, flags: {} },

  { id: '108', name: '大舌頭', grade: 2, types: ['normal'], pe: 385, stats: { hp: 90, atk: 55, def: 75, spd: 30 }, move: { name: '泰山壓頂', type: 'normal', power: 85 }, flags: {} },

  { id: '109', name: '瓦斯彈', grade: 2, types: ['poison'], pe: 340, stats: { hp: 40, atk: 65, def: 95, spd: 35 }, move: { name: '污泥攻擊', type: 'poison', power: 65 }, flags: {} },
  { id: '110', name: '雙彈瓦斯', grade: 4, types: ['poison'], pe: 490, stats: { hp: 65, atk: 90, def: 120, spd: 60 }, move: { name: '污泥炸彈', type: 'poison', power: 90 }, flags: {} },

  { id: '111', name: '鐵甲犀牛', grade: 2, types: ['ground', 'rock'], pe: 345, stats: { hp: 80, atk: 85, def: 95, spd: 25 }, move: { name: '岩崩', type: 'rock', power: 75 }, flags: {} },
  { id: '112', name: '鑽角犀獸', grade: 4, types: ['ground', 'rock'], pe: 485, stats: { hp: 105, atk: 130, def: 120, spd: 40 }, move: { name: '地震', type: 'ground', power: 100 }, flags: {} },

  { id: '113', name: '吉利蛋', grade: 3, types: ['normal'], pe: 450, stats: { hp: 250, atk: 5, def: 5, spd: 50 }, move: { name: '泰山壓頂', type: 'normal', power: 85 }, flags: {} },

  { id: '114', name: '蔓藤怪', grade: 3, types: ['grass'], pe: 435, stats: { hp: 65, atk: 55, def: 115, spd: 60 }, move: { name: '強力鞭打', type: 'grass', power: 120 }, flags: {} },

  { id: '115', name: '袋獸', grade: 4, types: ['normal'], pe: 490, stats: { hp: 105, atk: 95, def: 80, spd: 90 }, move: { name: '百萬噸拳擊', type: 'normal', power: 80 }, flags: {} },

  { id: '116', name: '墨海馬', grade: 1, types: ['water'], pe: 295, stats: { hp: 30, atk: 40, def: 70, spd: 60 }, move: { name: '泡沫光線', type: 'water', power: 65 }, flags: {} },
  { id: '117', name: '海刺龍', grade: 3, types: ['water'], pe: 440, stats: { hp: 55, atk: 65, def: 95, spd: 85 }, move: { name: '衝浪', type: 'water', power: 90 }, flags: {} },

  { id: '118', name: '角金魚', grade: 1, types: ['water'], pe: 320, stats: { hp: 45, atk: 67, def: 60, spd: 63 }, move: { name: '角撞', type: 'normal', power: 65 }, flags: {} },
  { id: '119', name: '金魚王', grade: 3, types: ['water'], pe: 450, stats: { hp: 80, atk: 92, def: 65, spd: 68 }, move: { name: '瀑布', type: 'water', power: 80 }, flags: {} },

  { id: '120', name: '海星星', grade: 2, types: ['water'], pe: 340, stats: { hp: 30, atk: 45, def: 55, spd: 85 }, move: { name: '泡沫光線', type: 'water', power: 65 }, flags: {} },
  { id: '121', name: '寶石海星', grade: 4, types: ['water', 'psychic'], pe: 520, stats: { hp: 60, atk: 75, def: 85, spd: 115 }, move: { name: '衝浪', type: 'water', power: 90 }, flags: {} },

  { id: '122', name: '魔牆人偶', grade: 3, types: ['psychic', 'fairy'], pe: 460, stats: { hp: 40, atk: 45, def: 65, spd: 90 }, move: { name: '精神強念', type: 'psychic', power: 90 }, flags: {} },

  { id: '123', name: '飛天螳螂', grade: 4, types: ['bug', 'flying'], pe: 500, stats: { hp: 70, atk: 110, def: 80, spd: 105 }, move: { name: 'X剪刀', type: 'bug', power: 80 }, flags: {} },

  { id: '124', name: '迷唇姐', grade: 3, types: ['ice', 'psychic'], pe: 455, stats: { hp: 65, atk: 50, def: 35, spd: 95 }, move: { name: '暴風雪', type: 'ice', power: 110 }, flags: {} },

  { id: '125', name: '電擊獸', grade: 4, types: ['electric'], pe: 490, stats: { hp: 65, atk: 83, def: 57, spd: 105 }, move: { name: '十萬伏特', type: 'electric', power: 90 }, flags: {} },

  { id: '126', name: '鴨嘴火獸', grade: 4, types: ['fire'], pe: 495, stats: { hp: 65, atk: 95, def: 57, spd: 93 }, move: { name: '噴射火焰', type: 'fire', power: 90 }, flags: {} },

  { id: '127', name: '凱羅斯', grade: 4, types: ['bug'], pe: 500, stats: { hp: 65, atk: 125, def: 100, spd: 85 }, move: { name: 'X剪刀', type: 'bug', power: 80 }, flags: {} },

  { id: '128', name: '肯泰羅', grade: 4, types: ['normal'], pe: 490, stats: { hp: 75, atk: 100, def: 95, spd: 110 }, move: { name: '猛撞', type: 'normal', power: 90 }, flags: {} },

  { id: '129', name: '鯉魚王', grade: 1, types: ['water'], pe: 200, stats: { hp: 20, atk: 10, def: 55, spd: 80 }, move: { name: '撞擊', type: 'normal', power: 40 }, flags: {} },
  { id: '130', name: '暴鯉龍', grade: 5, types: ['water', 'flying'], pe: 540, stats: { hp: 95, atk: 125, def: 79, spd: 81 }, move: { name: '水流尾', type: 'water', power: 90 }, flags: {} },

  { id: '131', name: '拉普拉斯', grade: 5, types: ['water', 'ice'], pe: 535, stats: { hp: 130, atk: 85, def: 80, spd: 60 }, move: { name: '冰凍光束', type: 'ice', power: 90 }, flags: {} },

  { id: '132', name: '百變怪', grade: 1, types: ['normal'], pe: 288, stats: { hp: 48, atk: 48, def: 48, spd: 48 }, move: { name: '撞擊', type: 'normal', power: 40 }, flags: {} },

  { id: '133', name: '伊布', grade: 1, types: ['normal'], pe: 325, stats: { hp: 55, atk: 55, def: 50, spd: 55 }, move: { name: '電光一閃', type: 'normal', power: 40 }, flags: {} },

  { id: '134', name: '水伊布', grade: 5, types: ['water'], pe: 525, stats: { hp: 130, atk: 65, def: 60, spd: 65 }, move: { name: '衝浪', type: 'water', power: 90 }, flags: {} },
  { id: '135', name: '雷伊布', grade: 5, types: ['electric'], pe: 525, stats: { hp: 65, atk: 65, def: 60, spd: 130 }, move: { name: '十萬伏特', type: 'electric', power: 90 }, flags: {} },
  { id: '136', name: '火伊布', grade: 5, types: ['fire'], pe: 525, stats: { hp: 65, atk: 130, def: 60, spd: 65 }, move: { name: '噴射火焰', type: 'fire', power: 90 }, flags: {} },

  { id: '137', name: '多邊獸', grade: 2, types: ['normal'], pe: 395, stats: { hp: 65, atk: 60, def: 70, spd: 40 }, move: { name: '三角攻擊', type: 'normal', power: 80 }, flags: {} },

  { id: '138', name: '菊石獸', grade: 2, types: ['rock', 'water'], pe: 355, stats: { hp: 35, atk: 40, def: 100, spd: 35 }, move: { name: '水槍', type: 'water', power: 40 }, flags: {} },
  { id: '139', name: '多刺菊石獸', grade: 4, types: ['rock', 'water'], pe: 495, stats: { hp: 70, atk: 60, def: 125, spd: 55 }, move: { name: '衝浪', type: 'water', power: 90 }, flags: {} },

  { id: '140', name: '化石盔', grade: 2, types: ['rock', 'water'], pe: 355, stats: { hp: 30, atk: 80, def: 90, spd: 55 }, move: { name: '水槍', type: 'water', power: 40 }, flags: {} },
  { id: '141', name: '鐮刀盔', grade: 4, types: ['rock', 'water'], pe: 495, stats: { hp: 60, atk: 115, def: 105, spd: 80 }, move: { name: '岩崩', type: 'rock', power: 75 }, flags: {} },

  { id: '142', name: '化石翼龍', grade: 4, types: ['rock', 'flying'], pe: 515, stats: { hp: 80, atk: 105, def: 65, spd: 130 }, move: { name: '尖石攻擊', type: 'rock', power: 100 }, flags: {} },

  { id: '143', name: '卡比獸', grade: 5, types: ['normal'], pe: 540, stats: { hp: 160, atk: 110, def: 65, spd: 30 }, move: { name: '泰山壓頂', type: 'normal', power: 85 }, flags: {} },

  { id: '144', name: '急凍鳥', grade: 6, types: ['ice', 'flying'], pe: 580, stats: { hp: 90, atk: 85, def: 100, spd: 85 }, move: { name: '暴風雪', type: 'ice', power: 110 }, flags: { legendary: true } },
  { id: '145', name: '閃電鳥', grade: 6, types: ['electric', 'flying'], pe: 580, stats: { hp: 90, atk: 90, def: 85, spd: 100 }, move: { name: '打雷', type: 'electric', power: 110 }, flags: { legendary: true } },
  { id: '146', name: '火焰鳥', grade: 6, types: ['fire', 'flying'], pe: 580, stats: { hp: 90, atk: 100, def: 90, spd: 90 }, move: { name: '大字爆炎', type: 'fire', power: 110 }, flags: { legendary: true } },

  { id: '147', name: '迷你龍', grade: 1, types: ['dragon'], pe: 300, stats: { hp: 41, atk: 64, def: 45, spd: 50 }, move: { name: '龍捲風', type: 'dragon', power: 40 }, flags: {} },
  { id: '148', name: '哈克龍', grade: 3, types: ['dragon'], pe: 420, stats: { hp: 61, atk: 84, def: 65, spd: 70 }, move: { name: '龍之波動', type: 'dragon', power: 85 }, flags: {} },
  { id: '149', name: '快龍', grade: 6, types: ['dragon', 'flying'], pe: 600, stats: { hp: 91, atk: 134, def: 95, spd: 80 }, move: { name: '逆鱗', type: 'dragon', power: 120 }, flags: { legendary: true } },

  { id: '150', name: '超夢', grade: 6, types: ['psychic'], pe: 680, stats: { hp: 106, atk: 110, def: 90, spd: 130 }, move: { name: '精神擊破', type: 'psychic', power: 100 }, flags: { legendary: true } },
  { id: '151', name: '夢幻', grade: 6, types: ['psychic'], pe: 600, stats: { hp: 100, atk: 100, def: 100, spd: 100 }, move: { name: '精神強念', type: 'psychic', power: 90 }, flags: { legendary: true, mythical: true } },
];

export const RENTAL_TAGS: Tag[] = [
  { id: 'rental_001', name: '小火龍', grade: 1, types: ['fire'], pe: 309, stats: { hp: 39, atk: 52, def: 43, spd: 65 }, move: { name: '火花', type: 'fire', power: 40 }, flags: {} },
  { id: 'rental_002', name: '傑尼龜', grade: 1, types: ['water'], pe: 314, stats: { hp: 44, atk: 48, def: 65, spd: 43 }, move: { name: '水槍', type: 'water', power: 40 }, flags: {} },
  { id: 'rental_003', name: '妙蛙種子', grade: 1, types: ['grass', 'poison'], pe: 318, stats: { hp: 45, atk: 49, def: 49, spd: 45 }, move: { name: '藤鞭', type: 'grass', power: 45 }, flags: {} },
];

export const AREAS: Area[] = [
  {
    areaId: 'area_volcano',
    name: '燼焰火山',
    emoji: '🌋',
    bossPool: ['006', '059', '078', '126'],
    minionPool: ['004', '005', '037', '038', '058', '077', '136'],
    minGrade: 1,
    maxGrade: 6,
    dropRates: { star: 0.04, superstar: 0.005 },
    description: '烈焰燃燒的怒火之山。',
  },
  {
    areaId: 'area_coast',
    name: '蒼藍海岸',
    emoji: '🌊',
    bossPool: ['009', '130', '131', '073'],
    minionPool: ['007', '008', '060', '061', '116', '117', '120', '090'],
    minGrade: 1,
    maxGrade: 6,
    dropRates: { star: 0.06, superstar: 0.008 },
    description: '深海之中潛藏著遠古巨獸。',
  },
  {
    areaId: 'area_forest',
    name: '森林神殿',
    emoji: '🌳',
    bossPool: ['003', '045', '071', '103'],
    minionPool: ['001', '002', '043', '044', '069', '070', '046'],
    minGrade: 1,
    maxGrade: 6,
    dropRates: { star: 0.04, superstar: 0.005 },
    description: '由自然精靈守護的神秘森林。',
  },
  {
    areaId: 'area_thunder',
    name: '雷霆之巔',
    emoji: '⚡',
    bossPool: ['026', '082', '125', '135'],
    minionPool: ['025', '081', '100', '101'],
    minGrade: 1,
    maxGrade: 6,
    dropRates: { star: 0.04, superstar: 0.005 },
    description: '風暴肆虐的山巔閃爍著電光。',
  },
  {
    areaId: 'area_phantom',
    name: '幽靈古堡',
    emoji: '👻',
    bossPool: ['094', '065', '097', '124'],
    minionPool: ['092', '093', '063', '064', '096', '122'],
    minGrade: 1,
    maxGrade: 6,
    dropRates: { star: 0.06, superstar: 0.008 },
    description: '幽魂在鬧鬼的廳堂中遊蕩。',
  },
  {
    areaId: 'area_starfall',
    name: '星隕之頂',
    emoji: '🐉',
    bossPool: ['149', '150', '144', '145', '146'],
    minionPool: ['147', '148', '142', '143', '151'],
    minGrade: 2,
    maxGrade: 6,
    dropRates: { star: 0.08, superstar: 0.02 },
    description: '傳說從宇宙降臨的最高峰。',
  },
];

export function getTagById(id: string): Tag | undefined {
  return ALL_TAGS.find(t => t.id === id) || RENTAL_TAGS.find(t => t.id === id);
}

