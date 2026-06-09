import type { OHLCV, Stock, StockDetail } from '@/types';
import {
  STOCK_COUNT, TRADING_DAYS, SECTORS, INDUSTRIES, INDICES,
  COMPANY_PREFIXES, COMPANY_SUFFIXES,
} from './constants';
import { createSeededRandom, randomBetween, randomInt, randomPick, randomPickN } from '@/lib/utils/random';
import { getLatestSMA } from '@/lib/indicators/sma';
import { getLatestRSI } from '@/lib/indicators/rsi';
import { getLatestMACDSignal } from '@/lib/indicators/macd';
import { getBollingerPosition } from '@/lib/indicators/bollinger';
import { getLatestATR } from '@/lib/indicators/atr';

function generateSymbol(rng: () => number, index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const a = letters[Math.floor(rng() * 26)];
  const b = letters[Math.floor(rng() * 26)];
  const c = letters[Math.floor(rng() * 26)];
  const num = (index % 900) + 100;
  return `${a}${b}${c}${num}`;
}

function generateOHLCV(rng: () => number, basePrice: number, days: number): OHLCV[] {
  const data: OHLCV[] = [];
  let price = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days * 1.5);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const drift = 0.0002;
    const volatility = 0.02;
    const change = price * (drift + volatility * (rng() - 0.5) * 2);
    const open = price;
    const close = Math.max(0.01, price + change);
    const high = Math.max(open, close) * (1 + rng() * 0.015);
    const low = Math.min(open, close) * (1 - rng() * 0.015);
    const volume = Math.floor(randomBetween(rng, 100_000, 50_000_000));

    data.push({
      date: date.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    price = close;
  }
  return data;
}

function generateStock(rng: () => number, index: number): Stock {
  const sector = randomPick(rng, [...SECTORS]);
  const industry = randomPick(rng, INDUSTRIES[sector]);
  const basePrice = randomBetween(rng, 5, 2500);
  const history = generateOHLCV(rng, basePrice, TRADING_DAYS);
  const lastCandle = history[history.length - 1];
  const prevCandle = history[history.length - 2] ?? lastCandle;
  const price = lastCandle.close;
  const change = price - prevCandle.close;
  const changePercent = (change / prevCandle.close) * 100;

  const avgVolumes = history.slice(-20).map((h) => h.volume);
  const avgVolume = avgVolumes.reduce((a, b) => a + b, 0) / avgVolumes.length;
  const volume = lastCandle.volume;

  const highs = history.map((h) => h.high);
  const lows = history.map((h) => h.low);
  const high52w = Math.max(...highs);
  const low52w = Math.min(...lows);

  const marketCap = price * randomInt(rng, 10_000_000, 5_000_000_000_000);
  const sma50 = getLatestSMA(history, 50);
  const sma200 = getLatestSMA(history, 200);

  const prefix = randomPick(rng, COMPANY_PREFIXES);
  const suffix = randomPick(rng, COMPANY_SUFFIXES);

  let marketCapCategory: 'Large' | 'Mid' | 'Small' | 'Micro';
  if (marketCap >= 10_000_000_000) marketCapCategory = 'Large';
  else if (marketCap >= 2_000_000_000) marketCapCategory = 'Mid';
  else if (marketCap >= 300_000_000) marketCapCategory = 'Small';
  else marketCapCategory = 'Micro';

  return {
    symbol: generateSymbol(rng, index),
    name: `${prefix} ${suffix}`,
    price,
    change,
    changePercent,
    volume,
    avgVolume,
    marketCap,
    sector,
    industry,
    indices: randomPickN(rng, [...INDICES], randomInt(rng, 0, 3)),
    beta: +randomBetween(rng, 0.3, 2.5).toFixed(2),
    high52w,
    low52w,
    high52wPercent: ((price - high52w) / high52w) * 100,
    low52wPercent: ((price - low52w) / low52w) * 100,
    fundamentals: {
      pe: +randomBetween(rng, 5, 80).toFixed(2),
      pb: +randomBetween(rng, 0.5, 15).toFixed(2),
      roe: +randomBetween(rng, -10, 45).toFixed(2),
      roce: +randomBetween(rng, -5, 40).toFixed(2),
      debtToEquity: +randomBetween(rng, 0, 3).toFixed(2),
      currentRatio: +randomBetween(rng, 0.5, 4).toFixed(2),
      dividendYield: +randomBetween(rng, 0, 8).toFixed(2),
      eps: +randomBetween(rng, -5, 50).toFixed(2),
      promoterHolding: +randomBetween(rng, 20, 85).toFixed(2),
      revenueGrowth: +randomBetween(rng, -20, 60).toFixed(2),
      profitGrowth: +randomBetween(rng, -30, 80).toFixed(2),
      marketCapCategory,
    },
    technical: {
      rsi: +getLatestRSI(history).toFixed(2),
      macdSignal: +getLatestMACDSignal(history).toFixed(4),
      priceVsSma50: +(((price - sma50) / sma50) * 100).toFixed(2),
      priceVsSma200: +(((price - sma200) / sma200) * 100).toFixed(2),
      bollingerPosition: +getBollingerPosition(history).toFixed(4),
      atr: +getLatestATR(history).toFixed(2),
      volumeVsAverage: +((volume / avgVolume) * 100).toFixed(2),
      sma50: +sma50.toFixed(2),
      sma200: +sma200.toFixed(2),
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function generateAllStocks(count = STOCK_COUNT): Stock[] {
  const rng = createSeededRandom(42);
  const stocks: Stock[] = [];
  const usedSymbols = new Set<string>();

  for (let i = 0; i < count; i++) {
    let stock = generateStock(rng, i);
    while (usedSymbols.has(stock.symbol)) {
      stock = generateStock(rng, i + count);
    }
    usedSymbols.add(stock.symbol);
    stocks.push(stock);
  }
  return stocks;
}

export function generateStockHistory(rng: () => number, basePrice: number, days = TRADING_DAYS): OHLCV[] {
  return generateOHLCV(rng, basePrice, days);
}

export function getStockDetail(stock: Stock): StockDetail {
  return {
    ...stock,
    description: `${stock.name} (${stock.symbol}) is a ${stock.fundamentals.marketCapCategory.toLowerCase()}-cap company in the ${stock.sector} sector, specifically in ${stock.industry}.`,
  };
}

const historyCache = new Map<string, OHLCV[]>();

export function getStockHistory(symbol: string, stock?: Stock): OHLCV[] {
  if (historyCache.has(symbol)) return historyCache.get(symbol)!;

  const rng = createSeededRandom(symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const basePrice = stock?.price ?? randomBetween(rng, 5, 2500);
  const history = generateOHLCV(rng, basePrice, TRADING_DAYS);
  historyCache.set(symbol, history);
  return history;
}
