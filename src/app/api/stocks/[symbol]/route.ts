import { getStockBySymbol } from '@/lib/data/cache';
import { getStockDetail } from '@/lib/data/generator';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(
  _request: Request,
  { params }: { params: { symbol: string } }
) {
  const stock = getStockBySymbol(params.symbol.toUpperCase());
  if (!stock) return apiError('Stock not found', 404);
  return apiSuccess(getStockDetail(stock));
}
