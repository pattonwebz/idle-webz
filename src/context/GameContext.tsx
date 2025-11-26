/**
 * React Context for managing game state and providing game engine access to components.
 * Handles the game loop, auto-save, and state synchronization.
 */

import { createContext, useEffect, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { UpgradeTier } from '../game/GameEngine';
import { SAVE_KEY, AUTO_SAVE_INTERVAL } from '../constants/gameConstants';
import { GAME_UPDATE_FPS } from '../constants/gameConstants';

/**
 * Extended upgrade information with computed properties for UI
 */
interface UpgradeInfo extends UpgradeTier {
  cost: number;
  canAfford: boolean;
}

/**
 * Game context value provided to all child components
 */
export interface GameContextType {
  /** Current resource count */
  resources: number;
  /** Current production rate (resources per second) */
  productionRate: number;
  /** List of all upgrades with computed properties */
  upgrades: UpgradeInfo[];
  /** Handle manual click action */
  click: () => void;
  /** Attempt to purchase an upgrade */
  purchaseUpgrade: (upgradeId: string) => boolean;
  /** Reset all game progress (with confirmation) */
  resetGame: () => void;
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
   * Attempt to purchase an upgrade
   * @param upgradeId - Unique identifier of the upgrade
   * @returns True if purchase succeeded
   */
  const purchaseUpgrade = useCallback((upgradeId: string): boolean => {
    if (!gameEngineRef.current) return false;
    const success = gameEngineRef.current.purchaseUpgrade(upgradeId);
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

  const value: GameContextType = {
    resources: gameState.resources,
    productionRate: gameState.productionRate,
    upgrades: gameState.upgrades,
    click,
    purchaseUpgrade,
    resetGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
