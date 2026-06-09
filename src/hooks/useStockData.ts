'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Timeframe } from '@/types';

export function useStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: api.getStocks,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStock(symbol: string | null) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => api.getStock(symbol!),
    enabled: !!symbol,
    staleTime: 60 * 1000,
  });
}

export function useStockHistory(symbol: string | null, timeframe: Timeframe = '1Y') {
  return useQuery({
    queryKey: ['history', symbol, timeframe],
    queryFn: () => api.getHistory(symbol!, timeframe),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockFundamentals(symbol: string | null) {
  return useQuery({
    queryKey: ['fundamentals', symbol],
    queryFn: () => api.getFundamentals(symbol!),
    enabled: !!symbol,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFilterPresets() {
  return useQuery({
    queryKey: ['filter-presets'],
    queryFn: api.getFilterPresets,
    staleTime: 30 * 60 * 1000,
  });
}

export function useSectors() {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: api.getSectors,
    staleTime: 30 * 60 * 1000,
  });
}

export function useIndices() {
  return useQuery({
    queryKey: ['indices'],
    queryFn: api.getIndices,
    staleTime: 30 * 60 * 1000,
  });
}

export function useInvalidateStocks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['stocks'] });
}
