/**
 * Display component for current resources and production rate
 */

import { useGame } from '../hooks/useGame';
import './ResourceDisplay.scss';
import { formatNumberAdaptive } from '../utils/gameUtils';

/**
 * Shows the player's current resource count and production rate per second
 * Numbers automatically format to scientific notation for large values
 */
export const ResourceDisplay: React.FC = () => {
  const { resources, productionRate } = useGame();

  return (
    <div className="resource-display">
      <div className="resource-count">
        <span className="label">Resources:</span>
        <span className="value" aria-label={`Current resources: ${resources}`}>
          {formatNumberAdaptive(resources, 2, 2)}
        </span>
      </div>
      <div className="production-rate">
        <span className="label">Per Second:</span>
        <span className="value" aria-label={`Production rate: ${productionRate} per second`}>
          {formatNumberAdaptive(productionRate, 2, 2)}
        </span>
      </div>
    </div>
  );
};
