/**
 * Upgrades component - displays purchasable one-time upgrades
 */

import { useGame } from '../hooks/useGame';
import { formatNumberAdaptive } from '../utils/gameUtils';
import './Upgrades.scss';
import { RepeatableCard } from './Upgrades/RepeatableCard';
import { OneTimeCard } from './Upgrades/OneTimeCard';

/**
 * Displays all available one-time upgrades that unlock game features
 */
export const Upgrades: React.FC = () => {
  const { upgrades, purchaseUpgrade, clickPowerLevel, clickValue, clickPowerUpgradeCost, canAffordClickPowerUpgrade, purchaseClickPowerUpgrade, autoBuySpeedLevel, autoBuySpeedUpgradeCost, canAffordAutoBuySpeedUpgrade, purchaseAutoBuySpeedUpgrade } = useGame();

  const handlePurchase = (upgradeId: string) => {
    purchaseUpgrade(upgradeId);
  };

  const autoBuyUnlocked = upgrades.find(u => u.id === 'autoBuy')?.purchased ?? false;
  const typingUnlocked = upgrades.find(u => u.id === 'typing')?.purchased ?? false;

  return (
    <div className="upgrades-container">
      <h2 className="upgrades-title">Upgrades</h2>
      <div className="repeatable-upgrades">
        {/* Click Power repeatable upgrade */}
        <RepeatableCard
          title="⚙️ Click Power"
          level={clickPowerLevel}
          cost={clickPowerUpgradeCost}
          canAfford={canAffordClickPowerUpgrade}
          onPurchase={purchaseClickPowerUpgrade}
          description={`Increase manual click value (current: +${clickValue} per click). Each level doubles click value. Cost doubles each purchase.`}
        />

        {/* Auto-Buy Speed repeatable upgrade (visible after Auto-Buy unlock) */}
        {autoBuyUnlocked && (
          <RepeatableCard
            title="⚡ Auto-Buy Speed"
            level={autoBuySpeedLevel}
            cost={autoBuySpeedUpgradeCost}
            canAfford={canAffordAutoBuySpeedUpgrade}
            onPurchase={purchaseAutoBuySpeedUpgrade}
            description="Reduce auto-buy interval by 2s per level (min 2s). Current interval depends on level."
          />
        )}
      </div>
      <div className="upgrades-grid">
        {upgrades
          .filter(upg => !(upg.id === 'challenges' && !typingUnlocked))
          .map(upgrade => (
            <OneTimeCard
              key={upgrade.id}
              name={upgrade.name}
              description={upgrade.description}
              cost={upgrade.cost}
              purchased={upgrade.purchased}
              canAfford={upgrade.canAfford}
              onPurchase={() => handlePurchase(upgrade.id)}
              icon={upgrade.id === 'typing' ? '⌨️' : upgrade.id === 'autoBuy' ? '🤖' : upgrade.id === 'challenges' ? '🎯' : undefined}
            />
          ))}
      </div>
    </div>
  );
};
