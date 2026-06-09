import type { PriceUpdate } from '@/types';
import { getStocks } from '@/lib/data/cache';
import { createSeededRandom, randomBetween } from '@/lib/utils/random';

/** Geometric Brownian Motion price simulation */
export function simulatePriceUpdate(symbol: string, currentPrice: number): PriceUpdate {
  const rng = createSeededRandom(Date.now() ^ symbol.charCodeAt(0));
  const dt = 1 / 252;
  const mu = 0.05;
  const sigma = 0.2;
  const z = Math.sqrt(-2 * Math.log(rng())) * Math.cos(2 * Math.PI * rng());
  const newPrice = currentPrice * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
  const price = Math.max(0.01, +newPrice.toFixed(2));
  const change = +(price - currentPrice).toFixed(2);
  const changePercent = +((change / currentPrice) * 100).toFixed(2);
  const volume = Math.floor(randomBetween(rng, 50_000, 10_000_000));

  return { symbol, price, change, changePercent, volume, timestamp: Date.now() };
}

export function generateBatchUpdates(batchSize = 50): PriceUpdate[] {
  const stocks = getStocks();
  const rng = createSeededRandom(Date.now());
  const updates: PriceUpdate[] = [];
  const startIdx = Math.floor(rng() * (stocks.length - batchSize));

  for (let i = 0; i < batchSize; i++) {
    const stock = stocks[startIdx + i];
    if (stock) {
      updates.push(simulatePriceUpdate(stock.symbol, stock.price));
    }
  }
  return updates;
}
