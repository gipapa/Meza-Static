export interface TagStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface TagMove {
  name: string;
  type: string;
  power: number;
}

export interface TagFlags {
  legendary?: boolean;
  mythical?: boolean;
  dynamax?: boolean;
  mega?: boolean;
  zmove?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  grade: number; // 2-6
  types: string[];
  pe: number;
  stats: TagStats;
  move: TagMove;
  flags: TagFlags;
}

export interface Area {
  areaId: string;
  name: string;
  emoji: string;
  bossPool: string[];
  minionPool: string[];
  minGrade: number;
  maxGrade: number;
  dropRates: { star: number; superstar: number };
  description: string;
}

export interface TurnRecord {
  attackerLane: number;
  roulette: number;
  mashCount: number;
  damage: number;
}

export interface BattleState {
  area: Area;
  playerTags: Tag[];
  enemies: { boss: Tag; minions: Tag[] };
  turn: number;
  maxTurns: number;
  bossHp: number;
  bossMaxHp: number;
  catchGauge: number;
  turns: TurnRecord[];
  phase: 'select-attacker' | 'roulette' | 'mash' | 'damage' | 'done';
}

export type BallType = 'poke' | 'great' | 'ultra' | 'master';

export interface CatchState {
  phase: 'last-catch' | 'ball-roulette' | 'catching' | 'bonus' | 'bonus-ball' | 'result';
  targets: Tag[];
  selectedTarget: Tag | null;
  ballType: BallType | null;
  caught: boolean;
  catchGauge: number;
  bonusTarget: Tag | null;
  bonusCaught: boolean;
}

export interface TrainerProfile {
  nickname: string;
  avatarIndex: number;
  createdAt: string;
}

export interface GameStats {
  totalBattles: number;
  totalCatches: number;
  starCount: number;
  superstarCount: number;
}
