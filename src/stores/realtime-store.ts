import { create } from 'zustand';
import type { PriceUpdate, WebSocketStatus } from '@/types';

interface RealtimeState {
  prices: Map<string, PriceUpdate>;
  pendingUpdates: PriceUpdate[];
  status: WebSocketStatus;
  lastBatchTime: number;
  flashDirections: Map<string, 'up' | 'down' | null>;
  setStatus: (status: WebSocketStatus) => void;
  queueUpdates: (updates: PriceUpdate[]) => void;
  flushUpdates: () => void;
  applyUpdate: (update: PriceUpdate) => void;
  getPrice: (symbol: string) => PriceUpdate | undefined;
  clearFlash: (symbol: string) => void;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  prices: new Map(),
  pendingUpdates: [],
  status: 'disconnected',
  lastBatchTime: 0,
  flashDirections: new Map(),
  setStatus: (status) => set({ status }),
  queueUpdates: (updates) =>
    set({ pendingUpdates: [...get().pendingUpdates, ...updates] }),
  flushUpdates: () => {
    const pending = get().pendingUpdates;
    if (pending.length === 0) return;

    const prices = new Map(get().prices);
    const flashDirections = new Map(get().flashDirections);

    for (const update of pending) {
      const prev = prices.get(update.symbol);
      prices.set(update.symbol, update);
      if (prev) {
        flashDirections.set(
          update.symbol,
          update.price > prev.price ? 'up' : update.price < prev.price ? 'down' : null
        );
      }
    }

    set({ prices, flashDirections, pendingUpdates: [], lastBatchTime: Date.now() });
  },
  applyUpdate: (update) => {
    const prices = new Map(get().prices);
    const prev = prices.get(update.symbol);
    prices.set(update.symbol, update);

    const flashDirections = new Map(get().flashDirections);
    if (prev) {
      flashDirections.set(
        update.symbol,
        update.price > prev.price ? 'up' : update.price < prev.price ? 'down' : null
      );
    }

    set({ prices, flashDirections });
  },
  getPrice: (symbol) => get().prices.get(symbol),
  clearFlash: (symbol) => {
    const flashDirections = new Map(get().flashDirections);
    flashDirections.set(symbol, null);
    set({ flashDirections });
  },
}));
