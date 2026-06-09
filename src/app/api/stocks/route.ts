import { getStocks } from '@/lib/data/cache';
import { apiSuccess } from '@/lib/api/response';

export async function GET() {
  const stocks = getStocks();
  return apiSuccess(stocks, { count: stocks.length, timestamp: Date.now() });
}
