import type { OHLCV } from '@/types';

export function calculateSMA(data: OHLCV[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(data.length).fill(null);
  if (period <= 0 || data.length < period) return result;

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close;
    if (i >= period) sum -= data[i - period].close;
    if (i >= period - 1) result[i] = sum / period;
  }
  return result;
}

export function getLatestSMA(data: OHLCV[], period: number): number {
  const values = calculateSMA(data, period);
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] !== null) return values[i] as number;
  }
  return data[data.length - 1]?.close ?? 0;
}
