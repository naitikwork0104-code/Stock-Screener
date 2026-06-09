import { describe, it, expect } from 'vitest';
import { apiSuccess, apiError } from '@/lib/api/response';

describe('API Response helpers', () => {
  it('creates success response', async () => {
    const res = apiSuccess({ id: 1 }, { count: 1 });
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: 1 });
    expect(body.meta?.count).toBe(1);
  });

  it('creates error response', async () => {
    const res = apiError('Not found', 404);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Not found');
  });
});
