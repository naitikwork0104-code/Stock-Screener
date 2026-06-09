import { describe, it, expect } from 'vitest';
import { generateAllStocks } from '@/lib/data/generator';
import { createPredicate, ALL_FILTER_FIELDS, FILTER_FIELD_LABELS } from '@/lib/filter-engine/predicates';
import type { FilterRule } from '@/types';

describe('Filter Predicates', () => {
  const stocks = generateAllStocks(50);
  const stock = stocks[0];

  const ops: FilterRule['operator'][] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'];

  it('has 30+ filter fields', () => {
    expect(ALL_FILTER_FIELDS.length).toBeGreaterThanOrEqual(30);
    expect(Object.keys(FILTER_FIELD_LABELS).length).toBeGreaterThanOrEqual(30);
  });

  it('evaluates numeric comparisons', () => {
    const rule: FilterRule = { id: '1', field: 'pe', operator: 'lt', value: 100, enabled: true };
    const pred = createPredicate(rule);
    expect(pred(stock)).toBe(stock.fundamentals.pe < 100);
  });

  it('evaluates between operator', () => {
    const rule: FilterRule = { id: '1', field: 'rsi', operator: 'between', value: [0, 100], enabled: true };
    const pred = createPredicate(rule);
    expect(pred(stock)).toBe(true);
  });

  it('evaluates sector eq', () => {
    const rule: FilterRule = { id: '1', field: 'sector', operator: 'eq', value: stock.sector, enabled: true };
    expect(createPredicate(rule)(stock)).toBe(true);
  });

  it('evaluates watchlistOnly with context', () => {
    const rule: FilterRule = { id: '1', field: 'watchlistOnly', operator: 'eq', value: true, enabled: true };
    const pred = createPredicate(rule, { watchlist: new Set([stock.symbol]), recentlyUpdatedThreshold: 60000 });
    expect(pred(stock)).toBe(true);
    expect(createPredicate(rule)(stock)).toBe(false);
  });

  it('evaluates recentlyUpdated with context', () => {
    const rule: FilterRule = { id: '1', field: 'recentlyUpdated', operator: 'eq', value: true, enabled: true };
    const pred = createPredicate(rule, { watchlist: new Set(), recentlyUpdatedThreshold: 60000 });
    expect(pred(stock)).toBe(true);
  });

  it('evaluates indices in operator', () => {
    const stockWithIndex = stocks.find((s) => s.indices.length > 0) ?? stock;
    const rule: FilterRule = { id: '1', field: 'indices', operator: 'in', value: [stockWithIndex.indices[0]], enabled: true };
    expect(createPredicate(rule)(stockWithIndex)).toBe(true);
  });

  it('disabled rules always pass', () => {
    const rule: FilterRule = { id: '1', field: 'pe', operator: 'lt', value: 0, enabled: false };
    expect(createPredicate(rule)(stock)).toBe(true);
  });

  it('evaluates all numeric fields', () => {
    const numericFields = ['marketCap', 'pe', 'pb', 'price', 'beta', 'rsi', 'volume'] as const;
    numericFields.forEach((field) => {
      ops.forEach((operator) => {
        const rule: FilterRule = { id: '1', field, operator, value: 0, enabled: true };
        expect(typeof createPredicate(rule)(stock)).toBe('boolean');
      });
    });
  });
});
