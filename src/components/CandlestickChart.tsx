import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Candle, CurrencyPair, PredictionSignal } from '../types/trading';
import { calculateBollingerBands, calculateEMA } from '../utils/indicators';
import { ZoomIn, ZoomOut, RotateCcw, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface CandlestickChartProps {
  candles: Candle[];
  pair: CurrencyPair;
  currentPrice: number;
  decimals: number;
  activeSignal: PredictionSignal | null;
  secondsRemaining: number;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  pair,
  currentPrice,
  decimals,
  activeSignal,
  secondsRemaining,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [visibleCount, setVisibleCount] = useState<number>(36);
  const [hoverData, setHoverData] = useState<{
    candle: Candle;
    x: number;
    y: number;
  } | null>(null);

  // Pre-calculate technical indicator overlays
  const closes = useMemo(() => candles.map((c) => c.close), [candles]);
  const ema9 = useMemo(() => calculateEMA(closes, 9), [closes]);
  const ema21 = useMemo(() => calculateEMA(closes, 21), [closes]);
  const bb = useMemo(() => calculateBollingerBands(closes, 20, 2.0), [closes]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Margins
    const marginTop = 20;
    const marginBottom = 28;
    const marginRight = 64; // price scale zone
    const marginLeft = 10;
    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Clear background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Candles to display
    const sliceCount = Math.min(candles.length, visibleCount);
    const startIndex = Math.max(0, candles.length - sliceCount);
    const visibleCandles = candles.slice(startIndex);

    if (visibleCandles.length === 0) return;

    // Determine min/max price range for scale
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (let i = 0; i < visibleCandles.length; i++) {
      const c = visibleCandles[i];
      const origIdx = startIndex + i;
      minPrice = Math.min(minPrice, c.low, bb.lower[origIdx] || c.low);
      maxPrice = Math.max(maxPrice, c.high, bb.upper[origIdx] || c.high);
    }

    // Add 8% buffer to top and bottom
    const priceRange = maxPrice - minPrice || 0.001;
    const priceMinBuffered = minPrice - priceRange * 0.08;
    const priceMaxBuffered = maxPrice + priceRange * 0.08;
    const totalBufferedRange = priceMaxBuffered - priceMinBuffered;

    const getY = (price: number) => {
      return marginTop + chartHeight * (1 - (price - priceMinBuffered) / totalBufferedRange);
    };

    const candleWidth = Math.max(3, (chartWidth / visibleCandles.length) * 0.72);
    const candleSlotWidth = chartWidth / visibleCandles.length;

    // 1. Draw horizontal grid lines & price labels
    const gridLinesCount = 6;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e1e1e';
    ctx.fillStyle = '#737373';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridLinesCount; i++) {
      const p = priceMinBuffered + (totalBufferedRange * i) / gridLinesCount;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(width - marginRight, y);
      ctx.stroke();

      // Price text in right rail
      ctx.fillText(p.toFixed(decimals), width - marginRight + 8, y + 3.5);
    }

    // 2. Draw vertical grid lines (every 5 candles)
    for (let i = 0; i < visibleCandles.length; i += 5) {
      const x = marginLeft + i * candleSlotWidth + candleSlotWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, height - marginBottom);
      ctx.stroke();

      const d = new Date(visibleCandles[i].timestamp);
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      ctx.fillText(timeStr, x - 14, height - 10);
    }

    // 3. Draw Bollinger Bands Channel Fill & Lines
    if (bb.upper.length > 0) {
      // Channel shading
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const origIdx = startIndex + i;
        const x = marginLeft + i * candleSlotWidth + candleSlotWidth / 2;
        const yUpper = getY(bb.upper[origIdx]);
        if (i === 0) ctx.moveTo(x, yUpper);
        else ctx.lineTo(x, yUpper);
      }
      for (let i = visibleCandles.length - 1; i >= 0; i--) {
        const origIdx = startIndex + i;
        const x = marginLeft + i * candleSlotWidth + candleSlotWidth / 2;
        const yLower = getY(bb.lower[origIdx]);
        ctx.lineTo(x, yLower);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fill();

      // Upper band line
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      for (let i = 0; i < visibleCandles.length; i++) {
        const origIdx = startIndex + i;
        const x = marginLeft + i * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(bb.upper[origIdx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Lower band line
      ctx.beginPath();
      for (let i = 0; i < visibleCandles.length; i++) {
        const origIdx = startIndex + i;
        const x = marginLeft + i * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(bb.lower[origIdx]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 4. Draw EMA Lines (EMA 9 = Cyan, EMA 21 = Amber)
    const drawLine = (data: number[], color: string, dash: number[] = []) => {
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;
      ctx.setLineDash(dash);
      let started = false;

      for (let i = 0; i < visibleCandles.length; i++) {
        const origIdx = startIndex + i;
        const val = data[origIdx];
        if (val === undefined || isNaN(val)) continue;
        const x = marginLeft + i * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(val);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawLine(ema9, '#06b6d4'); // EMA 9 Cyan
    drawLine(ema21, '#f59e0b'); // EMA 21 Amber

    // 5. Draw Candlesticks
    visibleCandles.forEach((c, idx) => {
      const origIdx = startIndex + idx;
      const xCenter = marginLeft + idx * candleSlotWidth + candleSlotWidth / 2;
      const isGreen = c.close >= c.open;
      const color = isGreen ? '#10b981' : '#ef4444';

      // Draw Wicks
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.moveTo(xCenter, getY(c.high));
      ctx.lineTo(xCenter, getY(c.low));
      ctx.stroke();

      // Draw Candle Body
      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

      ctx.fillStyle = color;
      ctx.fillRect(xCenter - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Signal Marker on this candle if active signal targets it
      if (activeSignal && activeSignal.targetCandleTime === c.timestamp) {
        const isCall = activeSignal.direction === 'CALL';
        const markerY = isCall ? getY(c.low) + 18 : getY(c.high) - 18;

        ctx.fillStyle = isCall ? '#10b981' : '#ef4444';
        ctx.beginPath();
        if (isCall) {
          // Arrow UP
          ctx.moveTo(xCenter, markerY - 8);
          ctx.lineTo(xCenter - 7, markerY + 4);
          ctx.lineTo(xCenter + 7, markerY + 4);
        } else {
          // Arrow DOWN
          ctx.moveTo(xCenter, markerY + 8);
          ctx.lineTo(xCenter - 7, markerY - 4);
          ctx.lineTo(xCenter + 7, markerY - 4);
        }
        ctx.closePath();
        ctx.fill();

        // Label
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(activeSignal.direction, xCenter, isCall ? markerY + 14 : markerY - 10);
      }
    });

    // 6. Draw Current Live Price Line & Badge in right rail
    const liveY = getY(currentPrice);
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.moveTo(marginLeft, liveY);
    ctx.lineTo(width - marginRight, liveY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Price Tag Badge
    ctx.fillStyle = '#10b981';
    const tagWidth = 56;
    const tagHeight = 18;
    ctx.fillRect(width - marginRight + 2, liveY - tagHeight / 2, tagWidth, tagHeight);
    ctx.fillStyle = '#0a0a0a';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrice.toFixed(decimals), width - marginRight + 2 + tagWidth / 2, liveY + 3.5);

    // 7. Crosshair
    if (hoverData) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([2, 2]);
      // Vertical line
      ctx.moveTo(hoverData.x, marginTop);
      ctx.lineTo(hoverData.x, height - marginBottom);
      // Horizontal line
      ctx.moveTo(marginLeft, hoverData.y);
      ctx.lineTo(width - marginRight, hoverData.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, visibleCount, currentPrice, decimals, activeSignal, hoverData, bb, ema9, ema21]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const marginLeft = 10;
    const marginRight = 64;
    const chartWidth = rect.width - marginLeft - marginRight;

    const sliceCount = Math.min(candles.length, visibleCount);
    const startIndex = Math.max(0, candles.length - sliceCount);
    const visibleCandles = candles.slice(startIndex);
    const candleSlotWidth = chartWidth / visibleCandles.length;

    const candleIdx = Math.floor((x - marginLeft) / candleSlotWidth);
    if (candleIdx >= 0 && candleIdx < visibleCandles.length) {
      setHoverData({
        candle: visibleCandles[candleIdx],
        x: marginLeft + candleIdx * candleSlotWidth + candleSlotWidth / 2,
        y,
      });
    } else {
      setHoverData(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
    >
      {/* Chart Top Sub-Bar: Pair, Timeframe, Overlays Legend & Zoom */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{pair}</span>
            <span className="text-neutral-500 font-mono text-[11px]">1M CANDLES</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block rounded-full"></span>
              EMA 9
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded-full"></span>
              EMA 21
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-blue-400/60 inline-block rounded-full"></span>
              BB (20, 2)
            </span>
          </div>
        </div>

        {/* Dynamic 1-Minute Candle Expiry Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold border ${
              secondsRemaining <= 10
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>00:{String(secondsRemaining).padStart(2, '0')}</span>
            <span className="text-[10px] text-neutral-400 font-normal">NEXT</span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-neutral-800/80 rounded-md p-0.5 border border-neutral-700/80">
            <button
              onClick={() => setVisibleCount((v) => Math.min(60, v + 6))}
              className="p-1 hover:text-white text-neutral-400 rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setVisibleCount((v) => Math.max(18, v - 6))}
              className="p-1 hover:text-white text-neutral-400 rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setVisibleCount(36)}
              className="p-1 hover:text-white text-neutral-400 rounded transition-colors"
              title="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Hover Crosshair OHLC Inspector Box */}
        {hoverData && (
          <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur border border-neutral-700 px-3 py-1.5 rounded-lg text-xs font-mono pointer-events-none shadow-lg z-20 flex items-center gap-3">
            <span className="text-neutral-400">
              {new Date(hoverData.candle.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-neutral-300">
              O: <strong className="text-white">{hoverData.candle.open.toFixed(decimals)}</strong>
            </span>
            <span className="text-neutral-300">
              H: <strong className="text-white">{hoverData.candle.high.toFixed(decimals)}</strong>
            </span>
            <span className="text-neutral-300">
              L: <strong className="text-white">{hoverData.candle.low.toFixed(decimals)}</strong>
            </span>
            <span
              className={
                hoverData.candle.close >= hoverData.candle.open ? 'text-emerald-400' : 'text-rose-400'
              }
            >
              C: <strong>{hoverData.candle.close.toFixed(decimals)}</strong>
            </span>
            <span className="text-neutral-500">Vol: {hoverData.candle.volume}</span>
          </div>
        )}
      </div>
    </div>
  );
};
