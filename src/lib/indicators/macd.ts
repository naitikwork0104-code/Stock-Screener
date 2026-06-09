import type { OHLCV } from '@/types';

function emaFromCloses(closes: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += closes[i];
  let ema = sum / period;
  result[period - 1] = ema;
  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] - ema) * multiplier + ema;
    result[i] = ema;
  }
  return result;
}

export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD(
  data: OHLCV[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult {
  const closes = data.map((d) => d.close);
  const len = closes.length;
  const macd: (number | null)[] = new Array(len).fill(null);
  const signal: (number | null)[] = new Array(len).fill(null);
  const histogram: (number | null)[] = new Array(len).fill(null);

  if (len < slowPeriod) return { macd, signal, histogram };

  const fastEma = emaFromCloses(closes, fastPeriod);
  const slowEma = emaFromCloses(closes, slowPeriod);

  const macdValues: number[] = [];
  for (let i = slowPeriod - 1; i < len; i++) {
    const val = fastEma[i] - slowEma[i];
    macd[i] = val;
    macdValues.push(val);
  }

  if (macdValues.length >= signalPeriod) {
    const signalEma = emaFromCloses(macdValues, signalPeriod);
    for (let i = 0; i < signalEma.length; i++) {
      const dataIdx = slowPeriod - 1 + i;
      signal[dataIdx] = signalEma[i];
      if (macd[dataIdx] !== null && signal[dataIdx] !== null) {
        histogram[dataIdx] = (macd[dataIdx] as number) - (signal[dataIdx] as number);
      }
    }
  }

  return { macd, signal, histogram };
}

export function getLatestMACDSignal(data: OHLCV[]): number {
  const { signal } = calculateMACD(data);
  for (let i = signal.length - 1; i >= 0; i--) {
    if (signal[i] !== null) return signal[i] as number;
  }
  return 0;
}
