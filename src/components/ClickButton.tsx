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
  const { click, clickValue, cheatActive } = useGame();
  return (
    <div className="click-button-container">
      <button
        className={`click-button ${cheatActive ? 'cheat-active' : ''}`}
        onClick={click}
        aria-label="Write code (click) to produce resources"
      >
        <span className="button-text">Write Code {cheatActive && '⚡'}</span>
        <span className="button-subtext">+{clickValue} per click {cheatActive ? '| CHEAT x10 active!' : '| Try typing for combos'}</span>
      </button>
    </div>
  );
};
