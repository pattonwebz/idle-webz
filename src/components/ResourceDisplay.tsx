/**
 * Display component for current resources and production rate
 */

import { useGame } from '../hooks/useGame';
import './ResourceDisplay.scss';
import { formatNumberUnified, getNumberFormatMode, setNumberFormatMode } from '../utils/gameUtils';

/**
 * Shows the player's current resource count and production rate per second
 * Numbers automatically format to scientific notation for large values
 */
export const ResourceDisplay: React.FC = () => {
  const { resources, productionRate } = useGame();
  const [mode, setMode] = React.useState(getNumberFormatMode());

  const toggleMode = () => {
    const next = mode === 'scientific' ? 'suffix' : 'scientific';
    setMode(next);
    setNumberFormatMode(next);
  };

  return (
    <div className="resource-display">
      <div className="resource-count">
        <span className="label">Resources:</span>
        <span className="value" aria-label={`Current resources: ${resources}`} title={`Exact: ${resources}`}>
          {formatNumberUnified(resources, mode, 2, 2)}
        </span>
      </div>
      <div className="production-rate">
        <span className="label">Per Second:</span>
        <span className="value" aria-label={`Production rate: ${productionRate} per second`} title={`Exact: ${productionRate}`}>
          {formatNumberUnified(productionRate, mode, 2, 2)}
        </span>
      </div>
      <button className="format-toggle" onClick={toggleMode} aria-label={`Toggle number format (current: ${mode})`}>
        Format: {mode === 'scientific' ? 'Scientific' : 'Suffix'}
      </button>
    </div>
  );
};
