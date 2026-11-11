import { FIRE_BLAST_TIMELINE } from './fireBlastTimeline.ts';
import { EMBER_TIMELINE } from './emberTimeline.ts';
import { FIRE_FANG_TIMELINE } from './fireFangTimeline.ts';
import { FLAME_WHEEL_TIMELINE } from './flameWheelTimeline.ts';
import { FLARE_BLITZ_TIMELINE } from './flareBlitzTimeline.ts';
import { FLAMETHROWER_TIMELINE } from './flamethrowerTimeline.ts';
import { WATER_PULSE_TIMELINE } from './waterPulseTimeline.ts';
import { AQUA_TAIL_TIMELINE } from './aquaTailTimeline.ts';
import { HYDRO_PUMP_TIMELINE } from './hydroPumpTimeline.ts';
import { WATER_GUN_TIMELINE } from './waterGunTimeline.ts';
import { BUBBLE_TIMELINE } from './bubbleTimeline.ts';
import { BUBBLE_BEAM_TIMELINE } from './bubbleBeamTimeline.ts';
import { SURF_TIMELINE } from './surfTimeline.ts';
import { WATERFALL_TIMELINE } from './waterfallTimeline.ts';
import { CRABHAMMER_TIMELINE } from './crabhammerTimeline.ts';
import { ABSORB_TIMELINE } from './absorbTimeline.ts';
import { RAZOR_LEAF_TIMELINE } from './razorLeafTimeline.ts';
import { POWER_WHIP_TIMELINE } from './powerWhipTimeline.ts';
import { SEED_BOMB_TIMELINE } from './seedBombTimeline.ts';
import { VINE_WHIP_TIMELINE } from './vineWhipTimeline.ts';
import { THUNDERBOLT_TIMELINE } from './thunderboltTimeline.ts';
import { THUNDER_TIMELINE } from './thunderTimeline.ts';
import { DISCHARGE_TIMELINE } from './dischargeTimeline.ts';
import { THUNDER_SHOCK_TIMELINE } from './thunderShockTimeline.ts';
import { PSYBEAM_TIMELINE } from './psybeamTimeline.ts';
import { CONFUSION_TIMELINE } from './confusionTimeline.ts';
import { PSYCHIC_TIMELINE } from './psychicTimeline.ts';
import { PSYSTRIKE_TIMELINE } from './psystrikeTimeline.ts';
import { BITE_TIMELINE } from './biteTimeline.ts';
import { DRAGON_PULSE_TIMELINE } from './dragonPulseTimeline.ts';
import { TWISTER_TIMELINE } from './twisterTimeline.ts';
import { MOONBLAST_TIMELINE } from './moonblastTimeline.ts';
import { MEGA_KICK_TIMELINE } from './megaKickTimeline.ts';
import { KARATE_CHOP_TIMELINE } from './karateChopTimeline.ts';
import { CLOSE_COMBAT_TIMELINE } from './closeCombatTimeline.ts';
import { BRICK_BREAK_TIMELINE } from './brickBreakTimeline.ts';
import { DYNAMIC_PUNCH_TIMELINE } from './dynamicPunchTimeline.ts';
import { TRI_ATTACK_TIMELINE } from './triAttackTimeline.ts';
import { HYPER_FANG_TIMELINE } from './hyperFangTimeline.ts';
import { MEGA_PUNCH_TIMELINE } from './megaPunchTimeline.ts';
import { HORN_ATTACK_TIMELINE } from './hornAttackTimeline.ts';
import { BODY_SLAM_TIMELINE } from './bodySlamTimeline.ts';
import { DOUBLE_EDGE_TIMELINE } from './doubleEdgeTimeline.ts';
import { TAKE_DOWN_TIMELINE } from './takeDownTimeline.ts';
import { QUICK_ATTACK_TIMELINE } from './quickAttackTimeline.ts';
import { SLASH_TIMELINE } from './slashTimeline.ts';
import { TACKLE_TIMELINE } from './tackleTimeline.ts';
import { ICE_BEAM_TIMELINE } from './iceBeamTimeline.ts';
import { ICICLE_SPEAR_TIMELINE } from './icicleSpearTimeline.ts';
import { AURORA_BEAM_TIMELINE } from './auroraBeamTimeline.ts';
import { BLIZZARD_TIMELINE } from './blizzardTimeline.ts';
import { SHADOW_BALL_TIMELINE } from './shadowBallTimeline.ts';
import { LICK_TIMELINE } from './lickTimeline.ts';
import { SLUDGE_TIMELINE } from './sludgeTimeline.ts';
import { SLUDGE_BOMB_TIMELINE } from './sludgeBombTimeline.ts';
import { POISON_STING_TIMELINE } from './poisonStingTimeline.ts';
import { POISON_JAB_TIMELINE } from './poisonJabTimeline.ts';
import { ACID_TIMELINE } from './acidTimeline.ts';
import { EARTH_POWER_TIMELINE } from './earthPowerTimeline.ts';
import { EARTHQUAKE_TIMELINE } from './earthquakeTimeline.ts';
import { MUD_SHOT_TIMELINE } from './mudShotTimeline.ts';
import { DIG_TIMELINE } from './digTimeline.ts';
import { BONE_CLUB_TIMELINE } from './boneClubTimeline.ts';
import { AIR_SLASH_TIMELINE } from './airSlashTimeline.ts';
import { WING_ATTACK_TIMELINE } from './wingAttackTimeline.ts';
import { PECK_TIMELINE } from './peckTimeline.ts';
import { HURRICANE_TIMELINE } from './hurricaneTimeline.ts';
import { DRILL_PECK_TIMELINE } from './drillPeckTimeline.ts';
import { X_SCISSOR_TIMELINE } from './xScissorTimeline.ts';
import { BUG_BITE_TIMELINE } from './bugBiteTimeline.ts';
import { BUG_BUZZ_TIMELINE } from './bugBuzzTimeline.ts';
import { X_SCISSORS_TIMELINE } from './xScissorsTimeline.ts';
import { STONE_EDGE_TIMELINE } from './stoneEdgeTimeline.ts';
import { ROCK_SLIDE_TIMELINE } from './rockSlideTimeline.ts';
import { ROCK_THROW_TIMELINE } from './rockThrowTimeline.ts';
/* ────────────────────────────────────────────────────────────────────
 *  Cinematic id → timeline. Pure (no Phaser), so `npm test` can check
 *  every registered cinematic against the 60 s spec (spec.ts).
 *
 *  CinematicId is the single source of truth for valid ids: registry.ts
 *  (scenes) and moveAnimations.ts (move names) are typed against it, so a
 *  move can't point at a missing cinematic and every cinematic needs a scene.
 *  ──────────────────────────────────────────────────────────────────── */
