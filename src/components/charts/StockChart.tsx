'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type Time,
} from 'lightweight-charts';
import type { OHLCV, Timeframe, ChartIndicator } from '@/types';
import { calculateSMA, calculateEMA, calculateBollingerBands, calculateRSI } from '@/lib/indicators';
import { cn } from '@/lib/utils/format';

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

interface StockChartProps {
  data: OHLCV[];
  symbol: string;
  onTimeframeChange?: (tf: Timeframe) => void;
  timeframe?: Timeframe;
}

export function StockChart({ data, symbol, onTimeframeChange, timeframe = '1Y' }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [indicators, setIndicators] = useState<ChartIndicator[]>([
    { type: 'SMA', period: 50, enabled: false, color: '#2196F3' },
    { type: 'SMA', period: 200, enabled: false, color: '#FF9800' },
    { type: 'EMA', period: 20, enabled: false, color: '#9C27B0' },
    { type: 'BOLLINGER', period: 20, enabled: false, color: '#607D8B' },
    { type: 'RSI', period: 14, enabled: false, color: '#E91E63' },
    { type: 'VOLUME', period: 0, enabled: true },
  ]);
  const [showTable, setShowTable] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const candleData: CandlestickData<Time>[] = useMemo(
    () => data.map((d) => ({ time: d.date as Time, open: d.open, high: d.high, low: d.low, close: d.close })),
    [data]
  );

  const volumeData: HistogramData<Time>[] = useMemo(
    () => data.map((d) => ({
      time: d.date as Time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
    })),
    [data]
  );

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#333' },
      grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#e0e0e0' },
      timeScale: { borderColor: '#e0e0e0', timeVisible: true },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350',
      borderUpColor: '#26a69a', borderDownColor: '#ef5350',
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    candleSeries.setData(candleData);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volumeSeries.setData(volumeData);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    setAnnouncement(`Chart loaded for ${symbol} with ${data.length} data points`);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [symbol, candleData, volumeData, data.length]);

  useEffect(() => {
    candleSeriesRef.current?.setData(candleData);
    volumeSeriesRef.current?.setData(volumeData);
    if (chartRef.current) chartRef.current.timeScale().fitContent();
    setAnnouncement(`Chart updated: ${data.length} candles for ${symbol}`);
  }, [candleData, volumeData, data.length, symbol]);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;
    const chart = chartRef.current;

    indicators.forEach((ind) => {
      if (!ind.enabled || ind.type === 'VOLUME') return;

      if (ind.type === 'SMA' || ind.type === 'EMA') {
        const values = ind.type === 'SMA' ? calculateSMA(data, ind.period) : calculateEMA(data, ind.period);
        const lineData: LineData<Time>[] = [];
        values.forEach((v, i) => {
          if (v !== null) lineData.push({ time: data[i].date as Time, value: v });
        });
        const series = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 1, title: `${ind.type}${ind.period}` });
        series.setData(lineData);
      }

      if (ind.type === 'BOLLINGER') {
        const bands = calculateBollingerBands(data, ind.period);
        ['upper', 'lower'].forEach((band) => {
          const lineData: LineData<Time>[] = [];
          const values = band === 'upper' ? bands.upper : bands.lower;
          values.forEach((v, i) => {
            if (v !== null) lineData.push({ time: data[i].date as Time, value: v });
          });
          const series = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 1, lineStyle: 2 });
          series.setData(lineData);
        });
      }
    });
  }, [indicators, data]);

  const toggleIndicator = (index: number) => {
    setIndicators((prev) =>
      prev.map((ind, i) => (i === index ? { ...ind, enabled: !ind.enabled } : ind))
    );
  };

  const rsiValues = useMemo(() => {
    const rsiInd = indicators.find((i) => i.type === 'RSI' && i.enabled);
    if (!rsiInd) return null;
    return calculateRSI(data, rsiInd.period);
  }, [indicators, data]);

  return (
    <div className="flex flex-col gap-3">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1" role="tablist" aria-label="Chart timeframes">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              role="tab"
              aria-selected={timeframe === tf}
              onClick={() => onTimeframeChange?.(tf)}
              className={cn(
                'px-3 py-1 text-sm rounded',
                timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {indicators.map((ind, i) => (
            <button
              key={`${ind.type}-${ind.period}`}
              onClick={() => toggleIndicator(i)}
              aria-pressed={ind.enabled}
              className={cn(
                'px-2 py-1 text-xs rounded border',
                ind.enabled ? 'bg-blue-100 border-blue-400 text-blue-700' : 'border-gray-300'
              )}
            >
              {ind.type}{ind.period > 0 ? `(${ind.period})` : ''}
            </button>
          ))}
          <button
            onClick={() => setShowTable(!showTable)}
            className="px-2 py-1 text-xs border rounded"
            aria-pressed={showTable}
          >
            {showTable ? 'Chart View' : 'Table View'}
          </button>
        </div>
      </div>

      {showTable ? (
        <div className="overflow-auto max-h-96" role="table" aria-label={`${symbol} price data table`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-right">Open</th>
                <th className="px-2 py-1 text-right">High</th>
                <th className="px-2 py-1 text-right">Low</th>
                <th className="px-2 py-1 text-right">Close</th>
                <th className="px-2 py-1 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-30).reverse().map((d) => (
                <tr key={d.date} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-2 py-1">{d.date}</td>
                  <td className="px-2 py-1 text-right">{d.open}</td>
                  <td className="px-2 py-1 text-right">{d.high}</td>
                  <td className="px-2 py-1 text-right">{d.low}</td>
                  <td className="px-2 py-1 text-right">{d.close}</td>
                  <td className="px-2 py-1 text-right">{d.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={chartContainerRef} role="img" aria-label={`Candlestick chart for ${symbol}`} />
      )}

      {rsiValues && (
        <div className="text-sm text-gray-500" aria-label="RSI indicator values">
          Latest RSI: {rsiValues.filter((v) => v !== null).pop()?.toFixed(2) ?? 'N/A'}
        </div>
      )}
    </div>
  );
}
