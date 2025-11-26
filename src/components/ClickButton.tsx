/**
 * Main click button component for manual resource production
 */

import { useGame } from '../hooks/useGame';
import './ClickButton.scss';

/**
 * Circular button that awards +1 resource per click
 * Features visual feedback on hover and click
 */
export const ClickButton: React.FC = () => {
  const { click } = useGame();

  return (
    <div className="click-button-container">
      <button
        className="click-button"
        onClick={click}
        aria-label="Click to produce resources"
      >
        <span className="button-text">Produce Resource</span>
        <span className="button-subtext">+1 per click</span>
      </button>
    </div>
  );
};
