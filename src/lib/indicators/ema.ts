import type { OHLCV } from '@/types';

export function calculateEMA(data: OHLCV[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(data.length).fill(null);
  if (period <= 0 || data.length < period) return result;

  const multiplier = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += data[i].close;
  let ema = sum / period;
  result[period - 1] = ema;

  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result[i] = ema;
  }
  return result;
}

export function getLatestEMA(data: OHLCV[], period: number): number {
  const values = calculateEMA(data, period);
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] !== null) return values[i] as number;
  }
  return data[data.length - 1]?.close ?? 0;
}
