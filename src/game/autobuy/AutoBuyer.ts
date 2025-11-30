import type { ProducerTier } from '../GameEngine';

export class AutoBuyer {
  private enabled = false;
  private speedLevel = 0;
  private lastBuy = Date.now();

  toggle(): void {
    this.enabled = !this.enabled;
    if (this.enabled) this.lastBuy = Date.now();
  }

  setEnabled(val: boolean): void {
    this.enabled = val;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getSpeedLevel(): number {
    return this.speedLevel;
  }

  setSpeedLevel(level: number): void {
    this.speedLevel = level;
  }

  getIntervalMs(): number {
    const baseInterval = 30000; // 30s
    const reduction = this.speedLevel * 2000;
    const minInterval = 2000;
    return Math.max(minInterval, baseInterval - reduction);
  }

  getSecondsUntilNext(now: number): number {
    if (!this.enabled) return 0;
    const remaining = Math.max(0, this.getIntervalMs() - (now - this.lastBuy));
    return Math.ceil(remaining / 1000);
  }

  /** Returns the id of the purchased producer, or null if none */
  tryPurchaseBest(now: number, resources: number, producers: ProducerTier[], getCost: (id: string) => number): string | null {
    if (!this.enabled) return null;
    const elapsed = now - this.lastBuy;
    if (elapsed < this.getIntervalMs()) return null;

    const affordable = producers.filter(p => p.id !== 'codingSession' && resources >= getCost(p.id));
    if (affordable.length === 0) return null;

    let best = affordable[0];
    let bestRatio = getCost(best.id) / best.productionRate;
    for (const p of affordable) {
      const ratio = getCost(p.id) / p.productionRate;
      if (ratio < bestRatio) { best = p; bestRatio = ratio; }
    }

    this.lastBuy = now;
    return best.id;
  }

  getSpeedUpgradeCost(): number {
    const baseCost = 10000;
    const multiplier = 1.5;
    return Math.floor(baseCost * Math.pow(multiplier, this.speedLevel));
  }

  canAffordSpeedUpgrade(resources: number): boolean {
    return resources >= this.getSpeedUpgradeCost();
  }

  incrementSpeed(): void {
    if (this.speedLevel < 14) this.speedLevel++;
  }
}