import { PETAL_DANCE_TIMELINE } from './petalDanceTimeline.ts';
import { SOLAR_BEAM_TIMELINE } from './solarBeamTimeline.ts';
import { OUTRAGE_TIMELINE } from './outrageTimeline.ts';
import type { CinematicTimeline } from './timeline.ts';

export const CINEMATIC_TIMELINES = {
  'petal-dance': PETAL_DANCE_TIMELINE,
  'solar-beam': SOLAR_BEAM_TIMELINE,
  outrage: OUTRAGE_TIMELINE,
  'fire-blast': FIRE_BLAST_TIMELINE,
  'ember': EMBER_TIMELINE,
  'fire-fang': FIRE_FANG_TIMELINE,
  'flame-wheel': FLAME_WHEEL_TIMELINE,
  'flare-blitz': FLARE_BLITZ_TIMELINE,
  'flamethrower': FLAMETHROWER_TIMELINE,
  'water-pulse': WATER_PULSE_TIMELINE,
  'aqua-tail': AQUA_TAIL_TIMELINE,
  'hydro-pump': HYDRO_PUMP_TIMELINE,
  'water-gun': WATER_GUN_TIMELINE,
  'bubble': BUBBLE_TIMELINE,
  'bubble-beam': BUBBLE_BEAM_TIMELINE,
  'surf': SURF_TIMELINE,
  'waterfall': WATERFALL_TIMELINE,
  'crabhammer': CRABHAMMER_TIMELINE,
  'absorb': ABSORB_TIMELINE,
  'razor-leaf': RAZOR_LEAF_TIMELINE,
  'power-whip': POWER_WHIP_TIMELINE,
  'seed-bomb': SEED_BOMB_TIMELINE,
  'vine-whip': VINE_WHIP_TIMELINE,
  'thunderbolt': THUNDERBOLT_TIMELINE,
  'thunder': THUNDER_TIMELINE,
  'discharge': DISCHARGE_TIMELINE,
  'thunder-shock': THUNDER_SHOCK_TIMELINE,
  'psybeam': PSYBEAM_TIMELINE,
  'confusion': CONFUSION_TIMELINE,
  'psychic': PSYCHIC_TIMELINE,
  'psystrike': PSYSTRIKE_TIMELINE,
  'bite': BITE_TIMELINE,
  'dragon-pulse': DRAGON_PULSE_TIMELINE,
  'twister': TWISTER_TIMELINE,
  'moonblast': MOONBLAST_TIMELINE,
  'mega-kick': MEGA_KICK_TIMELINE,
  'karate-chop': KARATE_CHOP_TIMELINE,
  'close-combat': CLOSE_COMBAT_TIMELINE,
  'brick-break': BRICK_BREAK_TIMELINE,
  'dynamic-punch': DYNAMIC_PUNCH_TIMELINE,
  'tri-attack': TRI_ATTACK_TIMELINE,
  'hyper-fang': HYPER_FANG_TIMELINE,
  'mega-punch': MEGA_PUNCH_TIMELINE,
  'horn-attack': HORN_ATTACK_TIMELINE,
  'body-slam': BODY_SLAM_TIMELINE,
  'double-edge': DOUBLE_EDGE_TIMELINE,
  'take-down': TAKE_DOWN_TIMELINE,
  'quick-attack': QUICK_ATTACK_TIMELINE,
  'slash': SLASH_TIMELINE,
  'tackle': TACKLE_TIMELINE,
  'ice-beam': ICE_BEAM_TIMELINE,
  'icicle-spear': ICICLE_SPEAR_TIMELINE,
  'aurora-beam': AURORA_BEAM_TIMELINE,
  'blizzard': BLIZZARD_TIMELINE,
  'shadow-ball': SHADOW_BALL_TIMELINE,
  'lick': LICK_TIMELINE,
  'sludge': SLUDGE_TIMELINE,
  'sludge-bomb': SLUDGE_BOMB_TIMELINE,
  'poison-sting': POISON_STING_TIMELINE,
  'poison-jab': POISON_JAB_TIMELINE,
  'acid': ACID_TIMELINE,
  'earth-power': EARTH_POWER_TIMELINE,
  'earthquake': EARTHQUAKE_TIMELINE,
  'mud-shot': MUD_SHOT_TIMELINE,
  'dig': DIG_TIMELINE,
  'bone-club': BONE_CLUB_TIMELINE,
  'air-slash': AIR_SLASH_TIMELINE,
  'wing-attack': WING_ATTACK_TIMELINE,
  'peck': PECK_TIMELINE,
  'hurricane': HURRICANE_TIMELINE,
  'drill-peck': DRILL_PECK_TIMELINE,
  'x-scissor': X_SCISSOR_TIMELINE,
  'bug-bite': BUG_BITE_TIMELINE,
  'bug-buzz': BUG_BUZZ_TIMELINE,
  'x-scissors': X_SCISSORS_TIMELINE,
  'stone-edge': STONE_EDGE_TIMELINE,
  'rock-slide': ROCK_SLIDE_TIMELINE,
  'rock-throw': ROCK_THROW_TIMELINE,
} as const satisfies Record<string, CinematicTimeline>;

export type CinematicId = keyof typeof CINEMATIC_TIMELINES;
