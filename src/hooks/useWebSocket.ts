'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRealtimeStore } from '@/stores/realtime-store';
import { api } from '@/lib/api/client';

const BASE_INTERVAL = 1000;
const MAX_INTERVAL = 30000;
const BATCH_SIZE = 50;

export function useWebSocket(enabled = true) {
  const setStatus = useRealtimeStore((s) => s.setStatus);
  const queueUpdates = useRealtimeStore((s) => s.queueUpdates);
  const flushUpdates = useRealtimeStore((s) => s.flushUpdates);
  const status = useRealtimeStore((s) => s.status);

  const retryCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const getBackoffInterval = useCallback(() => {
    const backoff = Math.min(BASE_INTERVAL * Math.pow(2, retryCountRef.current), MAX_INTERVAL);
    return backoff;
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      flushUpdates();
    });
  }, [flushUpdates]);

  const poll = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const updates = await api.getPriceUpdates();
      if (updates.length > 0) {
        queueUpdates(updates);
        scheduleFlush();
      }
      retryCountRef.current = 0;
      setStatus('connected');
    } catch {
      retryCountRef.current += 1;
      setStatus('reconnecting');
    }
  }, [queueUpdates, scheduleFlush, setStatus]);

  const connect = useCallback(() => {
    setStatus('connecting');
    poll();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(poll, getBackoffInterval());
  }, [poll, setStatus, getBackoffInterval]);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setStatus('disconnected');
  }, [setStatus]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) connect();
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  useEffect(() => {
    if (!enabled || status !== 'reconnecting') return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(poll, getBackoffInterval());
  }, [status, enabled, poll, getBackoffInterval]);

  return { status, connect, disconnect, batchSize: BATCH_SIZE };
}
