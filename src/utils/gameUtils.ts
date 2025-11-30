/**
 * Utility functions for the Incremental Clicker Game
 */

import { SCIENTIFIC_NOTATION_THRESHOLD } from '../constants/gameConstants';

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

  const parts = [] as string[];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
