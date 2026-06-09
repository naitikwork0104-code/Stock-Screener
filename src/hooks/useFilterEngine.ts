'use client';

import { useMemo, useRef } from 'react';
import type { Stock } from '@/types';
import { useFilterStore } from '@/stores/filter-store';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { parseFiltersToAST, optimizeAST, filterAndSort } from '@/lib/filter-engine';

export function useFilterEngine(stocks: Stock[] | undefined) {
  const rules = useFilterStore((s) => s.rules);
  const sort = useFilterStore((s) => s.sort);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const watchlistSymbols = useWatchlistStore((s) => s.symbols);

  const lastTimingRef = useRef({ filterMs: 0, sortMs: 0, total: 0 });

  const result = useMemo(() => {
    if (!stocks) return { filtered: [], count: 0, timing: lastTimingRef.current };

    const start = performance.now();

    const ast = optimizeAST(parseFiltersToAST(rules));
    const context = {
      watchlist: new Set(watchlistSymbols),
      recentlyUpdatedThreshold: 5 * 60 * 1000,
    };

    const filterStart = performance.now();
    let filtered = filterAndSort(stocks, ast, sort, context);
    const filterEnd = performance.now();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    const end = performance.now();
    lastTimingRef.current = {
      filterMs: filterEnd - filterStart,
      sortMs: end - filterEnd,
      total: end - start,
    };

    return { filtered, count: filtered.length, timing: lastTimingRef.current };
  }, [stocks, rules, sort, searchQuery, watchlistSymbols]);

  return result;
}
