import type { OHLCV, Timeframe } from '@/types';
import { getStockBySymbol } from '@/lib/data/cache';
import { getStockHistory } from '@/lib/data/generator';
import { apiSuccess, apiError } from '@/lib/api/response';

function filterByTimeframe(data: OHLCV[], timeframe: Timeframe): OHLCV[] {
  const daysMap: Record<Timeframe, number> = {
    '1D': 1, '1W': 5, '1M': 22, '3M': 66, '1Y': 252, '5Y': 1260,
  };
  const days = daysMap[timeframe] ?? 252;
  return data.slice(-days);
}

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const stock = getStockBySymbol(params.symbol.toUpperCase());
  if (!stock) return apiError('Stock not found', 404);

  const { searchParams } = new URL(request.url);
  const timeframe = (searchParams.get('timeframe') ?? '1Y') as Timeframe;
  const history = getStockHistory(stock.symbol, stock);
  const filtered = filterByTimeframe(history, timeframe);

  return apiSuccess(filtered, { symbol: stock.symbol, timeframe, count: filtered.length });
}
