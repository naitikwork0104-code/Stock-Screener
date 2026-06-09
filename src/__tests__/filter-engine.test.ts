import { describe, it, expect } from 'vitest';
import { generateAllStocks } from '@/lib/data/generator';
import { parseFiltersToAST, optimizeAST, executeFilter, stableSort, filterAndSort } from '@/lib/filter-engine';
import type { FilterRule, SortConfig } from '@/types';

describe('Filter Engine', () => {
  const stocks = generateAllStocks(100);

  it('parses rules to AST', () => {
    const rules: FilterRule[] = [
      { id: '1', field: 'pe', operator: 'lt', value: 20, enabled: true },
      { id: '2', field: 'roe', operator: 'gt', value: 10, enabled: true },
    ];
    const ast = parseFiltersToAST(rules);
    expect(ast.type).toBe('and');
    if (ast.type === 'and') expect(ast.children).toHaveLength(2);
  });

  it('filters stocks by PE', () => {
    const rules: FilterRule[] = [
      { id: '1', field: 'pe', operator: 'lt', value: 15, enabled: true },
    ];
    const ast = optimizeAST(parseFiltersToAST(rules));
    const result = executeFilter(stocks, ast);
    expect(result.every((s) => s.fundamentals.pe < 15)).toBe(true);
  });

  it('filters by sector', () => {
    const rules: FilterRule[] = [
      { id: '1', field: 'sector', operator: 'eq', value: 'Technology', enabled: true },
    ];
    const ast = optimizeAST(parseFiltersToAST(rules));
    const result = executeFilter(stocks, ast);
    expect(result.every((s) => s.sector === 'Technology')).toBe(true);
  });

  it('stable sorts stocks', () => {
    const sort: SortConfig = { field: 'marketCap', direction: 'desc' };
    const sorted = stableSort(stocks, sort);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].marketCap).toBeGreaterThanOrEqual(sorted[i].marketCap);
    }
  });

  it('filters and sorts in pipeline', () => {
    const rules: FilterRule[] = [
      { id: '1', field: 'marketCap', operator: 'gt', value: 0, enabled: true },
    ];
    const ast = optimizeAST(parseFiltersToAST(rules));
    const sort: SortConfig = { field: 'symbol', direction: 'asc' };
    const result = filterAndSort(stocks, ast, sort);
    expect(result.length).toBeGreaterThan(0);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].symbol.localeCompare(result[i].symbol)).toBeLessThanOrEqual(0);
    }
  });

  it('filters 5000+ stocks under 200ms', () => {
    const allStocks = generateAllStocks(5200);
    const rules: FilterRule[] = [
      { id: '1', field: 'pe', operator: 'lt', value: 30, enabled: true },
      { id: '2', field: 'sector', operator: 'eq', value: 'Technology', enabled: true },
      { id: '3', field: 'rsi', operator: 'between', value: [30, 70], enabled: true },
    ];
    const ast = optimizeAST(parseFiltersToAST(rules));

    const start = performance.now();
    executeFilter(allStocks, ast);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(200);
  });

  it('sorts 5000+ stocks under 150ms', () => {
    const allStocks = generateAllStocks(5200);
    const sort: SortConfig = { field: 'marketCap', direction: 'desc' };

    const start = performance.now();
    stableSort(allStocks, sort);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(150);
  });
});
