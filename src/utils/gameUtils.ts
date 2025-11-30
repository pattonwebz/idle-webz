/**
 * Utility functions for the Incremental Clicker Game
 */

import { SCIENTIFIC_NOTATION_THRESHOLD } from '../constants/gameConstants';

/**
 * Format a number for display with appropriate notation using the global threshold
 *
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string representation
 *
 * @example
 * formatNumber(123.456) // "123.46"
 * formatNumber(1234567) // "1.23e+6"
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (num < SCIENTIFIC_NOTATION_THRESHOLD) {
    return num.toFixed(decimals);
  }
  return num.toExponential(decimals);
}

/**
 * Format a number with different decimals for small vs large values, using the global threshold.
 * Useful when you want 0 decimals for small values but 2 decimals in scientific notation, etc.
 */
export function formatNumberAdaptive(
  num: number,
  smallDecimals: number = 0,
  largeDecimals: number = 2,
  threshold: number = SCIENTIFIC_NOTATION_THRESHOLD
): string {
  if (num < threshold) {
    return num.toFixed(smallDecimals);
  }
  return num.toExponential(largeDecimals);
}

/**
 * Format a number with suffix notation (K, M, B, T, etc.)
 *
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with suffix
 *
 * @example
 * formatNumberWithSuffix(1234) // "1.23K"
 * formatNumberWithSuffix(1234567) // "1.23M"
 */
export function formatNumberWithSuffix(num: number, decimals: number = 2): string {
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

  if (num < 1000) {
    return num.toFixed(decimals);
  }

  const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
  const suffix = suffixes[tier] || `e${tier * 3}`;
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;

  return scaled.toFixed(decimals) + suffix;
}

/**
 * Calculate the cost of an upgrade at a given quantity
 *
 * @param baseCost - The initial cost of the upgrade
 * @param multiplier - The cost multiplier per purchase
 * @param quantity - Current quantity owned
 * @returns The cost for the next purchase
 *
 * @example
 * calculateUpgradeCost(10, 1.15, 5) // 20.11
 */
export function calculateUpgradeCost(
  baseCost: number,
  multiplier: number,
  quantity: number
): number {
  return Math.floor(baseCost * Math.pow(multiplier, quantity));
}

/**
 * Calculate total production from multiple upgrade quantities
 *
 * @param upgrades - Array of upgrades with rate and quantity
 * @returns Total production per second
 */
export function calculateTotalProduction(
  upgrades: Array<{ productionRate: number; quantity: number }>
): number {
  return upgrades.reduce((total, upgrade) => {
    return total + (upgrade.productionRate * upgrade.quantity);
  }, 0);
}

/**
 * Safely parse JSON from localStorage with fallback
 *
 * @param key - LocalStorage key
 * @param fallback - Default value if parsing fails
 * @returns Parsed data or fallback
 */
export function safelyParseJSON<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error);
    return fallback;
  }
}

/**
 * Safely stringify and save to localStorage
 *
 * @param key - LocalStorage key
 * @param data - Data to save
 * @returns Success boolean
 */
export function safelySaveJSON(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clamp a number between min and max values
 *
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate time until player can afford an upgrade
 *
 * @param currentResources - Current resource count
 * @param cost - Cost of the upgrade
 * @param productionRate - Current production per second
 * @returns Seconds until affordable, or null if already affordable or no production
 */
export function timeUntilAffordable(
  currentResources: number,
  cost: number,
  productionRate: number
): number | null {
  if (currentResources >= cost) {
    return null; // Already affordable
  }

  if (productionRate <= 0) {
    return null; // Will never be affordable without production
  }

  const deficit = cost - currentResources;
  return deficit / productionRate;
}

/**
 * Format seconds into a human-readable time string
 *
 * @param seconds - Number of seconds
 * @returns Formatted time string
 *
 * @example
 * formatTime(65) // "1m 5s"
 * formatTime(3665) // "1h 1m 5s"
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export type NumberFormatMode = 'scientific' | 'suffix';
const NUMBER_FORMAT_MODE_KEY = 'numberFormatMode';

export function getNumberFormatMode(): NumberFormatMode {
  const raw = localStorage.getItem(NUMBER_FORMAT_MODE_KEY);
  return raw === 'suffix' || raw === 'scientific' ? (raw as NumberFormatMode) : 'scientific';
}

export function setNumberFormatMode(mode: NumberFormatMode): void {
  localStorage.setItem(NUMBER_FORMAT_MODE_KEY, mode);
}

/**
 * Unified number formatting based on selected mode.
 * - scientific: uses formatNumberAdaptive/formatNumber
 * - suffix: uses formatNumberWithSuffix
 */
export function formatNumberUnified(
  num: number,
  mode: NumberFormatMode = getNumberFormatMode(),
  smallDecimals = 2,
  largeDecimals = 2
): string {
  if (mode === 'suffix') {
    return formatNumberWithSuffix(num, smallDecimals);
  }
  return formatNumberAdaptive(num, smallDecimals, largeDecimals);
}

/** Exact formatting for tooltips */
export function formatExact(num: number): string {
  // Show up to 6 decimals for small numbers, full exponential for large
  if (num < SCIENTIFIC_NOTATION_THRESHOLD) {
    return num.toFixed(6);
  }
  return num.toExponential(6);
}
