'use client';

import { useMemo } from 'react';
import { useStocks } from '@/hooks/useStockData';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { StockGrid } from '@/components/grid/StockGrid';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function WatchlistPage() {
  const { data: stocks, isLoading } = useStocks();
  const symbols = useWatchlistStore((s) => s.symbols);
  useWebSocket(true);

  const watchlistStocks = useMemo(
    () => stocks?.filter((s) => symbols.includes(s.symbol)) ?? [],
    [stocks, symbols]
  );

  return (
    <div className="p-4 h-[calc(100vh-57px)]">
      <h1 className="text-lg font-semibold mb-4">
        Watchlist ({watchlistStocks.length} stocks)
      </h1>
      {isLoading ? (
        <p role="status">Loading...</p>
      ) : watchlistStocks.length === 0 ? (
        <p className="text-gray-500">No stocks in watchlist. Star stocks from the screener to add them.</p>
      ) : (
        <div className="h-[calc(100%-3rem)]">
          <StockGrid data={watchlistStocks} />
        </div>
      )}
    </div>
  );
}
