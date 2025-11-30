/**
 * Producer list component displaying all available production producers
 */

import { useGame } from '../hooks/useGame';
import './ProducerList.scss';
import { formatNumberAdaptive } from '../utils/gameUtils';
import { NextUnlockHint } from './Producers/NextUnlockHint';

/**
 * Grid of producer cards that players can purchase to increase production
 * Cards show affordability status with visual indicators
 */
export const ProducerList: React.FC = () => {
  const { producers, purchaseProducer, bestValueProducerId } = useGame();

  // Replace local formatter with global helper that respects the threshold
  const formatNumber = (num: number): string => formatNumberAdaptive(num, 0, 2);

  /**
   * Handle producer purchase with click feedback
   */
  const handlePurchase = (producerId: string) => {
    purchaseProducer(producerId);
  };

  const visibleProducers = producers.filter(p => p.id !== 'codingSession' && p.unlocked);
  const lockedProducers = producers.filter(p => p.id !== 'codingSession' && !p.unlocked).sort((a,b)=> (a.unlockThreshold??0)-(b.unlockThreshold??0));

  return (
    <div className="producer-list">
      <h2>Infrastructure & Automation</h2>
      <div className="producers-container">
        {visibleProducers.map((producer) => (
            <div
              key={producer.id}
              className={`producer-card ${producer.canAfford ? 'affordable' : 'unaffordable'} ${bestValueProducerId === producer.id ? 'best-value' : ''}`}
            >
              <div className="producer-header">
                <h3>{producer.name}</h3>
                <span className="producer-quantity">Owned: {producer.quantity}</span>
                {bestValueProducerId === producer.id && (
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
          {lockedProducers.length > 0 && (
          <NextUnlockHint lockedProducers={lockedProducers as any} />
        )}
      </div>
    </div>
  );
};
