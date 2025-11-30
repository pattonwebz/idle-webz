import type { ProducerTier } from '../GameEngine';

export class ProducerManager {
  private bestValueId: string | undefined;
  private lastCalc = 0;

  /** Calculate exponential cost */
  getCost(p: ProducerTier): number {
    return Math.floor(p.baseCost * Math.pow(p.costMultiplier, p.quantity));
  }

  canAfford(p: ProducerTier, resources: number): boolean {
    const cost = this.getCost(p);
    return cost > 0 && resources >= cost;
  }

  /** Recompute best value (cost per production) with 5s throttle */
  recalcBestValue(producers: ProducerTier[], now = Date.now()): void {
    if (now - this.lastCalc < 5000 && this.bestValueId) return;
    this.lastCalc = now;

    const candidates = producers.filter(p => p.id !== 'codingSession' && p.productionRate > 0);
    if (candidates.length === 0) { this.bestValueId = undefined; return; }

    let best = candidates[0];
    let bestRatio = this.getCost(best) / best.productionRate;
    for (const p of candidates) {
      const ratio = this.getCost(p) / p.productionRate;
      if (ratio < bestRatio) { best = p; bestRatio = ratio; }
    }
    this.bestValueId = best.id;
  }

  getBestValueId(): string | undefined { return this.bestValueId; }

  /** Unlock producers based on resources */
  applyUnlocks(producers: ProducerTier[], resources: number, unlocked: Set<string>): void {
    for (const p of producers) {
      if (p.unlockThreshold && p.unlockThreshold > 0 && !unlocked.has(p.id) && resources >= p.unlockThreshold) {
        unlocked.add(p.id);
      }
    }
  }

  /** Perform a purchase and update totals */
  purchase(target: ProducerTier, resources: number): { success: boolean; newResources: number } {
    const cost = this.getCost(target);
    if (resources < cost || cost <= 0) return { success: false, newResources: resources };
    target.quantity++;
    target.totalSpent += cost;
    return { success: true, newResources: resources - cost };
  }

  /** Total production excluding manual */
  totalProduction(producers: ProducerTier[]): number {
    return producers.reduce((sum, p) => p.id === 'codingSession' ? sum : sum + p.productionRate * p.quantity, 0);
  }
}
