import { BASE_CLICK_POWER, DEFAULT_COST_MULTIPLIER, PRODUCER_TIERS, TYPING_CONFIG, WORD_BOUNDARIES } from '../constants/gameConstants';
import { pickRandomChallenge } from '../constants/challenges';

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
  public autoBuyUnlocked: boolean;
  public autoBuyEnabled: boolean;
  public autoBuySpeedLevel: number; // Number of speed upgrades purchased
  private lastUpdate: number;
  private lastAutoBuy: number;
  private bestValueProducerId: string | undefined;
  private lastBestValueCalc: number;
  // Typing mechanic state
  private lastTypedChar: string | null;
  private consecutiveSameCharCount: number;
  private streakWords: number; // number of consecutive successful words
  private wordsTyped: number;
  private currentWordLength: number;
  private activeChallenge: { id: string; snippet: string; timeLimitMs: number; startTime: number; progress: number; description: string } | null;
  private lastChallengeWords: number;
  private failedChallenges: number;
  private completedChallenges: number;
  private unlockedProducers: Set<string>; // Track permanently unlocked producer IDs
  private typingUnlocked: boolean; // Track if typing mechanic is unlocked

  constructor() {
    this.resources = 0;
    this.productionRate = 0;
    this.lastUpdate = Date.now();
    this.autoBuyUnlocked = false;
    this.autoBuyEnabled = false;
    this.autoBuySpeedLevel = 0;
    this.lastAutoBuy = Date.now();
    this.producers = this.initializeProducers();
    this.bestValueProducerId = undefined;
    this.lastBestValueCalc = 0;
    // Typing state init
    this.lastTypedChar = null;
    this.consecutiveSameCharCount = 0;
    this.streakWords = 0;
    this.wordsTyped = 0;
    this.currentWordLength = 0;
    this.activeChallenge = null;
    this.lastChallengeWords = 0;
    this.failedChallenges = 0;
    this.completedChallenges = 0;
    // Initialize with only codingSession unlocked (scriptRunner unlocks at 200 resources)
    this.unlockedProducers = new Set<string>(['codingSession']);
    this.typingUnlocked = false;
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
    this.resources += BASE_CLICK_POWER;
  }

  /** Handle a typed character (optional mechanic) */
  typeChar(char: string): void {
    if (this.activeChallenge) {
      const challenge: any = this.activeChallenge;
      if (Date.now() - challenge.startTime > challenge.timeLimitMs) {
        this.failChallenge();
      } else {
        if (!challenge.startedOnNewLine) {
          if (char === '\n') {
            challenge.startedOnNewLine = true;
            return; // newline does not produce resources
          } else {
            // Allow normal typing before starting the challenge; ignore for challenge progression
            // Requirement: only fail on wrong char AFTER challenge has started
          }
        } else {
          const expectedChar = challenge.snippet[challenge.progress];
          if (char === '\n') {
            this.failChallenge();
          } else if (char === expectedChar) {
            challenge.progress++;
            if (challenge.progress >= challenge.snippet.length) {
              this.completeChallenge();
            }
          } else {
            this.failChallenge();
          }
        }
      }
    }

    // Update consecutive same-char tracking
    if (this.lastTypedChar === char) {
      this.consecutiveSameCharCount++;
    } else {
      this.lastTypedChar = char;
      this.consecutiveSameCharCount = 1;
    }

    // Ignore reward for 3rd (or more) consecutive identical character
    if (this.consecutiveSameCharCount >= 3) {
      // Still count towards word length (if not boundary) to prevent easy exploit resets
      if (!WORD_BOUNDARIES.has(char)) {
        this.currentWordLength++;
      } else {
        this.handleWordBoundary();
      }
      return;
    }

    // Reward for valid character
    if (!WORD_BOUNDARIES.has(char)) {
      this.resources += TYPING_CONFIG.baseCharValue * this.getCurrentStreakMultiplier();
      this.currentWordLength++;
    } else {
      // Boundary: finalize word
      this.handleWordBoundary();
    }
  }

  /** Calculate current streak multiplier */
  private getCurrentStreakMultiplier(): number {
    const multiplier = 1 + this.streakWords * TYPING_CONFIG.streakStep;
    return Math.min(TYPING_CONFIG.maxStreakMultiplier, multiplier);
  }

  /** Handle word boundary triggering word completion reward */
  private handleWordBoundary(): void {
    if (this.currentWordLength > 0) {
      this.completeWord();
    }
    this.currentWordLength = 0;

    // Auto-trigger challenge when threshold reached and none active
    if (!this.activeChallenge && this.wordsTyped > 0) {
      const wordsSinceLast = this.wordsTyped - this.lastChallengeWords;
      if (wordsSinceLast >= TYPING_CONFIG.wordsPerChallenge) {
        this.startChallenge();
      }
    }
  }

  /** Complete current word, grant word bonus */
  private completeWord(): void {
    this.wordsTyped++;
    this.streakWords++;
    const streakMultiplier = this.getCurrentStreakMultiplier();
    const baseWordValue = this.currentWordLength * TYPING_CONFIG.baseCharValue;
    const reward = baseWordValue * TYPING_CONFIG.wordBonusMultiplier * streakMultiplier;
    this.resources += reward;
  }

  // Mini challenge lifecycle
  private startChallenge(): void {
    const def = pickRandomChallenge();
    this.activeChallenge = {
      id: def.id,
      snippet: def.snippet,
      description: def.description,
      timeLimitMs: def.timeLimitSeconds * 1000,
      startTime: Date.now(),
      progress: 0,
      // new flag to enforce newline start
      startedOnNewLine: false
    } as any; // cast to allow added property without redefining type globally
    this.lastChallengeWords = this.wordsTyped; // mark baseline
  }
  private completeChallenge(): void {
    if (!this.activeChallenge) return;
    const length = this.activeChallenge.snippet.length;
    const streakMultiplier = this.getCurrentStreakMultiplier();
    const reward = length * TYPING_CONFIG.baseCharValue * TYPING_CONFIG.challengeRewardMultiplier * streakMultiplier;
    this.resources += reward;
    this.completedChallenges++;
    // Small streak boost for success without exceeding cap
    this.streakWords += 1;
    this.activeChallenge = null;
  }
  private failChallenge(): void {
    if (!this.activeChallenge) return;
    this.failedChallenges++;
    // Reset streak on failure
    this.streakWords = 0;
    this.activeChallenge = null;
  }
  // Public manual trigger (UI button)
  public triggerChallenge(): boolean {
    if (this.activeChallenge) return false;
    this.startChallenge();
    return true;
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
    // Recalculate best value after a purchase
    this.calculateBestValue();

    return true;
  }

  /**
   * Calculate best value producer based on CURRENT cost/production ratio
   * Only recalculates every 5 seconds or after a purchase for stability
   */
  private calculateBestValue(): void {
    const now = Date.now();

    // Only recalculate if 5 seconds have passed since last calculation
    if (now - this.lastBestValueCalc < 5000 && this.bestValueProducerId !== undefined) {
      return;
    }

    this.lastBestValueCalc = now;

    // Filter valid producers (exclude manual)
    const candidates = this.producers.filter(
      p => p.id !== 'codingSession' && p.productionRate > 0
    );

    if (candidates.length === 0) {
      this.bestValueProducerId = undefined;
      return;
    }

    // Find producer with best CURRENT cost/production ratio
    let bestProducer = candidates[0];
    let bestRatio = this.getProducerCost(bestProducer.id) / bestProducer.productionRate;

    for (const producer of candidates) {
      const currentCost = this.getProducerCost(producer.id);
      if (currentCost <= 0) continue; // Skip if cost is invalid

      const ratio = currentCost / producer.productionRate;
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestProducer = producer;
      }
    }

    this.bestValueProducerId = bestProducer.id;
  }

  /**
   * Recalculate total production rate based on all owned producers
   * Called after any producer purchase
   */
  private updateProductionRate(): void {
    let totalRate = 0;

    for (const producer of this.producers) {
      if (producer.id !== 'codingSession') {
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

    // Check for newly unlocked producers based on resources
    for (const producer of this.producers) {
      if (producer.unlockThreshold !== undefined &&
          producer.unlockThreshold > 0 &&
          !this.unlockedProducers.has(producer.id) &&
          this.resources >= producer.unlockThreshold) {
        this.unlockedProducers.add(producer.id);
      }
    }

    // Check if typing should be unlocked
    if (!this.typingUnlocked && this.resources >= 1000) {
      this.typingUnlocked = true;
    }

    // Add resources based on production rate
    if (this.productionRate > 0) {
      const production = this.productionRate * deltaTime;
      this.resources += production;
    }

    // Auto-buy producers if enabled
    if (this.autoBuyEnabled) {
      this.handleAutoBuy(now);
    }

    // Challenge timeout check
    if (this.activeChallenge && now - this.activeChallenge.startTime > this.activeChallenge.timeLimitMs) {
      this.failChallenge();
    }
  }

  /**
   * Handle auto-buying of producers
   * Buys the best value (lowest cost per resource) producer based on upgrade interval
   */
  private handleAutoBuy(now: number): void {
    const interval = this.getAutoBuyInterval();
    const timeSinceLastBuy = now - this.lastAutoBuy;

    if (timeSinceLastBuy < interval) return;

    // Find all affordable producers (excluding manual)
    const affordableProducers = this.producers.filter(
      p => this.canAffordProducer(p.id) && p.id !== 'codingSession'
    );

    if (affordableProducers.length === 0) return;

    // Find the best value producer (lowest cost per resource produced)
    let bestProducer = affordableProducers[0];
    let bestRatio = this.getProducerCost(bestProducer.id) / bestProducer.productionRate;

    for (const producer of affordableProducers) {
      const ratio = this.getProducerCost(producer.id) / producer.productionRate;
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestProducer = producer;
      }
    }

    // Purchase the best value producer
    this.purchaseProducer(bestProducer.id);
    this.lastAutoBuy = now;
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
      autoBuyUnlocked: this.autoBuyUnlocked,
      autoBuySpeedLevel: this.autoBuySpeedLevel,
      autoBuySpeedUpgradeCost: this.getAutoBuySpeedUpgradeCost(),
      canAffordAutoBuySpeedUpgrade: this.canAffordAutoBuySpeedUpgrade(),
      autoBuyInterval: Math.ceil(this.getAutoBuyInterval() / 1000), // in seconds
      timeUntilNextAutoBuy: this.getTimeUntilNextAutoBuy(),
      // Typing stats
      wordsTyped: this.wordsTyped,
      streakWords: this.streakWords,
      currentStreakMultiplier: this.getCurrentStreakMultiplier(),
      typingUnlocked: this.typingUnlocked,
      // Challenge info
      challenge: this.activeChallenge ? {
        id: (this.activeChallenge as any).id,
        snippet: (this.activeChallenge as any).snippet,
        description: (this.activeChallenge as any).description,
        progress: (this.activeChallenge as any).progress,
        total: (this.activeChallenge as any).snippet.length,
        timeRemaining: Math.max(0, Math.ceil(((this.activeChallenge as any).timeLimitMs - (Date.now() - (this.activeChallenge as any).startTime)) / 1000)),
        startedOnNewLine: (this.activeChallenge as any).startedOnNewLine
      } : null,
      nextChallengeInWords: this.activeChallenge ? 0 : Math.max(0, TYPING_CONFIG.wordsPerChallenge - (this.wordsTyped - this.lastChallengeWords)),
      completedChallenges: this.completedChallenges,
      failedChallenges: this.failedChallenges
    };
  }

  /**
   * Get time remaining until next auto-buy (in seconds)
   */
  private getTimeUntilNextAutoBuy(): number {
    if (!this.autoBuyEnabled) return 0;
    const interval = this.getAutoBuyInterval();
    const timeSinceLastBuy = Date.now() - this.lastAutoBuy;
    const timeRemaining = Math.max(0, interval - timeSinceLastBuy);
    return Math.ceil(timeRemaining / 1000); // Convert to seconds
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
      autoBuyUnlocked: this.autoBuyUnlocked,
      autoBuySpeedLevel: this.autoBuySpeedLevel,
      unlockedProducers: Array.from(this.unlockedProducers),
      typingUnlocked: this.typingUnlocked,
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
    autoBuyUnlocked?: boolean;
    autoBuySpeedLevel?: number;
    unlockedProducers?: string[];
    typingUnlocked?: boolean;
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
    if (saveData.autoBuyUnlocked !== undefined) {
      this.autoBuyUnlocked = saveData.autoBuyUnlocked;
    }
    if (saveData.autoBuySpeedLevel !== undefined) {
      this.autoBuySpeedLevel = saveData.autoBuySpeedLevel;
    }
    if (saveData.unlockedProducers) {
      this.unlockedProducers = new Set(saveData.unlockedProducers);
    }
    if (saveData.typingUnlocked !== undefined) {
      this.typingUnlocked = saveData.typingUnlocked;
    }
  }

  /**
   * Unlock the auto-buy feature
   * @returns true if unlock succeeded
   */
  unlockAutoBuy(): boolean {
    const cost = 10000;
    if (this.resources < cost || this.autoBuyUnlocked) {
      return false;
    }

    this.resources -= cost;
    this.autoBuyUnlocked = true;
    return true;
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
    if (!this.autoBuyUnlocked) return false;
    const cost = this.getAutoBuySpeedUpgradeCost();
    return this.resources >= cost;
  }

  /**
   * Purchase an auto-buy speed upgrade
   * Each upgrade reduces the timer by 2 seconds (minimum 2 seconds)
   * @returns true if purchase succeeded
   */
  purchaseAutoBuySpeedUpgrade(): boolean {
    if (!this.autoBuyUnlocked) return false;

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

  /**
   * Toggle auto-buy on/off
   */
  toggleAutoBuy(): void {
    if (!this.autoBuyUnlocked) return;
    this.autoBuyEnabled = !this.autoBuyEnabled;
    if (this.autoBuyEnabled) {
      this.lastAutoBuy = Date.now();
    }
  }

  /**
   * Reset all game progress to initial state
   */
  reset(): void {
    this.resources = 0;
    this.productionRate = 0;
    this.autoBuyUnlocked = false;
    this.autoBuyEnabled = false;
    this.autoBuySpeedLevel = 0;
    this.lastAutoBuy = Date.now();

    for (const producer of this.producers) {
      producer.quantity = 0;
      producer.totalSpent = 0;
    }

    // Reset typing stats
    this.lastTypedChar = null;
    this.consecutiveSameCharCount = 0;
    this.streakWords = 0;
    this.wordsTyped = 0;
    this.currentWordLength = 0;

    // Reset challenge state
    this.activeChallenge = null;
    this.lastChallengeWords = 0;
    this.failedChallenges = 0;
    this.completedChallenges = 0;
    this.unlockedProducers = new Set<string>(['codingSession']);
    this.typingUnlocked = false;

    this.lastUpdate = Date.now();
  }
}
