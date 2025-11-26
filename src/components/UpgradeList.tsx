/**
 * Upgrade list component displaying all available production upgrades
 */

import { useGame } from '../hooks/useGame';
import './UpgradeList.scss';
import { formatNumberAdaptive } from '../utils/gameUtils';

/**
 * Grid of upgrade cards that players can purchase to increase production
 * Cards show affordability status with visual indicators
 */
export const UpgradeList: React.FC = () => {
  const { upgrades, purchaseUpgrade } = useGame();

  // Determine the most cost-effective upgrade: lowest cost per 1/sec production
  const computeBestValueId = (): string | undefined => {
    const candidates = upgrades.filter(u => u.id !== 'manual' && u.productionRate > 0 && u.cost > 0);

    const pickBest = (list: typeof candidates) => {
      if (list.length === 0) return undefined;
      let bestId: string | undefined;
      let bestRatio = Number.POSITIVE_INFINITY;
      for (const u of list) {
        const ratio = u.cost / u.productionRate; // cost per 1/sec
        if (ratio < bestRatio) {
          bestRatio = ratio;
          bestId = u.id;
        }
      }
      return bestId;
    };

    // Always pick the global best, regardless of affordability
    return pickBest(candidates);
  };

  const bestValueId = computeBestValueId();

  // Replace local formatter with global helper that respects the threshold
  const formatNumber = (num: number): string => formatNumberAdaptive(num, 0, 2);

  /**
   * Handle upgrade purchase with click feedback
   */
  const handlePurchase = (upgradeId: string) => {
    purchaseUpgrade(upgradeId);
  };

  return (
    <div className="upgrade-list">
      <h2>Upgrades</h2>
      <div className="upgrades-container">
        {upgrades
          .filter(upgrade => upgrade.id !== 'manual')
          .map((upgrade) => (
            <div
              key={upgrade.id}
              className={`upgrade-card ${upgrade.canAfford ? 'affordable' : 'unaffordable'} ${bestValueId === upgrade.id ? 'best-value' : ''}`}
            >
              <div className="upgrade-header">
                <h3>{upgrade.name}</h3>
                <span className="upgrade-quantity">Owned: {upgrade.quantity}</span>
                {bestValueId === upgrade.id && (
                  <span className="best-value-badge" aria-label="Best value upgrade">Best value</span>
                )}
              </div>
              <p className="upgrade-description">{upgrade.description}</p>
              <div className="upgrade-stats">
                <span className="production-info">
                  Production: {formatNumber(upgrade.productionRate * upgrade.quantity)}/sec
                </span>
                <span className="spent-info">
                  Total Spent: {formatNumber(upgrade.totalSpent)}
                </span>
                <span className="avg-cost-info">
                  Cost/Resource: {upgrade.productionRate > 0 ? formatNumber(upgrade.cost / upgrade.productionRate) : '—'}
                </span>
                <span className="historical-cost-info">
                  Historical Cost/Resource: {upgrade.productionRate > 0 && upgrade.quantity > 0 ? formatNumber(upgrade.totalSpent / (upgrade.productionRate * upgrade.quantity)) : '—'}
                </span>
              </div>
              <button
                className="purchase-button"
                onClick={() => handlePurchase(upgrade.id)}
                disabled={!upgrade.canAfford}
                aria-label={`Buy ${upgrade.name} for ${formatNumber(upgrade.cost)} resources`}
              >
                Buy for {formatNumber(upgrade.cost)}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};
