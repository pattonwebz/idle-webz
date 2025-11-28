/**
 * Game configuration constants
 */

/** Auto-save interval in milliseconds (60 seconds) */
export const AUTO_SAVE_INTERVAL = 60000;

/** LocalStorage key for game save data */
export const SAVE_KEY = 'incrementalClickerSave';

/** Base resources gained per manual click */
export const BASE_CLICK_POWER = 1; // Will act as base for click and baseCharValue scaling later

/** Threshold for switching to scientific notation */
export const SCIENTIFIC_NOTATION_THRESHOLD = 100000;

/** Default cost multiplier for producers */
export const DEFAULT_COST_MULTIPLIER = 1.16; // Slightly smoother ramp for new theme

/** Game update rate (60 fps) */
export const GAME_UPDATE_FPS = 10;

/**
 * Typing mechanic configuration (base values, bonuses, caps)
 */
export const WORD_BOUNDARIES = new Set<string>([' ', '\n', '\t', '.', ',', '!', '?', ';', ':']);

export const TYPING_CONFIG = {
  /** Resources gained per valid character */
  baseCharValue: 0.2,
  /** Additional multiplier applied on completed word (wordReward = charsInWord * baseCharValue * wordBonusMultiplier * streakMultiplier) */
  wordBonusMultiplier: 2,
  /** Increment added per successful word to streak multiplier (multiplier = 1 + streak * streakStep, capped) */
  streakStep: 0.05,
  /** Maximum streak multiplier */
  maxStreakMultiplier: 2.0,
  /** Characters considered word boundaries triggering word completion */
  wordBoundaries: Array.from(WORD_BOUNDARIES),
  /** Number of words between automatic mini challenges */
  wordsPerChallenge: 10,
  /** Base challenge reward multiplier (challengeReward = snippetLength * baseCharValue * challengeRewardMultiplier) */
  challengeRewardMultiplier: 5,
} as const;

/**
 * Producer tier definitions (dev/infrastructure hybrid theme)
 * id changes are intentional; previous saves invalidated (user confirmed reset)
 */
export const PRODUCER_TIERS = {
  SCRIPT_RUNNER: {
    id: 'scriptRunner',
    name: 'Script Runner',
    description: 'Automates simple tasks; runs helper scripts (1 res/sec)',
    baseCost: 120,
    productionRate: 1,
    unlockThreshold: 100, // Unlock at 100 resources
  },
  BUILD_SERVER: {
    id: 'buildServer',
    name: 'Build Server',
    description: 'Compiles and bundles projects continuously (6 res/sec)',
    baseCost: 120 * 120, // 14,400
    productionRate: 6,
    unlockThreshold: 120 * 100, // 12,000 resources needed to appear
  },
  CI_PIPELINE: {
    id: 'ciPipeline',
    name: 'CI Pipeline',
    description: 'Runs tests & deployments automatically (30 res/sec)',
    baseCost: 14400 * 120, // 1,728,000
    productionRate: 30,
    unlockThreshold: 14400 * 100, // 1,440,000 resources needed
  },
  CLOUD_ORCHESTRATOR: {
    id: 'cloudOrchestrator',
    name: 'Cloud Orchestrator',
    description: 'Scales microservices seamlessly (180 res/sec)',
    baseCost: 1728000 * 120, // 207,360,000
    productionRate: 180,
    unlockThreshold: 1728000 * 100, // 172,800,000 resources needed
  },
} as const;
