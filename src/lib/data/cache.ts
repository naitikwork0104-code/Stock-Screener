import type { Stock, FilterPreset } from '@/types';
import { generateAllStocks, getStockHistory } from './generator';
import { SECTORS, INDICES } from './constants';

let stocksCache: Stock[] | null = null;
let presetsCache: FilterPreset[] | null = null;

export function getStocks(): Stock[] {
  if (!stocksCache) {
    stocksCache = generateAllStocks();
  }
  return stocksCache;
}

export function getStockBySymbol(symbol: string): Stock | undefined {
  return getStocks().find((s) => s.symbol === symbol);
}

export function updateStockPrice(
  symbol: string,
  price: number,
  volume: number
): Stock | undefined {
  const stocks = getStocks();
  const stock = stocks.find((s) => s.symbol === symbol);
  if (!stock) return undefined;

  const prevPrice = stock.price;
  stock.price = price;
  stock.change = price - prevPrice;
  stock.changePercent = (stock.change / prevPrice) * 100;
  stock.volume = volume;
  stock.lastUpdated = new Date().toISOString();
  stock.high52wPercent = ((price - stock.high52w) / stock.high52w) * 100;
  stock.low52wPercent = ((price - stock.low52w) / stock.low52w) * 100;

  const history = getStockHistory(symbol, stock);
  if (history.length > 0) {
    history[history.length - 1].close = price;
    history[history.length - 1].volume = volume;
  }

  return stock;
}

export function getSectors(): { name: string; count: number }[] {
  const stocks = getStocks();
  return SECTORS.map((sector) => ({
    name: sector,
    count: stocks.filter((s) => s.sector === sector).length,
  }));
}

export function getIndices(): { name: string; count: number }[] {
  const stocks = getStocks();
  return INDICES.map((index) => ({
    name: index,
    count: stocks.filter((s) => s.indices.includes(index)).length,
  }));
}

export function getFilterPresets(): FilterPreset[] {
  if (!presetsCache) {
    presetsCache = [
      {
        id: 'value-stocks',
        name: 'Value Stocks',
        description: 'Low PE, high ROE value picks',
        rules: [
          { id: '1', field: 'pe', operator: 'lt', value: 15, enabled: true },
          { id: '2', field: 'roe', operator: 'gt', value: 15, enabled: true },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'momentum',
        name: 'Momentum Leaders',
        description: 'Strong RSI and price above SMA50',
        rules: [
          { id: '1', field: 'rsi', operator: 'between', value: [50, 80], enabled: true },
          { id: '2', field: 'priceVsSma50', operator: 'gt', value: 0, enabled: true },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'large-cap',
        name: 'Large Cap',
        description: 'Large cap stocks with solid fundamentals',
        rules: [
          { id: '1', field: 'marketCapCategory', operator: 'eq', value: 'Large', enabled: true },
          { id: '2', field: 'marketCap', operator: 'gt', value: 10_000_000_000, enabled: true },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return presetsCache;
}

export function addFilterPreset(preset: Omit<FilterPreset, 'id' | 'createdAt'>): FilterPreset {
  const presets = getFilterPresets();
  const newPreset: FilterPreset = {
    ...preset,
    id: `preset-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  presets.push(newPreset);
  return newPreset;
}
