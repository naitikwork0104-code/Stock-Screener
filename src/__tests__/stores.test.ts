import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '@/stores/filter-store';
import { useUIStore } from '@/stores/ui-store';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { useRealtimeStore } from '@/stores/realtime-store';

describe('UI Store', () => {
  beforeEach(() => {
    useUIStore.setState({
      selectedSymbol: null,
      sidebarOpen: true,
      filterPanelOpen: true,
      highContrast: false,
      columnVisibility: { symbol: true, price: true },
      columnWidths: {},
    });
  });

  it('toggles UI panels', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().toggleFilterPanel();
    expect(useUIStore.getState().filterPanelOpen).toBe(false);
    useUIStore.getState().toggleHighContrast();
    expect(useUIStore.getState().highContrast).toBe(true);
  });

  it('manages column visibility and widths', () => {
    useUIStore.getState().setColumnVisibility('pe', false);
    expect(useUIStore.getState().columnVisibility.pe).toBe(false);
    useUIStore.getState().setColumnWidth('symbol', 120);
    expect(useUIStore.getState().columnWidths.symbol).toBe(120);
  });

  it('sets selected symbol', () => {
    useUIStore.getState().setSelectedSymbol('AAPL');
    expect(useUIStore.getState().selectedSymbol).toBe('AAPL');
  });
});

describe('Realtime Store batching', () => {
  beforeEach(() => {
    useRealtimeStore.setState({
      prices: new Map(),
      pendingUpdates: [],
      flashDirections: new Map(),
      status: 'disconnected',
    });
  });

  it('queues and flushes updates', () => {
    const update = { symbol: 'A', price: 10, change: 1, changePercent: 10, volume: 100, timestamp: Date.now() };
    useRealtimeStore.getState().queueUpdates([update]);
    expect(useRealtimeStore.getState().pendingUpdates).toHaveLength(1);
    useRealtimeStore.getState().flushUpdates();
    expect(useRealtimeStore.getState().pendingUpdates).toHaveLength(0);
    expect(useRealtimeStore.getState().getPrice('A')?.price).toBe(10);
  });

  it('tracks flash direction on price change', () => {
    useRealtimeStore.getState().applyUpdate({ symbol: 'B', price: 100, change: 0, changePercent: 0, volume: 100, timestamp: 1 });
    useRealtimeStore.getState().applyUpdate({ symbol: 'B', price: 110, change: 10, changePercent: 10, volume: 100, timestamp: 2 });
    expect(useRealtimeStore.getState().flashDirections.get('B')).toBe('up');
    useRealtimeStore.getState().clearFlash('B');
    expect(useRealtimeStore.getState().flashDirections.get('B')).toBeNull();
  });

  it('sets websocket status', () => {
    useRealtimeStore.getState().setStatus('connected');
    expect(useRealtimeStore.getState().status).toBe('connected');
  });
});

describe('Filter Store rules management', () => {
  beforeEach(() => useFilterStore.getState().clearRules());

  it('adds, updates, removes rules', () => {
    useFilterStore.getState().addRule({ id: '1', field: 'pe', operator: 'lt', value: 20, enabled: true });
    useFilterStore.getState().updateRule('1', { value: 15 });
    expect(useFilterStore.getState().rules[0].value).toBe(15);
    useFilterStore.getState().toggleRule('1');
    expect(useFilterStore.getState().rules[0].enabled).toBe(false);
    useFilterStore.getState().removeRule('1');
    expect(useFilterStore.getState().rules).toHaveLength(0);
  });

  it('sets search query', () => {
    useFilterStore.getState().setSearchQuery('AAPL');
    expect(useFilterStore.getState().searchQuery).toBe('AAPL');
  });
});

describe('Watchlist toggle', () => {
  beforeEach(() => useWatchlistStore.getState().clear());

  it('toggles symbols', () => {
    useWatchlistStore.getState().toggle('XYZ');
    expect(useWatchlistStore.getState().has('XYZ')).toBe(true);
    useWatchlistStore.getState().toggle('XYZ');
    expect(useWatchlistStore.getState().has('XYZ')).toBe(false);
  });
});
