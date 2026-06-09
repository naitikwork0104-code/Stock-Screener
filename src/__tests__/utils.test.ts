import { describe, it, expect } from 'vitest';
import { createSeededRandom, randomBetween, randomPick } from '@/lib/utils/random';
import { formatPrice, formatPercent, formatVolume, formatMarketCap } from '@/lib/utils/format';
import { generateAllStocks } from '@/lib/data/generator';
import { STOCK_COUNT } from '@/lib/data/constants';

describe('Random utilities', () => {
  it('produces reproducible sequences', () => {
    const rng1 = createSeededRandom(42);
    const rng2 = createSeededRandom(42);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it('randomBetween stays in range', () => {
    const rng = createSeededRandom(1);
    for (let i = 0; i < 100; i++) {
      const val = randomBetween(rng, 10, 20);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThan(20);
    }
  });

  it('randomPick selects from array', () => {
    const rng = createSeededRandom(1);
    const items = ['a', 'b', 'c'];
    expect(items).toContain(randomPick(rng, items));
  });
});

describe('Format utilities', () => {
  it('formats price', () => {
    expect(formatPrice(1234.56)).toContain('1,234');
    expect(formatPrice(0.5)).toBe('0.5000');
  });

  it('formats percent', () => {
    expect(formatPercent(5.5)).toBe('+5.50%');
    expect(formatPercent(-3.2)).toBe('-3.20%');
  });

  it('formats volume', () => {
    expect(formatVolume(1_500_000)).toBe('1.50M');
    expect(formatVolume(2_500)).toBe('2.50K');
  });

  it('formats market cap', () => {
    expect(formatMarketCap(1_500_000_000)).toBe('1.50B');
  });
});

describe('Data generation', () => {
  it('generates 5200+ stocks', () => {
    const stocks = generateAllStocks();
    expect(stocks.length).toBeGreaterThanOrEqual(STOCK_COUNT);
  });

  it('generates unique symbols', () => {
    const stocks = generateAllStocks(100);
    const symbols = new Set(stocks.map((s) => s.symbol));
    expect(symbols.size).toBe(100);
  });

  it('generates realistic fundamentals', () => {
    const stocks = generateAllStocks(10);
    stocks.forEach((s) => {
      expect(s.fundamentals.pe).toBeGreaterThan(0);
      expect(s.technical.rsi).toBeGreaterThanOrEqual(0);
      expect(s.technical.rsi).toBeLessThanOrEqual(100);
    });
  });
});
