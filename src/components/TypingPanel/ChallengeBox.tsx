import type { FC } from 'react';
import '../TypingPanel.scss';

interface ChallengeBoxProps {
  challenge: { id: string; snippet: string; description: string; progress: number; total: number; timeRemaining: number; startedOnNewLine: boolean };
}

export const ChallengeBox: FC<ChallengeBoxProps> = ({ challenge }) => {
  return (
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
  );
};
