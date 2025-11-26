import { BASE_CLICK_POWER, DEFAULT_COST_MULTIPLIER, PRODUCER_TIERS } from '../constants/gameConstants';

/**
 * Core game engine handling all game logic and state management.
 * This class is framework-agnostic and can be used independently of React.
 */

/**
 * Configuration for a producer tier
 */
export interface ProducerTier {
  /** Unique identifier for the producer */
  id: string;
  /** Display name shown to the player */
  name: string;
  /** Description of what the producer does */
  description: string;
  /** Base cost for the first purchase */
  baseCost: number;
  /** Multiplier applied to cost for each purchase (e.g., 1.15 = 15% increase) */
  costMultiplier: number;
  /** Resources produced per second per unit owned */
  productionRate: number;
  /** Number of this producer currently owned */
  quantity: number;
  /** Total resources spent on purchasing this producer so far */
  totalSpent: number;
}

/**
 * Main game engine class
 */
export class GameEngine {
  public resources: number;
  public productionRate: number;
  public producers: ProducerTier[];
  private lastUpdate: number;

  constructor() {
    this.resources = 0;
    this.productionRate = 0;
    this.lastUpdate = Date.now();
    this.producers = this.initializeProducers();
  }

  /**
   * Initialize all producer tiers with default values
   */
  private initializeProducers(): ProducerTier[] {
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
        id: PRODUCER_TIERS.AUTO_CLICKER.id,
        name: PRODUCER_TIERS.AUTO_CLICKER.name,
        description: PRODUCER_TIERS.AUTO_CLICKER.description,
        baseCost: PRODUCER_TIERS.AUTO_CLICKER.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: PRODUCER_TIERS.AUTO_CLICKER.productionRate,
        quantity: 0,
        totalSpent: 0
      },
      {
        id: PRODUCER_TIERS.FACTORY.id,
        name: PRODUCER_TIERS.FACTORY.name,
        description: PRODUCER_TIERS.FACTORY.description,
        baseCost: PRODUCER_TIERS.FACTORY.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: PRODUCER_TIERS.FACTORY.productionRate,
        quantity: 0,
        totalSpent: 0
      },
      {
        id: PRODUCER_TIERS.INDUSTRIAL.id,
        name: PRODUCER_TIERS.INDUSTRIAL.name,
        description: PRODUCER_TIERS.INDUSTRIAL.description,
        baseCost: PRODUCER_TIERS.INDUSTRIAL.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: PRODUCER_TIERS.INDUSTRIAL.productionRate,
        quantity: 0,
        totalSpent: 0
      },
      {
        id: PRODUCER_TIERS.MEGA_FACTORY.id,
        name: PRODUCER_TIERS.MEGA_FACTORY.name,
        description: PRODUCER_TIERS.MEGA_FACTORY.description,
        baseCost: PRODUCER_TIERS.MEGA_FACTORY.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: PRODUCER_TIERS.MEGA_FACTORY.productionRate,
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
   * Calculate the cost of the next producer purchase
   * Uses exponential scaling: baseCost × (multiplier ^ quantity)
   *
   * @param producerId - The unique identifier of the producer
   * @returns The cost in resources, or 0 if producer not found
   */
  getProducerCost(producerId: string): number {
    const producer = this.producers.find(u => u.id === producerId);
    if (!producer) return 0;

    return Math.floor(producer.baseCost * Math.pow(producer.costMultiplier, producer.quantity));
  }

  /**
   * Check if the player can afford the next purchase of a producer
   */
  canAffordProducer(producerId: string): boolean {
    const cost = this.getProducerCost(producerId);
    // Disallow purchasing items with zero cost to avoid meaningless buys (e.g., manual)
    if (cost <= 0) return false;
    return this.resources >= cost;
  }

  /**
   * Attempt to purchase a producer by id
   * @returns true if purchase succeeded
   */
  purchaseProducer(producerId: string): boolean {
    const producer = this.producers.find(u => u.id === producerId);
    if (!producer) return false;

    const cost = this.getProducerCost(producerId);
    if (this.resources < cost || cost <= 0) return false;

    this.resources -= cost;
    producer.quantity++;
    producer.totalSpent += cost;

    this.updateProductionRate();

    return true;
  }

  /**
   * Recalculate total production rate based on all owned producers
   * Called after any producer purchase
   */
  private updateProductionRate(): void {
    let totalRate = 0;

    for (const producer of this.producers) {
      if (producer.id !== 'manual') {
        totalRate += producer.productionRate * producer.quantity;
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
   * @returns Object containing resources, production rate, and producer info
   */
  getState() {
    return {
      resources: this.resources,
      productionRate: this.productionRate,
      producers: this.producers.map(u => ({
        ...u,
        cost: this.getProducerCost(u.id),
        canAfford: this.canAffordProducer(u.id)
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
      producers: this.producers.map(u => ({
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
    producers?: Array<{ id: string; quantity: number; totalSpent?: number }>; // totalSpent optional for backward compatibility
    lastUpdate?: number;
  }): void {
    if (saveData.resources !== undefined) {
      this.resources = saveData.resources;
    }

    if (saveData.producers) {
      for (const savedProducer of saveData.producers) {
        const producer = this.producers.find(u => u.id === savedProducer.id);
        if (producer) {
          producer.quantity = savedProducer.quantity;
          producer.totalSpent = savedProducer.totalSpent ?? producer.totalSpent ?? 0;
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

    for (const producer of this.producers) {
      producer.quantity = 0;
      producer.totalSpent = 0;
    }

    this.lastUpdate = Date.now();
  }
}
