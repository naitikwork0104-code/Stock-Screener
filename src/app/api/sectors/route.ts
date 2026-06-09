import { getSectors } from '@/lib/data/cache';
import { apiSuccess } from '@/lib/api/response';

export async function GET() {
  return apiSuccess(getSectors());
}
