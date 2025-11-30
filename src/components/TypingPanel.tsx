import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useGame } from '../hooks/useGame';
import './TypingPanel.scss';

export const TypingPanel: FC = () => {
  const { typeChar, currentStreakMultiplier, streakWords, wordsTyped, challenge, nextChallengeInWords, triggerChallenge, typingUnlocked, challengesUnlocked, challengesEnabled, toggleChallenges } = useGame();
  const [inputValue, setInputValue] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value;
    // Determine typed segment compared to previous value
    const diff = newValue.slice(inputValue.length);
    for (const ch of diff) {
      typeChar(ch);
      // Word boundary handled inside engine
    }
    setInputValue(newValue);
  }, [inputValue, typeChar]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Optional: allow ESC to clear
    if (e.key === 'Escape') {
      setInputValue('');
    }
  }, []);

  const handleKeyUp = useCallback(() => {
    // No-op now; previously used for cheat tracking
  }, []);

  if (!typingUnlocked) {
    return null;
  }

  return (
    <div className="typing-panel">
      <h2>Coding Session (Typing)</h2>
      {challengesUnlocked && challenge && (
        <div className="challenge-box" aria-live="polite">
          <div className="challenge-header">
            <strong>Challenge:</strong> {challenge.description} ({challenge.id})
          </div>
          {!challenge.startedOnNewLine && (
            <div className="challenge-start-hint">Press Enter on an empty line to begin typing this challenge.</div>
          )}
          <div className="challenge-snippet">
            <code>
              <span className="typed">{challenge.snippet.slice(0, challenge.progress)}</span>
              <span className="remaining">{challenge.snippet.slice(challenge.progress)}</span>
            </code>
          </div>
          <div className="challenge-meta">
            <span>Time Left: {challenge.timeRemaining}s</span>
            <span>Progress: {challenge.progress}/{challenge.total}</span>
            <span>{challenge.startedOnNewLine ? '⏱ Active' : '⏸ Waiting for newline'}</span>
          </div>
        </div>
      )}
      {challengesUnlocked && !challenge && (
        <div className="challenge-ready" aria-live="polite">
          {nextChallengeInWords === 0 ? (
            <button className="challenge-trigger" onClick={() => triggerChallenge()}>
              ▶ Start Mini Challenge
            </button>
          ) : (
            <span>Next challenge in {nextChallengeInWords} word{nextChallengeInWords !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}
      <textarea
        className="typing-input"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder={challengesUnlocked
          ? "Type code or words here... (bonuses for words & streaks; challenges add big rewards)"
          : "Type code or words here... (bonuses for words & streaks)"
        }
        aria-label="Type to produce resources"
      />
      <div className="typing-stats">
        <span>Words Typed: {wordsTyped}</span>
        <span>Current Streak: {streakWords}</span>
        <span>Streak Multiplier: x{currentStreakMultiplier.toFixed(2)}</span>
      </div>
      {/* Challenges toggle */}
      {challengesUnlocked && (
        <div className="challenge-toggle">
          <button className={`toggle-btn ${challengesEnabled ? 'on' : 'off'}`} onClick={toggleChallenges} aria-label="Toggle typing challenges">
            {challengesEnabled ? 'Challenges: ON (auto)' : 'Challenges: OFF'}
          </button>
          {!challengesEnabled && (
            <span className="toggle-hint">You can still trigger a challenge manually when ready.</span>
          )}
        </div>
      )}
      <p className="typing-hint">
        No reward for the 3rd identical char. Complete words for bonus & streak.
        {challengesUnlocked && " Complete mini challenges fast for big rewards."}
        {!challengesUnlocked && " Unlock Challenges in the Upgrades tab for even bigger rewards!"}
      </p>
    </div>
  );
};
