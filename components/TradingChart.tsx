'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, CandlestickData, Time, ColorType, CandlestickSeries } from 'lightweight-charts';
import { Card } from '@/components/ui/Card';

interface TradingChartProps {
  selectedAsset?: string;
  onAssetChange?: (asset: string) => void;
}

// Map asset symbols to Backpack Exchange trading pairs
const SYMBOL_MAP: Record<string, string> = {
  BTC: 'BTC_USDC',
  ETH: 'ETH_USDC',
  SOL: 'SOL_USDC',
};

const ASSETS = ['BTC', 'ETH', 'SOL'] as const;

interface KlineData {
  start: string;
  end: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  quoteVolume: string;
  trades: string;
}

interface WebSocketKlineData {
  e: string;
  E: number;
  s: string;
  t: string;
  T: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
  X: boolean;
}

interface TickerData {
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  high: string;
  low: string;
  volume: string;
}

export function TradingChart({ selectedAsset, onAssetChange }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  const [activeAsset, setActiveAsset] = useState(selectedAsset || 'SOL');
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const symbol = SYMBOL_MAP[activeAsset];

  // Fetch historical kline data
  const fetchHistoricalData = useCallback(async () => {
    try {
      setIsLoading(true);
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (24 * 60 * 60); // Last 24 hours
      
      const response = await fetch(
        `/api/klines?symbol=${symbol}&interval=1m&startTime=${startTime}&endTime=${endTime}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch klines');
      
      const data: KlineData[] = await response.json();
      
      const candleData: CandlestickData<Time>[] = data.map((kline) => ({
        time: (new Date(kline.start).getTime() / 1000) as Time,
        open: parseFloat(kline.open),
        high: parseFloat(kline.high),
        low: parseFloat(kline.low),
        close: parseFloat(kline.close),
      }));

      if (candleSeriesRef.current && candleData.length > 0) {
        candleSeriesRef.current.setData(candleData);
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // Fetch ticker data
  const fetchTicker = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/ticker?symbol=${symbol}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch ticker');
      
      const data = await response.json();
      setTicker({
        lastPrice: data.lastPrice,
        priceChange: data.priceChange,
        priceChangePercent: data.priceChangePercent,
        high: data.high,
        low: data.low,
        volume: data.volume,
      });
    } catch (error) {
      console.error('Failed to fetch ticker:', error);
    }
  }, [symbol]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#10b981',
          width: 1,
          style: 2,
          labelBackgroundColor: '#10b981',
        },
        horzLine: {
          color: '#10b981',
          width: 1,
          style: 2,
          labelBackgroundColor: '#10b981',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  // Fetch data and connect WebSocket when asset changes
  useEffect(() => {
    fetchHistoricalData();
    fetchTicker();

    // Connect to WebSocket
    const ws = new WebSocket('wss://ws.backpack.exchange');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Subscribe to kline stream
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [`kline.1m.${symbol}`],
      }));
      // Subscribe to ticker stream
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [`ticker.${symbol}`],
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.stream?.startsWith('kline.')) {
          const kline: WebSocketKlineData = message.data;
          
          if (candleSeriesRef.current) {
            candleSeriesRef.current.update({
              time: (new Date(kline.t).getTime() / 1000) as Time,
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
            });
          }
        }
        
        if (message.stream?.startsWith('ticker.')) {
          const data = message.data;
          setTicker({
            lastPrice: data.c,
            priceChange: (parseFloat(data.c) - parseFloat(data.o)).toFixed(2),
            priceChangePercent: (((parseFloat(data.c) - parseFloat(data.o)) / parseFloat(data.o)) * 100).toFixed(2),
            high: data.h,
            low: data.l,
            volume: data.v,
          });
        }
      } catch (error) {
        // Ignore parse errors for ping/pong frames
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    // Refresh ticker data periodically
    const tickerInterval = setInterval(fetchTicker, 5000);

    return () => {
      clearInterval(tickerInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol, fetchHistoricalData, fetchTicker]);

  const handleAssetChange = (asset: string) => {
    setActiveAsset(asset);
    onAssetChange?.(asset);
  };

  const priceChange = ticker ? parseFloat(ticker.priceChangePercent) : 0;
  const isPositive = priceChange >= 0;

  return (
    <Card className="overflow-hidden">
      {/* Header with asset tabs and ticker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Asset Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          {ASSETS.map((asset) => (
            <button
              key={asset}
              onClick={() => handleAssetChange(asset)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeAsset === asset
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>

        {/* Ticker Stats */}
        <div className="flex items-center gap-6">
          {ticker ? (
            <>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-0.5">Price</p>
                <p className="text-lg font-bold text-white">
                  ${parseFloat(ticker.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-0.5">24h Change</p>
                <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-xs text-zinc-500 mb-0.5">24h High</p>
                <p className="text-sm font-medium text-white">
                  ${parseFloat(ticker.high).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-xs text-zinc-500 mb-0.5">24h Low</p>
                <p className="text-sm font-medium text-white">
                  ${parseFloat(ticker.low).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <div className="w-20 h-8 skeleton rounded" />
              <div className="w-16 h-8 skeleton rounded" />
            </div>
          )}
          
          {/* Connection indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-zinc-500">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 z-10">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div
          ref={chartContainerRef}
          className="w-full h-[400px] rounded-lg overflow-hidden"
        />
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>1 Minute Candles • {activeAsset}/USDC</span>
        <span>Data from Backpack Exchange</span>
      </div>
    </Card>
  );
}
