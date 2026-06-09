import { generateBatchUpdates } from '@/lib/websocket/simulator';
import { updateStockPrice } from '@/lib/data/cache';
import { apiSuccess } from '@/lib/api/response';

export async function GET() {
  const updates = generateBatchUpdates(50);
  for (const update of updates) {
    updateStockPrice(update.symbol, update.price, update.volume);
  }
  return apiSuccess(updates, { count: updates.length, timestamp: Date.now() });
}
