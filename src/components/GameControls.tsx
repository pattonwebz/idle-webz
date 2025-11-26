/**
 * Game controls dropdown menu with settings and actions
 */

import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import './GameControls.scss';

/**
 * Dropdown menu providing game controls like reset
 * Features click-outside-to-close functionality
 */
export const GameControls = () => {
  const { resetGame } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Handle reset with confirmation
   * Closes dropdown after action
   */
  const handleReset = () => {
    setIsOpen(false);
    resetGame();
  };

  /**
   * Toggle dropdown open/closed
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="game-controls-dropdown">
      <button
        className="dropdown-toggle"
        onClick={toggleDropdown}
        aria-label="Settings menu"
        aria-expanded={isOpen}
      >
        ⚙️ Settings
      </button>
      {isOpen && (
        <>
          <div
            className="dropdown-overlay"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="dropdown-menu" role="menu">
            <button
              className="dropdown-item reset-item"
              onClick={handleReset}
              role="menuitem"
            >
              🔄 Reset Game
            </button>
          </div>
        </>
      )}
    </div>
  );
};

