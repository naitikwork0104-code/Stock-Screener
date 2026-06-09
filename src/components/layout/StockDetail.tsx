'use client';

import { useState } from 'react';
import { useStock, useStockHistory } from '@/hooks/useStockData';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { StockChart } from '@/components/charts/StockChart';
import { formatPrice, formatPercent, formatMarketCap, cn } from '@/lib/utils/format';
import type { Timeframe } from '@/types';
import Link from 'next/link';

export function StockDetailPanel({ symbol }: { symbol: string | null }) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const { data: stock, isLoading } = useStock(symbol);
  const { data: history, isLoading: historyLoading } = useStockHistory(symbol, timeframe);
  const watchlistHas = useWatchlistStore((s) => s.has);
  const watchlistToggle = useWatchlistStore((s) => s.toggle);

  if (!symbol) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 p-8">
        <p>Select a stock from the grid to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 animate-pulse" role="status">Loading stock details...</div>;
  }

  if (!stock) {
    return <div className="p-8 text-red-500" role="alert">Stock not found</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{stock.symbol}</h2>
          <p className="text-gray-500">{stock.name}</p>
          <p className="text-sm text-gray-400">{stock.sector} · {stock.industry}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => watchlistToggle(stock.symbol)}
            aria-label={watchlistHas(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'}
            className={cn('text-2xl', watchlistHas(stock.symbol) ? 'text-yellow-500' : 'text-gray-300')}
          >
            ★
          </button>
          <Link
            href={`/stock/${stock.symbol}`}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Full Page
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Price" value={formatPrice(stock.price)} />
        <Metric
          label="Change"
          value={formatPercent(stock.changePercent)}
          className={stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <Metric label="Market Cap" value={formatMarketCap(stock.marketCap)} />
        <Metric label="P/E" value={stock.fundamentals.pe.toFixed(2)} />
        <Metric label="P/B" value={stock.fundamentals.pb.toFixed(2)} />
        <Metric label="ROE" value={`${stock.fundamentals.roe}%`} />
        <Metric label="RSI" value={stock.technical.rsi.toFixed(1)} />
        <Metric label="Beta" value={stock.beta.toFixed(2)} />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">{stock.description}</p>

      {historyLoading ? (
        <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
      ) : history ? (
        <StockChart
          data={history}
          symbol={stock.symbol}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      ) : null}
    </div>
  );
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={cn('text-sm font-semibold', className)}>{value}</div>
    </div>
  );
}
