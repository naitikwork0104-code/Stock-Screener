'use client';

import { Suspense } from 'react';
import { useStocks } from '@/hooks/useStockData';
import { useFilterEngine } from '@/hooks/useFilterEngine';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useUIStore } from '@/stores/ui-store';
import { StockGrid } from '@/components/grid/StockGrid';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { StockDetailPanel } from '@/components/layout/StockDetail';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { cn } from '@/lib/utils/format';

function ScreenerContent() {
  const { data: stocks, isLoading, error } = useStocks();
  const { filtered, count, timing } = useFilterEngine(stocks);
  const filterPanelOpen = useUIStore((s) => s.filterPanelOpen);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const selectedSymbol = useUIStore((s) => s.selectedSymbol);
  const highContrast = useUIStore((s) => s.highContrast);

  useWebSocket(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-500">Loading {5200}+ stocks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="p-8 text-center text-red-600">
        Failed to load stocks: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className={cn('flex h-[calc(100vh-57px)]', highContrast && 'high-contrast')}>
      {filterPanelOpen && (
        <aside className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
          <FilterPanel resultCount={count} timing={timing} />
        </aside>
      )}

      <main className="flex-1 flex flex-col min-w-0 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">
            Stock Screener
            <span className="ml-2 text-sm font-normal text-gray-500">
              {count.toLocaleString()} / {(stocks?.length ?? 0).toLocaleString()} stocks
            </span>
          </h1>
          <span className="text-xs text-gray-400" aria-live="polite">
            Filter: {timing.filterMs.toFixed(0)}ms | Total: {timing.total.toFixed(0)}ms
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <StockGrid data={filtered} />
        </div>
      </main>

      {sidebarOpen && (
        <aside className="w-96 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
          <StockDetailPanel symbol={selectedSymbol} />
        </aside>
      )}
    </div>
  );
}

export function ScreenerView() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-8" role="status">Loading screener...</div>}>
        <ScreenerContent />
      </Suspense>
    </ErrorBoundary>
  );
}
