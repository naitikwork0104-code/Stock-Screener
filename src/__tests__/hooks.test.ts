import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFilterStore } from '@/stores/filter-store';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { useRealtimeStore } from '@/stores/realtime-store';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client }, children);
};

describe('Zustand Stores', () => {
  it('manages filter rules', () => {
    const { addRule, clearRules, rules } = useFilterStore.getState();
    clearRules();
    addRule({ id: '1', field: 'pe', operator: 'lt', value: 20, enabled: true });
    expect(useFilterStore.getState().rules).toHaveLength(1);
    clearRules();
    expect(useFilterStore.getState().rules).toHaveLength(0);
    void rules;
  });

  it('manages watchlist', () => {
    const { add, remove, has, clear } = useWatchlistStore.getState();
    clear();
    add('AAPL');
    expect(has('AAPL')).toBe(true);
    remove('AAPL');
    expect(has('AAPL')).toBe(false);
  });

  it('manages realtime prices', () => {
    const { applyUpdate, getPrice } = useRealtimeStore.getState();
    applyUpdate({
      symbol: 'TEST',
      price: 100,
      change: 1,
      changePercent: 1,
      volume: 1000,
      timestamp: Date.now(),
    });
    expect(getPrice('TEST')?.price).toBe(100);
  });
});

describe('useFilterStore sort', () => {
  it('toggles sort direction', () => {
    const { toggleSort, setSort } = useFilterStore.getState();
    setSort({ field: 'price', direction: 'desc' });
    toggleSort('price');
    expect(useFilterStore.getState().sort.direction).toBe('asc');
    toggleSort('marketCap');
    expect(useFilterStore.getState().sort.field).toBe('marketCap');
  });
});

describe('Hook wrapper', () => {
  it('creates query client wrapper', () => {
    const { result } = renderHook(() => useFilterStore((s) => s.sort), { wrapper });
    expect(result.current).toBeDefined();
  });
});
