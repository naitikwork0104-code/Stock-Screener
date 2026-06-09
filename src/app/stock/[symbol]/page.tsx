'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StockDetailPanel } from '@/components/layout/StockDetail';
import { Header } from '@/components/layout/Header';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function StockPage() {
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase() ?? null;
  useWebSocket(true);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="p-4">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Screener
        </Link>
        <div className="max-w-5xl mx-auto">
          <StockDetailPanel symbol={symbol} />
        </div>
      </div>
    </div>
  );
}
