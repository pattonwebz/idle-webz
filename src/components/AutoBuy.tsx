/**
 * Auto-buy feature component
 */

import { useGame } from '../hooks/useGame';
import './AutoBuy.scss';
import { formatNumberAdaptive } from '../utils/gameUtils';

/**
 * Displays auto-buy toggle button and speed upgrades
 * Auto-buy purchases the best value affordable producer at regular intervals
 */
export const AutoBuy: React.FC = () => {
  const {
    autoBuyEnabled,
    timeUntilNextAutoBuy,
    autoBuySpeedLevel,
    autoBuySpeedUpgradeCost,
    canAffordAutoBuySpeedUpgrade,
    autoBuyInterval,
    toggleAutoBuy,
    purchaseAutoBuySpeedUpgrade,
    upgrades
  } = useGame();

  const autoBuyUpgrade = upgrades.find(u => u.id === 'autoBuy');
  const autoBuyUnlocked = autoBuyUpgrade?.purchased ?? false;

  const handleToggle = () => {
    toggleAutoBuy();
  };

  const handleSpeedUpgrade = () => {
    purchaseAutoBuySpeedUpgrade();
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

      {!maxLevel && (
        <button
          className={`auto-buy-speed-button ${canAffordAutoBuySpeedUpgrade ? 'affordable' : 'unaffordable'}`}
          onClick={handleSpeedUpgrade}
          disabled={!canAffordAutoBuySpeedUpgrade}
          aria-label={`Upgrade Auto-Buy Speed (Level ${autoBuySpeedLevel})`}
        >
          <span className="button-text">⚡ Speed Upgrade</span>
          <span className="button-subtext">
            Level {autoBuySpeedLevel} → {autoBuySpeedLevel + 1} (-2s) | Cost: {formatNumberAdaptive(autoBuySpeedUpgradeCost, 0, 1)}
          </span>
        </button>
      )}

      {maxLevel && (
        <div className="max-level-indicator">
          <span className="button-text">⚡ MAX SPEED</span>
          <span className="button-subtext">Level {autoBuySpeedLevel} (2s minimum)</span>
        </div>
      )}
    </div>
  );
};

