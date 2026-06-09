'use client';

import { createColumnHelper } from '@tanstack/react-table';
import type { Stock } from '@/types';
import { formatPrice, formatPercent, formatVolume, formatMarketCap, formatNumber } from '@/lib/utils/format';
import { FlashCell } from './FlashCell';

const columnHelper = createColumnHelper<Stock>();

export const stockColumns = [
  columnHelper.accessor('symbol', {
    id: 'symbol',
    header: 'Symbol',
    size: 100,
    cell: (info) => (
      <span className="font-semibold text-blue-600 dark:text-blue-400">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('price', {
    id: 'price',
    header: 'Price',
    size: 90,
    cell: (info) => (
      <FlashCell symbol={info.row.original.symbol} field="price" value={formatPrice(info.getValue())} />
    ),
  }),
  columnHelper.accessor('changePercent', {
    id: 'changePercent',
    header: 'Change %',
    size: 90,
    cell: (info) => {
      const val = info.getValue();
      const color = val >= 0 ? 'text-green-600' : 'text-red-600';
      return (
        <FlashCell
          symbol={info.row.original.symbol}
          field="changePercent"
          value={formatPercent(val)}
          className={color}
        />
      );
    },
  }),
  columnHelper.accessor('volume', {
    id: 'volume',
    header: 'Volume',
    size: 100,
    cell: (info) => formatVolume(info.getValue()),
  }),
  columnHelper.accessor('marketCap', {
    id: 'marketCap',
    header: 'Market Cap',
    size: 110,
    cell: (info) => formatMarketCap(info.getValue()),
  }),
  columnHelper.accessor((row) => row.fundamentals.pe, {
    id: 'pe',
    header: 'P/E',
    size: 70,
    cell: (info) => formatNumber(info.getValue()),
  }),
  columnHelper.accessor((row) => row.fundamentals.pb, {
    id: 'pb',
    header: 'P/B',
    size: 70,
    cell: (info) => formatNumber(info.getValue()),
  }),
  columnHelper.accessor((row) => row.fundamentals.roe, {
    id: 'roe',
    header: 'ROE',
    size: 70,
    cell: (info) => `${formatNumber(info.getValue())}%`,
  }),
  columnHelper.accessor((row) => row.fundamentals.roce, {
    id: 'roce',
    header: 'ROCE',
    size: 80,
    cell: (info) => `${formatNumber(info.getValue())}%`,
  }),
  columnHelper.accessor('sector', {
    id: 'sector',
    header: 'Sector',
    size: 140,
    cell: (info) => <span className="truncate">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => row.technical.rsi, {
    id: 'rsi',
    header: 'RSI',
    size: 70,
    cell: (info) => formatNumber(info.getValue(), 1),
  }),
  columnHelper.accessor((row) => row.technical.sma50, {
    id: 'sma50',
    header: 'SMA50',
    size: 90,
    cell: (info) => formatPrice(info.getValue()),
  }),
  columnHelper.accessor((row) => row.technical.sma200, {
    id: 'sma200',
    header: 'SMA200',
    size: 90,
    cell: (info) => formatPrice(info.getValue()),
  }),
];
