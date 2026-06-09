import { describe, it, expect } from 'vitest';
import {
  getStocks, getStockBySymbol, getSectors, getIndices,
  getFilterPresets, addFilterPreset, updateStockPrice,
} from '@/lib/data/cache';

describe('Data Cache', () => {
  it('returns 5200+ stocks', () => {
    const stocks = getStocks();
    expect(stocks.length).toBeGreaterThanOrEqual(5200);
  });

  it('finds stock by symbol', () => {
    const stocks = getStocks();
    const found = getStockBySymbol(stocks[0].symbol);
    expect(found?.symbol).toBe(stocks[0].symbol);
  });

  it('returns sectors and indices', () => {
    expect(getSectors().length).toBeGreaterThan(0);
    expect(getIndices().length).toBeGreaterThan(0);
  });

  it('manages filter presets', () => {
    const presets = getFilterPresets();
    expect(presets.length).toBeGreaterThan(0);
    const added = addFilterPreset({
      name: 'Test Preset',
      description: 'Test',
      rules: [{ id: '1', field: 'pe', operator: 'lt', value: 10, enabled: true }],
    });
    expect(added.id).toBeDefined();
    expect(getFilterPresets().find((p) => p.id === added.id)).toBeDefined();
  });

  it('updates stock price', () => {
    const stock = getStocks()[0];
    const newPrice = stock.price + 1;
    const updated = updateStockPrice(stock.symbol, newPrice, stock.volume + 100);
    expect(updated?.price).toBe(newPrice);
    expect(updated?.volume).toBe(stock.volume);
  });
});
