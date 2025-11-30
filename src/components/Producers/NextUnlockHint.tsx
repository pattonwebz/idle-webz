import type { FC } from 'react';
import '../ProducerList.scss';
import { formatNumberAdaptive } from '../../utils/gameUtils';

interface NextUnlockHintProps {
  lockedProducers: Array<{ name: string; unlockThreshold?: number }>;
}

export const NextUnlockHint: FC<NextUnlockHintProps> = ({ lockedProducers }) => {
  if (!lockedProducers || lockedProducers.length === 0) return null;
  const next = lockedProducers[0];
  const formatNumber = (n: number) => formatNumberAdaptive(n, 0, 2);
  return (
    <div className="locked-hint" aria-live="polite">
      <span className="unlock-icon">🔒 Next Unlock</span>
      <span className="unlock-name">{next.name}</span>
      <span className="unlock-cost">{formatNumber(next.unlockThreshold || 0)}</span>
    </div>
  );
};
