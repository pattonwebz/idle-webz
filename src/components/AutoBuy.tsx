/**
 * Auto-buy feature component
 */

import { useGame } from '../hooks/useGame';
import './AutoBuy.scss';

/**
 * Displays auto-buy unlock/toggle button
 * Auto-buy purchases the best value affordable producer every 30 seconds when enabled
 */
export const AutoBuy: React.FC = () => {
  const { autoBuyUnlocked, autoBuyEnabled, resources, timeUntilNextAutoBuy, unlockAutoBuy, toggleAutoBuy } = useGame();

  const handleUnlock = () => {
    unlockAutoBuy();
  };

  const handleToggle = () => {
    toggleAutoBuy();
  };

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return 'Ready';
    return `${seconds}s`;
  };

  if (!autoBuyUnlocked) {
    const canAfford = resources >= 10000;
    return (
      <div className="auto-buy-container">
        <button
          className={`auto-buy-unlock-button ${canAfford ? 'affordable' : 'unaffordable'}`}
          onClick={handleUnlock}
          disabled={!canAfford}
          aria-label="Unlock Auto-Buy for 10,000 resources"
        >
          <span className="button-text">🤖 Unlock Auto-Buy</span>
          <span className="button-subtext">Cost: 10,000</span>
        </button>
      </div>
    );
  }

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
            ? `Next buy: ${formatTime(timeUntilNextAutoBuy)}`
            : 'Click to enable'}
        </span>
      </button>
    </div>
  );
};

