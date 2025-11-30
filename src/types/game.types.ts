/**
 * Type definitions for the Incremental Clicker Game
 */

/**
 * Core upgrade tier configuration and state
 */
export interface UpgradeTier {
  /** Unique identifier for the upgrade */
  id: string;
  /** Display name shown to the player */
  name: string;
  /** Description of what the upgrade does */
  description: string;
  /** Base cost for the first purchase */
  baseCost: number;
  /** Multiplier applied to cost for each purchase (e.g., 1.15 = 15% increase) */
  costMultiplier: number;
  /** Resources produced per second per unit owned */
  productionRate: number;
  /** Number of this upgrade currently owned */
  quantity: number;
}

/**
 * Extended upgrade information including computed properties for UI
 */
export interface UpgradeInfo extends UpgradeTier {
  /** Current cost to purchase the next upgrade */
  cost: number;
  /** Whether the player can afford this upgrade */
  canAfford: boolean;
}

/**
 * Complete game state
 */
export interface GameState {
  /** Current resource count */
  resources: number;
  /** Total resources produced per second */
  productionRate: number;
  /** List of all upgrades with computed properties */
  upgrades: UpgradeInfo[];
}

/**
 * Serializable save data structure
 */
export interface SaveData {
  /** Saved resource count */
  resources: number;
  /** Saved upgrade quantities */
  upgrades: Array<{
    id: string;
    quantity: number;
  }>;
  /** Timestamp of last save */
  lastUpdate: number;
}

/**
 * Game configuration constants
 */
export interface GameConfig {
  /** Interval for auto-save in milliseconds */
  autoSaveInterval: number;
  /** LocalStorage key for save data */
  saveKey: string;
  /** Base click power */
  clickPower: number;
}

/**
 * Number formatting options
 */
export const NumberFormat = {
  /** Standard decimal notation */
  DECIMAL: 'decimal',
  /** Scientific notation (e.g., 1.23e+10) */
  SCIENTIFIC: 'scientific',
  /** Suffix notation (e.g., 1.23M) */
  SUFFIX: 'suffix',
} as const;

export type NumberFormatType = typeof NumberFormat[keyof typeof NumberFormat];

/**
 * One-time purchasable upgrade
 */
export interface OneTimeUpgrade {
  /** Unique identifier for the upgrade */
  id: string;
  /** Display name shown to the player */
  name: string;
  /** Description of what the upgrade does */
  description: string;
  /** Cost to purchase this upgrade */
  cost: number;
  /** Whether this upgrade has been purchased */
  purchased: boolean;
}

