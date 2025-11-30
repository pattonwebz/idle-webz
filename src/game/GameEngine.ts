import { BASE_CLICK_POWER, DEFAULT_COST_MULTIPLIER, PRODUCER_TIERS, UPGRADES } from '../constants/gameConstants';
import { AutoBuyer } from './autobuy/AutoBuyer';
import { TypingEngine } from './typing/TypingEngine';
import { ProducerManager } from './producers/ProducerManager';

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
  /** Resources required to reveal this producer */
  unlockThreshold?: number;
}

/**
 * Main game engine class
 */
export class GameEngine {
  public resources: number;
  public productionRate: number;
  public producers: ProducerTier[];
  public autoBuyEnabled: boolean;
  public autoBuySpeedLevel: number; // Number of speed upgrades purchased
  private lastUpdate: number;
  private lastAutoBuy: number;
  private bestValueProducerId: string | undefined;
  private lastBestValueCalc: number;
  // Typing mechanic state
  private typing: TypingEngine;
  private autoBuyer: AutoBuyer;
  private producerManager: ProducerManager;

  constructor() {
    this.resources = 0;
    this.productionRate = 0;
    this.lastUpdate = Date.now();
    this.autoBuyEnabled = false;
    this.autoBuySpeedLevel = 0;
    this.lastAutoBuy = Date.now();
    this.producers = this.initializeProducers();
    this.bestValueProducerId = undefined;
    this.lastBestValueCalc = 0;
    // Typing state init
    this.typing = new TypingEngine();
    // AutoBuyer init
    this.autoBuyer = new AutoBuyer();
    this.producerManager = new ProducerManager();
  }

  /** Initialize all producer tiers with dev-themed values */
  private initializeProducers(): ProducerTier[] {
    return [
      {
        id: 'codingSession',
        name: 'Coding Session',
        description: 'Write code manually via clicks or typing',
        baseCost: 0,
        costMultiplier: 1,
        productionRate: 1,
        quantity: 0,
        totalSpent: 0,
      },
      {
        id: PRODUCER_TIERS.SCRIPT_RUNNER.id,
        name: PRODUCER_TIERS.SCRIPT_RUNNER.name,
        description: PRODUCER_TIERS.SCRIPT_RUNNER.description,
        baseCost: PRODUCER_TIERS.SCRIPT_RUNNER.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: PRODUCER_TIERS.SCRIPT_RUNNER.productionRate,
        quantity: 0,
        totalSpent: 0,
        unlockThreshold: PRODUCER_TIERS.SCRIPT_RUNNER.unlockThreshold,
      },
      {
        id: PRODUCER_TIERS.BUILD_SERVER.id,
        name: PRODUCER_TIERS.BUILD_SERVER.name,
        description: PRODUCER_TIERS.BUILD_SERVER.description,
        baseCost: PRODUCER_TIERS.BUILD_SERVER.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: PRODUCER_TIERS.BUILD_SERVER.productionRate,
        quantity: 0,
        totalSpent: 0,
        unlockThreshold: PRODUCER_TIERS.BUILD_SERVER.unlockThreshold,
      },
      {
        id: PRODUCER_TIERS.CI_PIPELINE.id,
        name: PRODUCER_TIERS.CI_PIPELINE.name,
        description: PRODUCER_TIERS.CI_PIPELINE.description,
        baseCost: PRODUCER_TIERS.CI_PIPELINE.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: PRODUCER_TIERS.CI_PIPELINE.productionRate,
        quantity: 0,
        totalSpent: 0,
        unlockThreshold: PRODUCER_TIERS.CI_PIPELINE.unlockThreshold,
      },
      {
        id: PRODUCER_TIERS.CLOUD_ORCHESTRATOR.id,
        name: PRODUCER_TIERS.CLOUD_ORCHESTRATOR.name,
        description: PRODUCER_TIERS.CLOUD_ORCHESTRATOR.description,
        baseCost: PRODUCER_TIERS.CLOUD_ORCHESTRATOR.baseCost,
        costMultiplier: DEFAULT_COST_MULTIPLIER,
        productionRate: PRODUCER_TIERS.CLOUD_ORCHESTRATOR.productionRate,
        quantity: 0,
        totalSpent: 0,
        unlockThreshold: PRODUCER_TIERS.CLOUD_ORCHESTRATOR.unlockThreshold,
      }
    ];
  }

