import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiResponse<T> = { success: true, data, meta };
  return NextResponse.json(body, { status });
}

export function apiError(message: string, status = 400) {
  const body: ApiResponse<null> = { success: false, data: null, error: message };
  return NextResponse.json(body, { status });
}
