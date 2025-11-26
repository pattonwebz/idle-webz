/**
 * Custom hook to access game context
 */

import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import type { GameContextType } from '../context/GameContext';

/**
 * Custom hook to access game context
 * @throws Error if used outside of GameProvider
 */
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