  /**
   * Handle manual click production
   * Awards resources per click based on configured base click power
   */
  click(): void {
    this.resources += this.getClickValue();
  }

  /** Cheat click awarding flat 100 resources per activation (A+T combo) */
  cheatClick(): void {
    this.resources += 100;
  }

  /** Current click value based on clickPowerLevel */
  private getClickValue(): number {
    // Doubling each level: base * 2^level
    return BASE_CLICK_POWER * Math.pow(2, this.clickPowerLevel);
  }

  /** Handle a typed character (optional mechanic) */
  typeChar(char: string): void {
    this.typing.handleChar(char, (val) => { this.resources += val; });
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
    return this.producerManager.getCost(producer);
  }

  /**
   * Check if the player can afford the next purchase of a producer
   */
  canAffordProducer(producerId: string): boolean {
    const producer = this.producers.find(u => u.id === producerId);
    if (!producer) return false;
    return this.producerManager.canAfford(producer, this.resources);
  }

  /**
   * Attempt to purchase a producer by id
   * @returns true if purchase succeeded
   */
  purchaseProducer(producerId: string): boolean {
    const producer = this.producers.find(u => u.id === producerId);
    if (!producer) return false;
    const res = this.producerManager.purchase(producer, this.resources);
    if (!res.success) return false;
    this.resources = res.newResources;
    this.updateProductionRate();
    this.calculateBestValue();
    return true;
  }

  /**
   * Calculate best value producer based on CURRENT cost/production ratio
   * Only recalculates every 5 seconds or after a purchase for stability
   */
  private calculateBestValue(): void {
    this.producerManager.recalcBestValue(this.producers);
    this.bestValueProducerId = this.producerManager.getBestValueId();
  }

  /**
   * Recalculate total production rate based on all owned producers
   * Called after any producer purchase
   */
  private updateProductionRate(): void {
    this.productionRate = this.producerManager.totalProduction(this.producers);
  }

  /**
   * Update game state based on elapsed time
   * Should be called every frame (typically via requestAnimationFrame)
   */
  update(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
    this.lastUpdate = now;

    this.producerManager.applyUnlocks(this.producers, this.resources, this.unlockedProducers);

    // Add resources based on production rate
    if (this.productionRate > 0) {
      const production = this.productionRate * deltaTime;
      this.resources += production;
    }

    // Auto-buy producers if enabled
    if (this.autoBuyEnabled) {
      this.handleAutoBuy(now);
    }

    // Challenge timeout handled inside TypingEngine
  }

  /**
   * Handle auto-buying of producers
   * Buys the best value (lowest cost per resource) producer based on upgrade interval
   */
  private handleAutoBuy(now: number): void {
    // delegate to AutoBuyer and purchase best if possible
    this.autoBuyer.setEnabled(this.autoBuyEnabled);
    this.autoBuyer.setSpeedLevel(this.autoBuySpeedLevel);
    const purchaseId = this.autoBuyer.tryPurchaseBest(now, this.resources, this.producers, (id) => this.getProducerCost(id));
    if (!purchaseId) return;
    const target = this.producers.find(p => p.id === purchaseId);
    if (!target) return;
    const res = this.producerManager.purchase(target, this.resources);
    if (!res.success) return;
    this.resources = res.newResources;
    this.updateProductionRate();
  }

