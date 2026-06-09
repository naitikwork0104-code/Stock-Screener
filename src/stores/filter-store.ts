import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterRule, SortConfig } from '@/types';

interface FilterState {
  rules: FilterRule[];
  sort: SortConfig;
  searchQuery: string;
  addRule: (rule: FilterRule) => void;
  updateRule: (id: string, updates: Partial<FilterRule>) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  setRules: (rules: FilterRule[]) => void;
  clearRules: () => void;
  setSort: (sort: SortConfig) => void;
  toggleSort: (field: SortConfig['field']) => void;
  setSearchQuery: (query: string) => void;
}

const defaultSort: SortConfig = { field: 'marketCap', direction: 'desc' };

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      rules: [],
      sort: defaultSort,
      searchQuery: '',
      addRule: (rule) => set({ rules: [...get().rules, rule] }),
      updateRule: (id, updates) =>
        set({ rules: get().rules.map((r) => (r.id === id ? { ...r, ...updates } : r)) }),
      removeRule: (id) => set({ rules: get().rules.filter((r) => r.id !== id) }),
      toggleRule: (id) =>
        set({ rules: get().rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) }),
      setRules: (rules) => set({ rules }),
      clearRules: () => set({ rules: [] }),
      setSort: (sort) => set({ sort }),
      toggleSort: (field) => {
        const current = get().sort;
        if (current.field === field) {
          set({ sort: { field, direction: current.direction === 'asc' ? 'desc' : 'asc' } });
        } else {
          set({ sort: { field, direction: 'desc' } });
        }
      },
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    { name: 'screener-filters', partialize: (s) => ({ rules: s.rules, sort: s.sort }) }
  )
);
