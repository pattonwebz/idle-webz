/**
 * Auto-buy feature component
 */

import { useGame } from '../hooks/useGame';
import './AutoBuy.scss';

/**
 * Displays auto-buy toggle button and speed upgrades
 * Auto-buy purchases the best value affordable producer at regular intervals
 */
export const AutoBuy: React.FC = () => {
  const {
    autoBuyEnabled,
    timeUntilNextAutoBuy,
    autoBuySpeedLevel,
    autoBuyInterval,
    toggleAutoBuy,
    upgrades
  } = useGame();

  const autoBuyUpgrade = upgrades.find(u => u.id === 'autoBuy');
  const autoBuyUnlocked = autoBuyUpgrade?.purchased ?? false;

  const handleToggle = () => {
    toggleAutoBuy();
  };

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return 'Ready';
    return `${seconds}s`;
  };

  if (!autoBuyUnlocked) {
    return null; // Auto-buy is now unlocked via Upgrades tab
  }

  const maxLevel = autoBuySpeedLevel >= 14;

  return (
    <div className="auto-buy-container">
      <button
        className={`auto-buy-toggle-button ${autoBuyEnabled ? 'enabled' : 'disabled'}`}
        onClick={handleToggle}
        aria-label={autoBuyEnabled ? 'Disable Auto-Buy' : 'Enable Auto-Buy'}
      >
        <span className="button-text">
          {autoBuyEnabled ? '🤖 Auto-Buy: ON' : '🤖 Auto-Buy: OFF'}
        </span>
        <span className="button-subtext">
          {autoBuyEnabled
            ? `Next buy: ${formatTime(timeUntilNextAutoBuy)} (${autoBuyInterval}s interval)`
            : `Click to enable (${autoBuyInterval}s interval)`}
        </span>
      </button>

      {/* Speed upgrades moved to Upgrades tab */}
      <div className="auto-buy-info">
        <span className="info-text">Speed Level: {autoBuySpeedLevel}{maxLevel ? ' (MAX)' : ''} • Interval: {autoBuyInterval}s</span>
      </div>
    </div>
  );
};