  /**
   * Get current game state with computed properties for UI
   *
   * @returns Object containing resources, production rate, and producer info
   */
  getState() {
    // Ensure best value is calculated (respects 5-second throttle)
    this.calculateBestValue();

    return {
      resources: this.resources,
      productionRate: this.productionRate,
      producers: this.producers.map(u => ({
        ...u,
        cost: this.getProducerCost(u.id),
        canAfford: this.canAffordProducer(u.id),
        unlocked: this.unlockedProducers.has(u.id)
      })),
      bestValueProducerId: this.bestValueProducerId,
      autoBuyEnabled: this.autoBuyEnabled,
      autoBuySpeedLevel: this.autoBuySpeedLevel,
      autoBuySpeedUpgradeCost: this.getAutoBuySpeedUpgradeCost(),
      canAffordAutoBuySpeedUpgrade: this.canAffordAutoBuySpeedUpgrade(),
      autoBuyInterval: Math.ceil(this.getAutoBuyInterval() / 1000), // in seconds
      timeUntilNextAutoBuy: this.autoBuyer.getSecondsUntilNext(Date.now()),
      // Upgrades
      upgrades: this.getUpgrades(),
      // Typing stats
      ...this.typing.getUIState(),
      // Click power upgrade info
      clickPowerLevel: this.clickPowerLevel,
      clickValue: this.getClickValue(),
      clickPowerUpgradeCost: this.getClickPowerUpgradeCost(),
      canAffordClickPowerUpgrade: this.canAffordClickPowerUpgrade()
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
      producers: this.producers.map(u => ({ id: u.id, quantity: u.quantity, totalSpent: u.totalSpent })),
      lastUpdate: this.lastUpdate,
      autoBuyEnabled: this.autoBuyEnabled,
      autoBuySpeedLevel: this.autoBuySpeedLevel,
      unlockedProducers: Array.from(this.unlockedProducers),
      purchasedUpgrades: Array.from(this.purchasedUpgrades),
      clickPowerLevel: this.clickPowerLevel,
      challengesEnabled: this.challengesEnabled,
    };
  }

