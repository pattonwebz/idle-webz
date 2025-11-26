import { BASE_CLICK_POWER, DEFAULT_COST_MULTIPLIER, UPGRADE_TIERS } from '../constants/gameConstants';

/**
 * Core game engine handling all game logic and state management.
 * This class is framework-agnostic and can be used independently of React.
 */

/**
 * Configuration for an upgrade tier
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
  /** Total resources spent on purchasing this upgrade so far */
  totalSpent: number;
}

/**
 * Main game engine class
 */
export class GameEngine {
  public resources: number;
  public productionRate: number;
  public upgrades: UpgradeTier[];
  private lastUpdate: number;

  constructor() {
    this.resources = 0;
    this.productionRate = 0;
    this.lastUpdate = Date.now();
    this.upgrades = this.initializeUpgrades();
  }

  /**
   * Initialize all upgrade tiers with default values
   */
  private initializeUpgrades(): UpgradeTier[] {
    return [
      {
        id: 'manual',
        name: 'Manual Production',
        description: 'Click to produce resources',
        baseCost: 0,
        costMultiplier: 1,
        productionRate: 1,
        quantity: 0,
        totalSpent: 0
      },
      // Build the rest from constants to keep balance centralized
      {
        id: UPGRADE_TIERS.AUTO_CLICKER.id,
        name: UPGRADE_TIERS.AUTO_CLICKER.name,
        description: UPGRADE_TIERS.AUTO_CLICKER.description,
        baseCost: UPGRADE_TIERS.AUTO_CLICKER.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: UPGRADE_TIERS.AUTO_CLICKER.productionRate,
        quantity: 0,
        totalSpent: 0
      },
      {
        id: UPGRADE_TIERS.FACTORY.id,
        name: UPGRADE_TIERS.FACTORY.name,
        description: UPGRADE_TIERS.FACTORY.description,
        baseCost: UPGRADE_TIERS.FACTORY.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: UPGRADE_TIERS.FACTORY.productionRate,
        quantity: 0,
        totalSpent: 0
      },
      {
        id: UPGRADE_TIERS.INDUSTRIAL.id,
        name: UPGRADE_TIERS.INDUSTRIAL.name,
        description: UPGRADE_TIERS.INDUSTRIAL.description,
        baseCost: UPGRADE_TIERS.INDUSTRIAL.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: UPGRADE_TIERS.INDUSTRIAL.productionRate,
        quantity: 0,
        totalSpent: 0
      },
      {
        id: UPGRADE_TIERS.MEGA_FACTORY.id,
        name: UPGRADE_TIERS.MEGA_FACTORY.name,
        description: UPGRADE_TIERS.MEGA_FACTORY.description,
        baseCost: UPGRADE_TIERS.MEGA_FACTORY.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: UPGRADE_TIERS.MEGA_FACTORY.productionRate,
        quantity: 0,
        totalSpent: 0
      }
    ];
  }

  /**
   * Handle manual click production
   * Awards resources per click based on configured base click power
   */
  click(): void {
    this.resources += BASE_CLICK_POWER;
  }

  /**
   * Calculate the cost of the next upgrade purchase
   * Uses exponential scaling: baseCost × (multiplier ^ quantity)
   *
   * @param upgradeId - The unique identifier of the upgrade
   * @returns The cost in resources, or 0 if upgrade not found
   */
  getUpgradeCost(upgradeId: string): number {
    const upgrade = this.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return 0;

    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.quantity));
  }

  /**
   * Check if the player can afford the next purchase of an upgrade
   */
  canAffordUpgrade(upgradeId: string): boolean {
    const cost = this.getUpgradeCost(upgradeId);
    // Disallow purchasing items with zero cost to avoid meaningless buys (e.g., manual)
    if (cost <= 0) return false;
    return this.resources >= cost;
  }

  /**
   * Attempt to purchase an upgrade by id
   * @returns true if purchase succeeded
   */
  purchaseUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    const cost = this.getUpgradeCost(upgradeId);
    if (this.resources < cost || cost <= 0) return false;

    this.resources -= cost;
    upgrade.quantity++;
    upgrade.totalSpent += cost;

    this.updateProductionRate();

    return true;
  }

  /**
   * Recalculate total production rate based on all owned upgrades
   * Called after any upgrade purchase
   */
  private updateProductionRate(): void {
    let totalRate = 0;

    for (const upgrade of this.upgrades) {
      if (upgrade.id !== 'manual') {
        totalRate += upgrade.productionRate * upgrade.quantity;
      }
    }

    this.productionRate = totalRate;
  }

  /**
   * Update game state based on elapsed time
   * Should be called every frame (typically via requestAnimationFrame)
   */
  update(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
    this.lastUpdate = now;

    // Add resources based on production rate
    if (this.productionRate > 0) {
      const production = this.productionRate * deltaTime;
      this.resources += production;
    }
  }

  /**
   * Get current game state with computed properties for UI
   *
   * @returns Object containing resources, production rate, and upgrade info
   */
  getState() {
    return {
      resources: this.resources,
      productionRate: this.productionRate,
      upgrades: this.upgrades.map(u => ({
        ...u,
        cost: this.getUpgradeCost(u.id),
        canAfford: this.canAffordUpgrade(u.id)
      }))
    };
  }

  /**
   * Serialize game state for saving
   *
   * @returns Minimal save data object for localStorage
   */
  save() {
    return {
      resources: this.resources,
      upgrades: this.upgrades.map(u => ({
        id: u.id,
        quantity: u.quantity,
        totalSpent: u.totalSpent
      })),
      lastUpdate: this.lastUpdate
    };
  }

  /**
   * Load game state from saved data
   */
  load(saveData: {
    resources?: number;
    upgrades?: Array<{ id: string; quantity: number; totalSpent?: number }>; // totalSpent optional for backward compatibility
    lastUpdate?: number;
  }): void {
    if (saveData.resources !== undefined) {
      this.resources = saveData.resources;
    }

    if (saveData.upgrades) {
      for (const savedUpgrade of saveData.upgrades) {
        const upgrade = this.upgrades.find(u => u.id === savedUpgrade.id);
        if (upgrade) {
          upgrade.quantity = savedUpgrade.quantity;
          upgrade.totalSpent = savedUpgrade.totalSpent ?? upgrade.totalSpent ?? 0;
        }
      }
      this.updateProductionRate();
    }

    if (saveData.lastUpdate) {
      this.lastUpdate = saveData.lastUpdate;
    }
  }

  /**
   * Reset all game progress to initial state
   */
  reset(): void {
    this.resources = 0;
    this.productionRate = 0;

    for (const upgrade of this.upgrades) {
      upgrade.quantity = 0;
      upgrade.totalSpent = 0;
    }

    this.lastUpdate = Date.now();
  }
}
