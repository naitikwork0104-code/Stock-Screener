import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  selectedSymbol: string | null;
  sidebarOpen: boolean;
  filterPanelOpen: boolean;
  highContrast: boolean;
  columnVisibility: Record<string, boolean>;
  columnWidths: Record<string, number>;
  setSelectedSymbol: (symbol: string | null) => void;
  toggleSidebar: () => void;
  toggleFilterPanel: () => void;
  toggleHighContrast: () => void;
  setColumnVisibility: (id: string, visible: boolean) => void;
  setColumnWidth: (id: string, width: number) => void;
}

const defaultColumns: Record<string, boolean> = {
  symbol: true, price: true, changePercent: true, volume: true,
  marketCap: true, pe: true, pb: true, roe: true, roce: true,
  sector: true, rsi: true, sma50: true, sma200: true,
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      selectedSymbol: null,
      sidebarOpen: true,
      filterPanelOpen: true,
      highContrast: false,
      columnVisibility: defaultColumns,
      columnWidths: {},
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      toggleFilterPanel: () => set({ filterPanelOpen: !get().filterPanelOpen }),
      toggleHighContrast: () => set({ highContrast: !get().highContrast }),
      setColumnVisibility: (id, visible) =>
        set({ columnVisibility: { ...get().columnVisibility, [id]: visible } }),
      setColumnWidth: (id, width) =>
        set({ columnWidths: { ...get().columnWidths, [id]: width } }),
    }),
    { name: 'screener-ui', partialize: (s) => ({ columnVisibility: s.columnVisibility, highContrast: s.highContrast }) }
  )
);
