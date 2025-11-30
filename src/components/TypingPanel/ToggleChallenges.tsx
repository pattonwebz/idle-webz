import type { FC } from 'react';
import '../TypingPanel.scss';

interface ToggleChallengesProps {
  enabled: boolean;
  onToggle: () => void;
}

export const ToggleChallenges: FC<ToggleChallengesProps> = ({ enabled, onToggle }) => {
  return (
    <div className="challenge-toggle">
      <button className={`toggle-btn ${enabled ? 'on' : 'off'}`} onClick={onToggle} aria-label="Toggle typing challenges">
        {enabled ? 'Challenges: ON (auto)' : 'Challenges: OFF'}
      </button>
      {!enabled && (
        <span className="toggle-hint">You can still trigger a challenge manually when ready.</span>
      )}
    </div>
  );
};
