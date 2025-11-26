/**
 * Producer list component displaying all available production producers
 */

import { useGame } from '../hooks/useGame';
import './ProducerList.scss';
import { formatNumberAdaptive } from '../utils/gameUtils';

/**
 * Grid of producer cards that players can purchase to increase production
 * Cards show affordability status with visual indicators
 */
export const ProducerList: React.FC = () => {
  const { producers, purchaseProducer } = useGame();

  // Determine the most cost-effective producer: lowest cost per 1/sec production
  const computeBestValueId = (): string | undefined => {
    const candidates = producers.filter(u => u.id !== 'manual' && u.productionRate > 0 && u.cost > 0);

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
   * Handle producer purchase with click feedback
   */
  const handlePurchase = (producerId: string) => {
    purchaseProducer(producerId);
  };

  return (
    <div className="producer-list">
      <h2>Producers</h2>
      <div className="producers-container">
        {producers
          .filter(producer => producer.id !== 'manual')
          .map((producer) => (
            <div
              key={producer.id}
              className={`producer-card ${producer.canAfford ? 'affordable' : 'unaffordable'} ${bestValueId === producer.id ? 'best-value' : ''}`}
            >
              <div className="producer-header">
                <h3>{producer.name}</h3>
                <span className="producer-quantity">Owned: {producer.quantity}</span>
                {bestValueId === producer.id && (
                  <span className="best-value-badge" aria-label="Best value producer">Best value</span>
                )}
              </div>
              <p className="producer-description">{producer.description}</p>
              <div className="producer-stats">
                <span className="production-info">
                  Production: {formatNumber(producer.productionRate * producer.quantity)}/sec
                </span>
                <span className="spent-info">
                  Total Spent: {formatNumber(producer.totalSpent)}
                </span>
                <span className="avg-cost-info">
                  Cost/Resource: {producer.productionRate > 0 ? formatNumber(producer.cost / producer.productionRate) : '—'}
                </span>
                <span className="historical-cost-info">
                  Historical Cost/Resource: {producer.productionRate > 0 && producer.quantity > 0 ? formatNumber(producer.totalSpent / (producer.productionRate * producer.quantity)) : '—'}
                </span>
              </div>
              <button
                className="purchase-button"
                onClick={() => handlePurchase(producer.id)}
                disabled={!producer.canAfford}
                aria-label={`Buy ${producer.name} for ${formatNumber(producer.cost)} resources`}
              >
                Buy for {formatNumber(producer.cost)}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

