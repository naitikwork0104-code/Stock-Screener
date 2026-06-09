'use client';

import { memo, useEffect } from 'react';
import { useRealtimeStore } from '@/stores/realtime-store';
import { cn } from '@/lib/utils/format';

interface FlashCellProps {
  symbol: string;
  field: 'price' | 'changePercent';
  value: string;
  className?: string;
}

export const FlashCell = memo(function FlashCell({ symbol, value, className }: FlashCellProps) {
  const flash = useRealtimeStore((s) => s.flashDirections.get(symbol));
  const clearFlash = useRealtimeStore((s) => s.clearFlash);

  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => clearFlash(symbol), 300);
      return () => clearTimeout(timer);
    }
  }, [flash, symbol, clearFlash]);

  return (
    <span
      className={cn(
        'transition-colors duration-300',
        flash === 'up' && 'bg-green-200/60 dark:bg-green-900/40',
        flash === 'down' && 'bg-red-200/60 dark:bg-red-900/40',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {value}
    </span>
  );
});
