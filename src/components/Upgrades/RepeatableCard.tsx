import type { FC } from 'react';
import '../Upgrades.scss';
import { formatNumberAdaptive } from '../../utils/gameUtils';

interface RepeatableCardProps {
  title: string;
  level: number;
  cost: number;
  canAfford: boolean;
  onPurchase: () => boolean | void;
  description?: string;
}

export const RepeatableCard: FC<RepeatableCardProps> = ({ title, level, cost, canAfford, onPurchase, description }) => {
  return (
    <div className={`upgrade-card repeatable ${canAfford ? 'affordable' : ''}`}>
      <div className="upgrade-header">
        <h3 className="upgrade-name">{title}</h3>
        <span className="upgrade-level badge">Lvl {level}</span>
      </div>
      {description && <p className="upgrade-description">{description}</p>}
      <div className="upgrade-footer">
        <button
          className={`upgrade-button ${canAfford ? 'affordable' : 'unaffordable'}`}
          onClick={onPurchase}
          disabled={!canAfford}
          aria-label={`Purchase ${title}`}
        >
          <span className="button-text">Upgrade</span>
          <span className="button-cost pill">{formatNumberAdaptive(cost, 0, 1)}</span>
        </button>
      </div>
    </div>
  );
};