  /**
   * Load game state from saved data
   */
  load(saveData: {
    resources?: number;
    producers?: Array<{ id: string; quantity: number; totalSpent?: number }>;
    lastUpdate?: number;
    autoBuyEnabled?: boolean;
    autoBuyUnlocked?: boolean; // Legacy - migrate to purchasedUpgrades
    autoBuySpeedLevel?: number;
    unlockedProducers?: string[];
    typingUnlocked?: boolean; // Legacy - migrate to purchasedUpgrades
    purchasedUpgrades?: string[];
    clickPowerLevel?: number;
    challengesEnabled?: boolean;
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
    if (saveData.autoBuyEnabled !== undefined) {
      this.autoBuyEnabled = saveData.autoBuyEnabled;
    }
    if (saveData.autoBuySpeedLevel !== undefined) {
      this.autoBuySpeedLevel = saveData.autoBuySpeedLevel;
    }
    if (saveData.unlockedProducers) {
      this.unlockedProducers = new Set(saveData.unlockedProducers);
    }
    if (saveData.purchasedUpgrades) {
      this.purchasedUpgrades = new Set(saveData.purchasedUpgrades);
    }
    if (saveData.clickPowerLevel !== undefined) {
      this.clickPowerLevel = saveData.clickPowerLevel;
    }
    if (saveData.challengesEnabled !== undefined) {
      this.challengesEnabled = saveData.challengesEnabled;
      this.typing.setChallengesEnabled(this.challengesEnabled);
    }
    // Migrate old save format
    if (saveData.autoBuyUnlocked) {
      this.purchasedUpgrades.add(UPGRADES.AUTO_BUY.id);
    }
    if (saveData.typingUnlocked) {
      this.purchasedUpgrades.add(UPGRADES.TYPING.id);
    }
  }

  /**
   * Purchase an upgrade by ID
   * @param upgradeId - The ID of the upgrade to purchase
   * @returns true if purchase succeeded
   */
  purchaseUpgrade(upgradeId: string): boolean {
    // Check if already purchased
    if (this.purchasedUpgrades.has(upgradeId)) {
      return false;
    }

    // Find upgrade definition
    const upgradeEntry = Object.values(UPGRADES).find(u => u.id === upgradeId);
    if (!upgradeEntry) {
      return false;
    }

    // Check if can afford
    if (this.resources < upgradeEntry.cost) {
      return false;
    }

    // Purchase
    this.resources -= upgradeEntry.cost;
    this.purchasedUpgrades.add(upgradeId);
    return true;
  }

  /**
   * Get all available upgrades with purchase status
   */
  getUpgrades() {
    return Object.values(UPGRADES).map(upgrade => ({
      ...upgrade,
      purchased: this.purchasedUpgrades.has(upgrade.id),
      canAfford: this.resources >= upgrade.cost && !this.purchasedUpgrades.has(upgrade.id)
    }));
  }

  /**
   * Get the cost of the next auto-buy speed upgrade
   * Base cost: 10000, multiplier: 1.5
   */
  getAutoBuySpeedUpgradeCost(): number {
    const baseCost = 10000;
    const multiplier = 1.5;
    return Math.floor(baseCost * Math.pow(multiplier, this.autoBuySpeedLevel));
  }

  /**
   * Check if player can afford the next auto-buy speed upgrade
   */
  canAffordAutoBuySpeedUpgrade(): boolean {
    if (!this.purchasedUpgrades.has(UPGRADES.AUTO_BUY.id)) return false;
    const cost = this.getAutoBuySpeedUpgradeCost();
    return this.resources >= cost;
  }

  /**
   * Purchase an auto-buy speed upgrade
   * Each upgrade reduces the timer by 2 seconds (minimum 2 seconds)
   * @returns true if purchase succeeded
   */
  purchaseAutoBuySpeedUpgrade(): boolean {
    if (!this.purchasedUpgrades.has(UPGRADES.AUTO_BUY.id)) return false;

    const cost = this.getAutoBuySpeedUpgradeCost();
    if (this.resources < cost) return false;

    // Cap at level 14 (30s - 14*2s = 2s minimum)
    if (this.autoBuySpeedLevel >= 14) return false;

    this.resources -= cost;
    this.autoBuySpeedLevel++;

    return true;
  }

  /**
   * Get the auto-buy interval in milliseconds based on upgrade level
   * Base: 30 seconds, -2 seconds per upgrade, minimum 2 seconds
   */
  getAutoBuyInterval(): number {
    const baseInterval = 30000; // 30 seconds
    const reduction = this.autoBuySpeedLevel * 2000; // 2 seconds per level
    const minInterval = 2000; // 2 seconds minimum
    return Math.max(minInterval, baseInterval - reduction);
  }

  /** Repeatable click power upgrade cost (base 10000, *2 each level) */
  getClickPowerUpgradeCost(): number {
    const baseCost = 10000;
    const multiplier = 2; // doubles each purchase
    return Math.floor(baseCost * Math.pow(multiplier, this.clickPowerLevel));
  }

  canAffordClickPowerUpgrade(): boolean {
    return this.resources >= this.getClickPowerUpgradeCost();
  }

  purchaseClickPowerUpgrade(): boolean {
    const cost = this.getClickPowerUpgradeCost();
    if (this.resources < cost) return false;
    this.resources -= cost;
    this.clickPowerLevel++;
    return true;
  }

  /**
   * Toggle auto-buy on/off
   */
  toggleAutoBuy(): void {
    if (!this.purchasedUpgrades.has(UPGRADES.AUTO_BUY.id)) return;
    this.autoBuyEnabled = !this.autoBuyEnabled;
    if (this.autoBuyEnabled) {
      this.lastAutoBuy = Date.now();
    }
  }

  /**
   * Toggle challenges on/off
   */
  toggleChallenges(): void {
    if (!this.purchasedUpgrades.has(UPGRADES.CHALLENGES.id)) return;
    this.challengesEnabled = !this.challengesEnabled;
    this.typing.setChallengesEnabled(this.challengesEnabled);
  }

  /**
   * Reset all game progress to initial state
   */
  reset(): void {
    this.resources = 0;
    this.productionRate = 0;
    this.autoBuyEnabled = false;
    this.autoBuySpeedLevel = 0;
    this.lastAutoBuy = Date.now();

    for (const producer of this.producers) {
      producer.quantity = 0;
      producer.totalSpent = 0;
    }

    // Typing state reset handled by TypingEngine (runtime)

    this.lastUpdate = Date.now();
  }
}
