'use client';

import { useRef, useCallback, useMemo, memo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnResizeMode,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Stock } from '@/types';
import { stockColumns } from './columns';
import { useFilterStore } from '@/stores/filter-store';
import { useUIStore } from '@/stores/ui-store';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { useRealtimeStore } from '@/stores/realtime-store';
import { cn } from '@/lib/utils/format';

const ROW_HEIGHT = 36;
const OVERSCAN = 12;

interface StockGridProps {
  data: Stock[];
}

const GridRow = memo(function GridRow({
  row,
  virtualIndex,
  isSelected,
  isWatchlisted,
  onSelect,
  onToggleWatchlist,
  style,
}: {
  row: ReturnType<ReturnType<typeof useReactTable<Stock>>['getRowModel']>['rows'][0];
  virtualIndex: number;
  isSelected: boolean;
  isWatchlisted: boolean;
  onSelect: (symbol: string) => void;
  onToggleWatchlist: (symbol: string) => void;
  style: React.CSSProperties;
}) {
  return (
    <div
      role="row"
      aria-rowindex={virtualIndex + 2}
      aria-selected={isSelected}
      className={cn(
        'flex items-center border-b border-gray-200 dark:border-gray-700 cursor-pointer',
        isSelected && 'bg-blue-50 dark:bg-blue-900/30',
        !isSelected && virtualIndex % 2 === 0 && 'bg-gray-50/50 dark:bg-gray-800/30',
        'hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
      )}
      style={{ ...style, height: ROW_HEIGHT }}
      onClick={() => onSelect(row.original.symbol)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(row.original.symbol);
        }
      }}
      tabIndex={0}
    >
      <div className="w-8 flex-shrink-0 flex items-center justify-center" role="gridcell">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWatchlist(row.original.symbol); }}
          aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
          className={cn('text-lg', isWatchlisted ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400')}
        >
          ★
        </button>
      </div>
      {row.getVisibleCells().map((cell) => (
        <div
          key={cell.id}
          role="gridcell"
          className="px-2 text-sm truncate flex-shrink-0"
          style={{ width: cell.column.getSize() }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      ))}
    </div>
  );
});

export function StockGrid({ data }: StockGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const toggleSort = useFilterStore((s) => s.toggleSort);
  const sort = useFilterStore((s) => s.sort);
  const columnVisibility = useUIStore((s) => s.columnVisibility);
  const columnWidths = useUIStore((s) => s.columnWidths);
  const setColumnWidth = useUIStore((s) => s.setColumnWidth);
  const selectedSymbol = useUIStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useUIStore((s) => s.setSelectedSymbol);
  const watchlistHas = useWatchlistStore((s) => s.has);
  const watchlistToggle = useWatchlistStore((s) => s.toggle);
  const realtimePrices = useRealtimeStore((s) => s.prices);

  const mergedData = useMemo(() => {
    if (realtimePrices.size === 0) return data;
    return data.map((stock) => {
      const update = realtimePrices.get(stock.symbol);
      if (!update) return stock;
      return {
        ...stock,
        price: update.price,
        change: update.change,
        changePercent: update.changePercent,
        volume: update.volume,
      };
    });
  }, [data, realtimePrices]);

  const table = useReactTable({
    data: mergedData,
    columns: stockColumns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange' as ColumnResizeMode,
    state: {
      columnVisibility,
      columnSizing: columnWidths,
    },
    onColumnSizingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnWidths) : updater;
      Object.entries(next).forEach(([id, width]) => setColumnWidth(id, width));
    },
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const handleSelect = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, [setSelectedSymbol]);

  const totalWidth = table.getAllColumns().reduce((sum, col) => sum + col.getSize(), 0) + 32;

  return (
    <div className="flex flex-col h-full">
      <div
        role="grid"
        aria-label="Stock screener results"
        aria-rowcount={rows.length + 1}
        className="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10" role="row">
          <div className="w-8 flex-shrink-0" role="columnheader" aria-label="Watchlist" />
          {table.getHeaderGroups()[0]?.headers.map((header) => (
            <div
              key={header.id}
              role="columnheader"
              aria-sort={
                sort.field === header.id
                  ? sort.direction === 'asc' ? 'ascending' : 'descending'
                  : 'none'
              }
              className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer select-none flex-shrink-0 relative group"
              style={{ width: header.getSize() }}
              onClick={() => toggleSort(header.id as typeof sort.field)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') toggleSort(header.id as typeof sort.field);
              }}
              tabIndex={0}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {sort.field === header.id && (
                <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
              )}
              <div
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover:bg-blue-400"
              />
            </div>
          ))}
        </div>

        <div ref={parentRef} className="flex-1 overflow-auto" tabIndex={0}>
          <div style={{ height: virtualizer.getTotalSize(), width: totalWidth, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;
              return (
                <GridRow
                  key={row.id}
                  row={row}
                  virtualIndex={virtualRow.index}
                  isSelected={selectedSymbol === row.original.symbol}
                  isWatchlisted={watchlistHas(row.original.symbol)}
                  onSelect={handleSelect}
                  onToggleWatchlist={watchlistToggle}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
