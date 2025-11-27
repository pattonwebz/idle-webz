/**
 * Main click button component for manual resource production
 */

import { useGame } from '../hooks/useGame';
import { BASE_CLICK_POWER } from '../constants/gameConstants';
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
        aria-label="Write code (click) to produce resources"
      >
        <span className="button-text">Write Code (Click)</span>
        <span className="button-subtext">+{BASE_CLICK_POWER} per click | Try typing for combos</span>
      </button>
    </div>
  );
};
