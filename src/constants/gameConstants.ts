/**
 * Game configuration constants
 */

/** Auto-save interval in milliseconds (60 seconds) */
export const AUTO_SAVE_INTERVAL = 60000;

/** LocalStorage key for game save data */
export const SAVE_KEY = 'incrementalClickerSave';

/** Base resources gained per manual click */
export const BASE_CLICK_POWER = 1;

/** Threshold for switching to scientific notation */
export const SCIENTIFIC_NOTATION_THRESHOLD = 100000;

/** Default cost multiplier for producers */
export const DEFAULT_COST_MULTIPLIER = 1.15;

/** Game update rate (60 fps) */
export const GAME_UPDATE_FPS = 10;

/**
 * Producer tier definitions
 */
export const PRODUCER_TIERS = {
  AUTO_CLICKER: {
    id: 'autoClicker',
    name: 'Auto Clicker',
    description: 'Automatically produces 1 resource/sec',
    baseCost: 10,
    productionRate: 1,
  },
  FACTORY: {
    id: 'factory',
    name: 'Factory',
    description: 'Produces 5 resources/sec',
    baseCost: 100,
    productionRate: 5,
  },
  INDUSTRIAL: {
    id: 'industrial',
    name: 'Industrial Complex',
    description: 'Produces 25 resources/sec',
    baseCost: 1000,
    productionRate: 25,
  },
  MEGA_FACTORY: {
    id: 'megaFactory',
    name: 'Mega Factory',
    description: 'Produces 100 resources/sec',
    baseCost: 10000,
    productionRate: 100,
  },
} as const;

