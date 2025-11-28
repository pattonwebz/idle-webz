/**
 * React Context for managing game state and providing game engine access to components.
 * Handles the game loop, auto-save, and state synchronization.
 */

import { createContext, useEffect, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { ProducerTier } from '../game/GameEngine';
import { SAVE_KEY, AUTO_SAVE_INTERVAL } from '../constants/gameConstants';
import { GAME_UPDATE_FPS } from '../constants/gameConstants';

/**
 * Extended producer information with computed properties for UI
 */
interface ProducerInfo extends ProducerTier {
  cost: number;
  canAfford: boolean;
  unlocked: boolean; // whether producer is visible (unlockThreshold met)
  unlockThreshold?: number; // resources needed to unlock (optional)
}

/**
 * Game context value provided to all child components
 */
export interface GameContextType {
  /** Current resource count */
  resources: number;
  /** Current production rate (resources per second) */
  productionRate: number;
  /** List of all producers with computed properties */
  producers: ProducerInfo[];
  /** ID of the producer with the best base value (cost/production ratio) */
  bestValueProducerId: string | undefined;
  /** Whether auto-buy is unlocked */
  autoBuyUnlocked: boolean;
  /** Whether auto-buy is currently enabled */
  autoBuyEnabled: boolean;
  /** Current auto-buy speed upgrade level */
  autoBuySpeedLevel: number;
  /** Cost of next auto-buy speed upgrade */
  autoBuySpeedUpgradeCost: number;
  /** Whether player can afford the next speed upgrade */
  canAffordAutoBuySpeedUpgrade: boolean;
  /** Current auto-buy interval in seconds */
  autoBuyInterval: number;
  /** Time remaining until next auto-buy (in seconds) */
  timeUntilNextAutoBuy: number;
  /** Handle manual click action */
  click: () => void;
  /** Attempt to purchase a producer */
  purchaseProducer: (producerId: string) => boolean;
  /** Unlock auto-buy feature */
  unlockAutoBuy: () => boolean;
  /** Toggle auto-buy on/off */
  toggleAutoBuy: () => void;
  /** Purchase auto-buy speed upgrade */
  purchaseAutoBuySpeedUpgrade: () => boolean;
  /** Reset all game progress (with confirmation) */
  resetGame: () => void;
  /** Typing: total words typed */
  wordsTyped: number;
  /** Typing: current streak word count */
  streakWords: number;
  /** Typing: current streak multiplier */
  currentStreakMultiplier: number;
  /** Record a typed character */
  typeChar: (char: string) => void;
  /** Current active challenge information */
  challenge: null | { id: string; snippet: string; description: string; progress: number; total: number; timeRemaining: number; startedOnNewLine: boolean };
  /** Number of words until the next challenge */
  nextChallengeInWords: number;
  /** Total number of completed challenges */
  completedChallenges: number;
  /** Total number of failed challenges */
  failedChallenges: number;
  /** Trigger a new challenge */
  triggerChallenge: () => boolean;
}

const GameContext = createContext<GameContextType | null>(null);

// Export for use in useGame hook
export { GameContext };

interface GameProviderProps {
  children: ReactNode;
}

/**
 * Game provider component that manages game state and lifecycle
 */
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // Initialize game engine once
  const [gameEngine] = useState(() => new GameEngine());
  const gameEngineRef = useRef<GameEngine>(gameEngine);

  const [gameState, setGameState] = useState(() => gameEngine.getState());
  const animationFrameRef = useRef<number | undefined>(undefined);

  /**
   * Load saved game on mount
   */
  useEffect(() => {
    const savedGame = localStorage.getItem(SAVE_KEY);
    if (savedGame) {
      try {
        const saveData = JSON.parse(savedGame);
        gameEngineRef.current.load(saveData);
        setGameState(gameEngineRef.current.getState());
      } catch (error) {
        console.error('Failed to load save:', error);
      }
    }
  }, []);

  /**
   * Game loop using fixed update rate from config
   */
  useEffect(() => {
    const targetFrameTime = 1000 / GAME_UPDATE_FPS; // milliseconds per frame
    let lastFrameTime = performance.now();

    const gameLoop = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - lastFrameTime;

      // Only update if enough time has passed for the target FPS
      if (elapsed >= targetFrameTime) {
        gameEngineRef.current.update();
        setGameState(gameEngineRef.current.getState());
        lastFrameTime = currentTime - (elapsed % targetFrameTime); // Carry over extra time
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Auto-save to localStorage on a fixed interval
   */
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const saveData = gameEngineRef.current.save();
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(saveInterval);
  }, []);

  /**
   * Handle manual click action
   */
  const click = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.click();
      setGameState(gameEngineRef.current.getState());
    }
  }, []);

  /**
   * Attempt to purchase a producer
   * @param producerId - Unique identifier of the producer
   * @returns True if purchase succeeded
   */
  const purchaseProducer = useCallback((producerId: string): boolean => {
    if (!gameEngineRef.current) return false;
    const success = gameEngineRef.current.purchaseProducer(producerId);
    if (success) {
      setGameState(gameEngineRef.current.getState());
    }
    return success;
  }, []);

  /**
   * Reset game progress with confirmation dialog
   */
  const resetGame = useCallback(() => {
    if (!gameEngineRef.current) return;
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
      gameEngineRef.current.reset();
      localStorage.removeItem(SAVE_KEY);
      setGameState(gameEngineRef.current.getState());
    }
  }, []);

  /**
   * Unlock auto-buy feature
   */
  const unlockAutoBuy = useCallback(() => {
    if (!gameEngineRef.current) return false;
    const success = gameEngineRef.current.unlockAutoBuy();
    if (success) {
      setGameState(gameEngineRef.current.getState());
    }
    return success;
  }, []);

  /**
   * Toggle auto-buy on/off
   */
  const toggleAutoBuy = useCallback(() => {
    if (!gameEngineRef.current) return;
    gameEngineRef.current.toggleAutoBuy();
    setGameState(gameEngineRef.current.getState());
  }, []);

  /**
   * Purchase auto-buy speed upgrade
   */
  const purchaseAutoBuySpeedUpgrade = useCallback(() => {
    if (!gameEngineRef.current) return false;
    const success = gameEngineRef.current.purchaseAutoBuySpeedUpgrade();
    if (success) {
      setGameState(gameEngineRef.current.getState());
    }
    return success;
  }, []);

  /**
   * Record a typed character
   */
  const typeChar = useCallback((char: string) => {
    gameEngineRef.current.typeChar(char);
    setGameState(gameEngineRef.current.getState());
  }, []);

  /**
   * Trigger a new challenge
   */
  const triggerChallenge = useCallback(() => {
    return gameEngineRef.current.triggerChallenge();
  }, []);

  const value: GameContextType = {
    resources: gameState.resources,
    productionRate: gameState.productionRate,
    producers: gameState.producers,
    bestValueProducerId: gameState.bestValueProducerId,
    autoBuyUnlocked: gameState.autoBuyUnlocked,
    autoBuyEnabled: gameState.autoBuyEnabled,
    autoBuySpeedLevel: gameState.autoBuySpeedLevel,
    autoBuySpeedUpgradeCost: gameState.autoBuySpeedUpgradeCost,
    canAffordAutoBuySpeedUpgrade: gameState.canAffordAutoBuySpeedUpgrade,
    autoBuyInterval: gameState.autoBuyInterval,
    timeUntilNextAutoBuy: gameState.timeUntilNextAutoBuy,
    click,
    purchaseProducer,
    unlockAutoBuy,
    toggleAutoBuy,
    purchaseAutoBuySpeedUpgrade,
    resetGame,
    // Typing additions
    wordsTyped: gameState.wordsTyped,
    streakWords: gameState.streakWords,
    currentStreakMultiplier: gameState.currentStreakMultiplier,
    typingUnlocked: (gameState as any).typingUnlocked,
    typeChar,
    // Challenge additions
    challenge: (gameState as any).challenge,
    nextChallengeInWords: (gameState as any).nextChallengeInWords,
    completedChallenges: (gameState as any).completedChallenges,
    failedChallenges: (gameState as any).failedChallenges,
    triggerChallenge
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
