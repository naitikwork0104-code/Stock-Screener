import { describe, it, expect } from 'vitest';
import type { OHLCV } from '@/types';
import { calculateSMA, calculateEMA, calculateRSI, calculateBollingerBands, calculateMACD, calculateATR } from '@/lib/indicators';

function makeOHLCV(count: number, basePrice = 100): OHLCV[] {
  const data: OHLCV[] = [];
  for (let i = 0; i < count; i++) {
    const close = basePrice + Math.sin(i * 0.1) * 10;
    data.push({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      open: close - 1,
      high: close + 2,
      low: close - 2,
      close,
      volume: 1_000_000 + i * 1000,
    });
  }
  return data;
}

describe('Indicators', () => {
  const data = makeOHLCV(50);

  it('calculates SMA correctly', () => {
    const sma = calculateSMA(data, 10);
    expect(sma[9]).not.toBeNull();
    expect(sma[8]).toBeNull();
    const expected = data.slice(0, 10).reduce((s, d) => s + d.close, 0) / 10;
    expect(sma[9]).toBeCloseTo(expected, 2);
  });

  it('calculates EMA correctly', () => {
    const ema = calculateEMA(data, 10);
    expect(ema[9]).not.toBeNull();
    expect(ema[8]).toBeNull();
  });

  it('calculates RSI in valid range', () => {
    const rsi = calculateRSI(data, 14);
    const lastRsi = rsi.filter((v) => v !== null).pop();
    expect(lastRsi).toBeGreaterThanOrEqual(0);
    expect(lastRsi).toBeLessThanOrEqual(100);
  });

  it('calculates Bollinger Bands', () => {
    const bands = calculateBollingerBands(data, 20);
    const last = data.length - 1;
    expect(bands.upper[last]).not.toBeNull();
    expect(bands.lower[last]).not.toBeNull();
    expect(bands.upper[last]!).toBeGreaterThan(bands.lower[last]!);
  });

  it('calculates MACD', () => {
    const macd = calculateMACD(data);
    const hasSignal = macd.signal.some((v) => v !== null);
    expect(hasSignal).toBe(true);
  });

  it('calculates ATR', () => {
    const atr = calculateATR(data, 14);
    const lastAtr = atr.filter((v) => v !== null).pop();
    expect(lastAtr).toBeGreaterThan(0);
  });
});
