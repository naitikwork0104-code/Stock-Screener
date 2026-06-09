import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  symbols: string[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  toggle: (symbol: string) => void;
  has: (symbol: string) => boolean;
  clear: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: [],
      add: (symbol) => {
        if (!get().symbols.includes(symbol)) {
          set({ symbols: [...get().symbols, symbol] });
        }
      },
      remove: (symbol) => set({ symbols: get().symbols.filter((s) => s !== symbol) }),
      toggle: (symbol) => {
        if (get().symbols.includes(symbol)) {
          get().remove(symbol);
        } else {
          get().add(symbol);
        }
      },
      has: (symbol) => get().symbols.includes(symbol),
      clear: () => set({ symbols: [] }),
    }),
    { name: 'screener-watchlist' }
  )
);
