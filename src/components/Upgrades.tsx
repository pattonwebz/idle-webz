/**
 * Upgrades component - displays purchasable one-time upgrades
 */

import { useGame } from '../hooks/useGame';
import { formatNumberAdaptive } from '../utils/gameUtils';
import './Upgrades.scss';

/**
 * Displays all available one-time upgrades that unlock game features
 */
export const Upgrades: React.FC = () => {
  const { upgrades, purchaseUpgrade, clickPowerLevel, clickValue, clickPowerUpgradeCost, canAffordClickPowerUpgrade, purchaseClickPowerUpgrade, autoBuySpeedLevel, autoBuySpeedUpgradeCost, canAffordAutoBuySpeedUpgrade, purchaseAutoBuySpeedUpgrade } = useGame();

  const handlePurchase = (upgradeId: string) => {
    purchaseUpgrade(upgradeId);
  };

  const autoBuyUnlocked = upgrades.find(u => u.id === 'autoBuy')?.purchased ?? false;
  const typingUnlocked = upgrades.find(u => u.id === 'typing')?.purchased ?? false;

  return (
    <div className="upgrades-container">
      <h2 className="upgrades-title">Upgrades</h2>
      <div className="repeatable-upgrades">
        {/* Click Power repeatable upgrade */}
        <div className={`upgrade-card repeatable ${canAffordClickPowerUpgrade ? 'affordable' : ''}`}>
          <div className="upgrade-header">
            <h3 className="upgrade-name">⚙️ Click Power</h3>
            <span className="upgrade-level badge">Lvl {clickPowerLevel}</span>
          </div>
          <p className="upgrade-description">Increase manual click value (current: +{clickValue} per click). Each level doubles click value. Cost doubles each purchase.</p>
          <div className="upgrade-footer">
            <button
              className={`upgrade-button ${canAffordClickPowerUpgrade ? 'affordable' : 'unaffordable'}`}
              onClick={() => purchaseClickPowerUpgrade()}
              disabled={!canAffordClickPowerUpgrade}
              aria-label="Purchase Click Power upgrade"
            >
              <span className="button-text">Upgrade</span>
              <span className="button-cost pill">{formatNumberAdaptive(clickPowerUpgradeCost, 0, 1)}</span>
            </button>
          </div>
        </div>

        {/* Auto-Buy Speed repeatable upgrade (visible after Auto-Buy unlock) */}
        {autoBuyUnlocked && (
          <div className={`upgrade-card repeatable ${canAffordAutoBuySpeedUpgrade ? 'affordable' : ''}`}>
            <div className="upgrade-header">
              <h3 className="upgrade-name">⚡ Auto-Buy Speed</h3>
              <span className="upgrade-level badge">Lvl {autoBuySpeedLevel}</span>
            </div>
            <p className="upgrade-description">Reduce auto-buy interval by 2s per level (min 2s). Current interval depends on level.</p>
            <div className="upgrade-footer">
              <button
                className={`upgrade-button ${canAffordAutoBuySpeedUpgrade ? 'affordable' : 'unaffordable'}`}
                onClick={() => purchaseAutoBuySpeedUpgrade()}
                disabled={!canAffordAutoBuySpeedUpgrade}
                aria-label="Purchase Auto-Buy Speed upgrade"
              >
                <span className="button-text">Upgrade</span>
                <span className="button-cost pill">{formatNumberAdaptive(autoBuySpeedUpgradeCost, 0, 1)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="upgrades-grid">
        {upgrades
          .filter(upg => !(upg.id === 'challenges' && !typingUnlocked))
          .map(upgrade => (
          <div
            key={upgrade.id}
            className={`upgrade-card ${upgrade.purchased ? 'purchased' : ''} ${upgrade.canAfford && !upgrade.purchased ? 'affordable' : ''}`}
          >
            <div className="upgrade-header">
              <h3 className="upgrade-name">{upgrade.id === 'typing' ? '⌨️ ' : upgrade.id === 'autoBuy' ? '🤖 ' : upgrade.id === 'challenges' ? '🎯 ' : ''}{upgrade.name}</h3>
              {upgrade.purchased && <span className="purchased-badge badge">✓ Owned</span>}
            </div>
            <p className="upgrade-description">{upgrade.description}</p>
            <div className="upgrade-footer">
              {!upgrade.purchased ? (
                <button
                  className={`upgrade-button ${upgrade.canAfford ? 'affordable' : 'unaffordable'}`}
                  onClick={() => handlePurchase(upgrade.id)}
                  disabled={!upgrade.canAfford}
                  aria-label={`Purchase ${upgrade.name}`}
                >
                  <span className="button-text">Purchase</span>
                  <span className="button-cost pill">{formatNumberAdaptive(upgrade.cost, 0, 1)}</span>
                </button>
              ) : (
                <div className="purchased-status">
                  <span className="status-text">Active</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
