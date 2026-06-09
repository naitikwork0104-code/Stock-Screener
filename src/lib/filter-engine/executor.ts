import type { Stock, FilterASTNode, SortConfig } from '@/types';
import { createPredicate, type FilterContext } from './predicates';

const predicateCache = new WeakMap<FilterASTNode, (stock: Stock) => boolean>();

function compileAST(ast: FilterASTNode, context?: FilterContext): (stock: Stock) => boolean {
  const cached = predicateCache.get(ast);
  if (cached) return cached;

  let fn: (stock: Stock) => boolean;

  switch (ast.type) {
    case 'rule':
      fn = createPredicate(ast.rule, context);
      break;
    case 'and':
      if (ast.children.length === 0) {
        fn = () => true;
      } else {
        const fns = ast.children.map((c) => compileAST(c, context));
        fn = (stock) => {
          for (const f of fns) {
            if (!f(stock)) return false;
          }
          return true;
        };
      }
      break;
    case 'or': {
      const fns = ast.children.map((c) => compileAST(c, context));
      fn = (stock) => fns.some((f) => f(stock));
      break;
    }
    case 'not':
      fn = (stock) => !compileAST(ast.child, context)(stock);
      break;
    default:
      fn = () => true;
  }

  predicateCache.set(ast, fn);
  return fn;
}

export function executeFilter(
  stocks: Stock[],
  ast: FilterASTNode,
  context?: FilterContext
): Stock[] {
  const predicate = compileAST(ast, context);
  const result: Stock[] = [];
  for (let i = 0; i < stocks.length; i++) {
    if (predicate(stocks[i])) result.push(stocks[i]);
  }
  return result;
}

function getSortValue(stock: Stock, field: SortConfig['field']): number | string {
  const sortMap: Record<string, number | string> = {
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    volume: stock.volume,
    avgVolume: stock.avgVolume,
    marketCap: stock.marketCap,
    sector: stock.sector,
    industry: stock.industry,
    beta: stock.beta,
    high52w: stock.high52w,
    low52w: stock.low52w,
    high52wPercent: stock.high52wPercent,
    low52wPercent: stock.low52wPercent,
    pe: stock.fundamentals.pe,
    pb: stock.fundamentals.pb,
    roe: stock.fundamentals.roe,
    roce: stock.fundamentals.roce,
    rsi: stock.technical.rsi,
    sma50: stock.technical.sma50,
    sma200: stock.technical.sma200,
  };
  return sortMap[field as string] ?? 0;
}

export function stableSort(stocks: Stock[], sort: SortConfig): Stock[] {
  const indexed = stocks.map((stock, index) => ({ stock, index }));
  const dir = sort.direction === 'asc' ? 1 : -1;

  indexed.sort((a, b) => {
    const aVal = getSortValue(a.stock, sort.field);
    const bVal = getSortValue(b.stock, sort.field);
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return a.index - b.index;
  });

  return indexed.map((item) => item.stock);
}

export function filterAndSort(
  stocks: Stock[],
  ast: FilterASTNode,
  sort: SortConfig | null,
  context?: FilterContext
): Stock[] {
  const filtered = executeFilter(stocks, ast, context);
  return sort ? stableSort(filtered, sort) : filtered;
}
