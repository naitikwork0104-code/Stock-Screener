import type { OHLCV } from '@/types';
import { calculateSMA } from './sma';

export interface BollingerBands {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calculateBollingerBands(
  data: OHLCV[],
  period = 20,
  stdDevMultiplier = 2
): BollingerBands {
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = new Array(data.length).fill(null);
  const lower: (number | null)[] = new Array(data.length).fill(null);

  for (let i = period - 1; i < data.length; i++) {
    if (middle[i] === null) continue;
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = data[j].close - (middle[i] as number);
      sumSq += diff * diff;
    }
    const std = Math.sqrt(sumSq / period);
    upper[i] = (middle[i] as number) + stdDevMultiplier * std;
    lower[i] = (middle[i] as number) - stdDevMultiplier * std;
  }

  return { upper, middle, lower };
}

export function getBollingerPosition(data: OHLCV[], period = 20): number {
  const bands = calculateBollingerBands(data, period);
  const last = data.length - 1;
  const upper = bands.upper[last];
  const lower = bands.lower[last];
  const close = data[last]?.close ?? 0;
  if (upper === null || lower === null || upper === lower) return 0.5;
  return (close - lower) / (upper - lower);
}
