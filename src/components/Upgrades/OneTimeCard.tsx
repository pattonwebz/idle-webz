import type { FC } from 'react';
import '../Upgrades.scss';
import { formatNumberAdaptive } from '../../utils/gameUtils';

interface OneTimeCardProps {
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  canAfford: boolean;
  onPurchase: () => boolean | void;
  icon?: string;
}

export const OneTimeCard: FC<OneTimeCardProps> = ({ name, description, cost, purchased, canAfford, onPurchase, icon }) => {
  return (
    <div className={`upgrade-card ${purchased ? 'purchased' : ''} ${canAfford && !purchased ? 'affordable' : ''}`}>
      <div className="upgrade-header">
        <h3 className="upgrade-name">{icon ? `${icon} ` : ''}{name}</h3>
        {purchased && <span className="purchased-badge badge">✓ Owned</span>}
      </div>
      <p className="upgrade-description">{description}</p>
      <div className="upgrade-footer">
        {!purchased ? (
          <button
            className={`upgrade-button ${canAfford ? 'affordable' : 'unaffordable'}`}
            onClick={onPurchase}
            disabled={!canAfford}
            aria-label={`Purchase ${name}`}
          >
            <span className="button-text">Purchase</span>
            <span className="button-cost pill">{formatNumberAdaptive(cost, 0, 1)}</span>
          </button>
        ) : (
          <div className="purchased-status">
            <span className="status-text">Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
