'use client';

import Link from 'next/link';
import { useRealtimeStore } from '@/stores/realtime-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils/format';

export function Header() {
  const status = useRealtimeStore((s) => s.status);
  const highContrast = useUIStore((s) => s.highContrast);
  const toggleHighContrast = useUIStore((s) => s.toggleHighContrast);
  const toggleFilterPanel = useUIStore((s) => s.toggleFilterPanel);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const statusColor = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-500',
    reconnecting: 'bg-orange-500',
    disconnected: 'bg-red-500',
  }[status];

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          StockScreener
        </Link>
        <nav aria-label="Main navigation" className="hidden sm:flex gap-4 text-sm">
          <Link href="/" className="hover:text-blue-600">Screener</Link>
          <Link href="/watchlist" className="hover:text-blue-600">Watchlist</Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm" aria-label={`WebSocket status: ${status}`}>
          <span className={cn('w-2 h-2 rounded-full', statusColor)} />
          <span className="hidden sm:inline capitalize">{status}</span>
        </div>
        <button
          onClick={toggleFilterPanel}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle filter panel"
        >
          Filters
        </button>
        <button
          onClick={toggleSidebar}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle sidebar"
        >
          Panel
        </button>
        <button
          onClick={toggleHighContrast}
          className={cn(
            'px-3 py-1 text-sm border rounded',
            highContrast && 'bg-black text-white border-black'
          )}
          aria-pressed={highContrast}
          aria-label="Toggle high contrast mode"
        >
          HC
        </button>
      </div>
    </header>
  );
}
