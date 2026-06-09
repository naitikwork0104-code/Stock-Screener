import { describe, it, expect } from 'vitest';
import { simulatePriceUpdate, generateBatchUpdates } from '@/lib/websocket/simulator';

describe('WebSocket Simulator', () => {
  it('simulates price update with GBM', () => {
    const update = simulatePriceUpdate('AAPL', 150);
    expect(update.symbol).toBe('AAPL');
    expect(update.price).toBeGreaterThan(0);
    expect(update.timestamp).toBeGreaterThan(0);
    expect(typeof update.change).toBe('number');
    expect(typeof update.changePercent).toBe('number');
  });

  it('generates batch updates', () => {
    const updates = generateBatchUpdates(10);
    expect(updates).toHaveLength(10);
    const symbols = new Set(updates.map((u) => u.symbol));
    expect(symbols.size).toBe(10);
  });

  it('price changes are realistic', () => {
    const updates = Array.from({ length: 100 }, () => simulatePriceUpdate('TEST', 100));
    const maxChange = Math.max(...updates.map((u) => Math.abs(u.changePercent)));
    expect(maxChange).toBeLessThan(10);
  });
});
