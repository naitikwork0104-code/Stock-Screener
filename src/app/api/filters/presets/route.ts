import { getFilterPresets, addFilterPreset } from '@/lib/data/cache';
import { apiSuccess, apiError } from '@/lib/api/response';
import type { FilterPreset } from '@/types';

export async function GET() {
  return apiSuccess(getFilterPresets());
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Omit<FilterPreset, 'id' | 'createdAt'>;
    if (!body.name || !body.rules) return apiError('Name and rules are required');
    const preset = addFilterPreset(body);
    return apiSuccess(preset, undefined, 201);
  } catch {
    return apiError('Invalid request body');
  }
}
