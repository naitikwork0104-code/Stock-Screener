import type { ApiResponse, Stock, StockDetail, OHLCV, FilterPreset, SectorInfo, IndexInfo } from '@/types';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error ?? 'API request failed');
  return json.data;
}

export const api = {
  getStocks: () => fetchApi<Stock[]>('/api/stocks'),
  getStock: (symbol: string) => fetchApi<StockDetail>(`/api/stocks/${symbol}`),
  getHistory: (symbol: string, timeframe?: string) =>
    fetchApi<OHLCV[]>(`/api/stocks/${symbol}/history${timeframe ? `?timeframe=${timeframe}` : ''}`),
  getFundamentals: (symbol: string) =>
    fetchApi<Stock['fundamentals']>(`/api/stocks/${symbol}/fundamentals`),
  getFilterPresets: () => fetchApi<FilterPreset[]>('/api/filters/presets'),
  saveFilterPreset: (preset: { name: string; description: string; rules: FilterPreset['rules'] }) =>
    fetchApi<FilterPreset>('/api/filters/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preset),
    }),
  getSectors: () => fetchApi<SectorInfo[]>('/api/sectors'),
  getIndices: () => fetchApi<IndexInfo[]>('/api/indices'),
  getPriceUpdates: () => fetchApi<import('@/types').PriceUpdate[]>('/api/prices/updates'),
};
