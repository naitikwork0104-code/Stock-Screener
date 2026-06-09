import { describe, it, expect } from 'vitest';
import { formatVolume, formatMarketCap, formatNumber, cn } from '@/lib/utils/format';
import { createPredicate } from '@/lib/filter-engine/predicates';
import { generateAllStocks } from '@/lib/data/generator';
import type { FilterRule } from '@/types';
import { executeFilter } from '@/lib/filter-engine/executor';
import { parseFiltersToAST } from '@/lib/filter-engine/parser';
import { optimizeAST } from '@/lib/filter-engine/optimizer';

describe('Format branch coverage', () => {
  it('formats all volume ranges', () => {
    expect(formatVolume(500)).toBe('500');
    expect(formatVolume(5000)).toBe('5.00K');
    expect(formatVolume(5_000_000)).toBe('5.00M');
    expect(formatVolume(5_000_000_000)).toBe('5.00B');
  });

  it('formats all market cap ranges', () => {
    expect(formatMarketCap(500_000)).toBe('500.00K');
    expect(formatMarketCap(5_000_000_000)).toBe('5.00B');
    expect(formatMarketCap(5_000_000_000_000)).toBe('5.00T');
  });

  it('cn joins classes', () => {
    expect(cn('a', false, 'b', null, undefined)).toBe('a b');
  });

  it('formatNumber with custom decimals', () => {
    expect(formatNumber(1.2345, 3)).toBe('1.234');
  });
});

describe('Executor branch coverage', () => {
  const stocks = generateAllStocks(20);

  it('handles OR and NOT AST nodes', () => {
    const orAst = optimizeAST({
      type: 'or',
      children: [
        { type: 'rule', rule: { id: '1', field: 'pe', operator: 'lt', value: 0, enabled: true } },
        { type: 'rule', rule: { id: '2', field: 'pe', operator: 'gt', value: 0, enabled: true } },
      ],
    });
    expect(executeFilter(stocks, orAst).length).toBeGreaterThan(0);

    const notAst = optimizeAST({
      type: 'not',
      child: { type: 'rule', rule: { id: '1', field: 'pe', operator: 'lt', value: 0, enabled: true } },
    });
    expect(executeFilter(stocks, notAst).length).toBeGreaterThan(0);
  });

  it('handles string operators neq and contains', () => {
    const stock = stocks[0];
    const neq: FilterRule = { id: '1', field: 'sector', operator: 'neq', value: 'ZZZ', enabled: true };
    expect(createPredicate(neq)(stock)).toBe(true);
    const contains: FilterRule = { id: '2', field: 'sector', operator: 'contains', value: stock.sector.slice(0, 3), enabled: true };
    expect(createPredicate(contains)(stock)).toBe(true);
  });

  it('filterAndSort with null sort', () => {
    const ast = parseFiltersToAST([]);
    const result = executeFilter(stocks, ast);
    expect(result.length).toBe(20);
  });
});
