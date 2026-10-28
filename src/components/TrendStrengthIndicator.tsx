import React, { useMemo } from 'react';
import { MACDData, Candle } from '../types/trading';
import { calculateMACD } from '../utils/indicators';
import { TrendingUp, TrendingDown, Gauge, Activity, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

interface TrendStrengthIndicatorProps {
  macd?: MACDData;
  candles?: Candle[];
  closes?: number[];
  className?: string;
}

export const TrendStrengthIndicator: React.FC<TrendStrengthIndicatorProps> = ({
  macd: propMacd,
  candles,
  closes: propCloses,
  className = '',
}) => {
  // If MACDData isn't provided directly, calculate it from candles or closes
  const macdData = useMemo<MACDData>(() => {
    if (propMacd) return propMacd;
    const closes = propCloses || candles?.map((c) => c.close) || [];
    if (closes.length === 0) {
      return {
        macdLine: 0,
        signalLine: 0,
        histogram: 0,
        prevHistogram: 0,
        momentumStrength: 50,
        momentumBias: 'NEUTRAL',
        histogramState: 'NEUTRAL',
        crossoverState: 'NONE',
      };
    }
    const result = calculateMACD(closes, 12, 26, 9);
    return result.latest;
  }, [propMacd, candles, propCloses]);

  // Mini-histogram sequence for visual momentum wave
  const recentHistogram = useMemo(() => {
    const closes = propCloses || candles?.map((c) => c.close) || [];
    if (closes.length < 15) return [];
    const result = calculateMACD(closes, 12, 26, 9);
    return result.histogram.slice(-14);
  }, [candles, propCloses]);

  const {
    macdLine,
    signalLine,
    histogram,
    momentumStrength,
    momentumBias,
    histogramState,
    crossoverState,
  } = macdData;

  const isBull = momentumBias === 'BULLISH';
  const isBear = momentumBias === 'BEARISH';

  // Format decimals based on magnitude
  const formatVal = (val: number) => {
    const abs = Math.abs(val);
    if (abs < 0.001) return val.toFixed(6);
    if (abs < 0.1) return val.toFixed(5);
    return val.toFixed(4);
  };

  // Determine state description
  const stateDescription = useMemo(() => {
    if (crossoverState === 'BULLISH_CROSS') {
      return 'Bullish Signal Crossover (High Conviction Call)';
    }
    if (crossoverState === 'BEARISH_CROSS') {
      return 'Bearish Signal Crossover (High Conviction Put)';
    }
    if (histogramState === 'EXPANDING_BULL') {
      return 'Bullish Momentum Accelerating (Wave Expansion)';
    }
    if (histogramState === 'CONTRACTING_BULL') {
      return 'Bullish Momentum Fading (Mean-Reversion Watch)';
    }
    if (histogramState === 'EXPANDING_BEAR') {
      return 'Bearish Momentum Accelerating (Wave Expansion)';
    }
    if (histogramState === 'CONTRACTING_BEAR') {
      return 'Bearish Momentum Fading (Exhaustion Watch)';
    }
    return 'Neutral Equilibrium (Consolidation Phase)';
  }, [crossoverState, histogramState]);

  // Max histogram scale for mini bar chart
  const maxAbsHist = useMemo(() => {
    if (recentHistogram.length === 0) return 0.0001;
    return Math.max(...recentHistogram.map((h) => Math.abs(h)), 0.00001);
  }, [recentHistogram]);

  return (
    <div className={`bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 space-y-4 ${className}`}>
      {/* Indicator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isBull
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : isBear
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
            }`}
          >
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase">
              Trend Strength Indicator (MACD Momentum)
            </h4>
            <span className="text-[11px] text-neutral-400">
              Moving Average Convergence Divergence (12, 26, 9)
            </span>
          </div>
        </div>

        {/* Strength Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
              isBull
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50 shadow-sm shadow-emerald-950/40'
                : isBear
                ? 'bg-rose-950/80 text-rose-300 border-rose-600/50 shadow-sm shadow-rose-950/40'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
            }`}
          >
            {isBull ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            ) : isBear ? (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
            ) : null}
            <span>
              {momentumStrength}% {momentumBias} STRENGTH
            </span>
          </span>
        </div>
      </div>

      {/* Primary Momentum Strength Meter: Split Bull/Bear Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className={`font-bold flex items-center gap-1 ${isBear ? 'text-rose-400' : 'text-neutral-500'}`}>
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Bearish {isBear ? `${momentumStrength}%` : ''}</span>
          </span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans">
            50% Equilibrium Zero-Line
          </span>
          <span className={`font-bold flex items-center gap-1 ${isBull ? 'text-emerald-400' : 'text-neutral-500'}`}>
            <span>Bullish {isBull ? `${momentumStrength}%` : ''}</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Split Meter Bar */}
        <div className="relative w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 flex">
          {/* Bearish Side (Left half: 0 to 50%) */}
          <div className="w-1/2 h-full flex justify-end bg-neutral-900/50 relative">
            {isBear && (
              <div
                className="h-full bg-gradient-to-l from-rose-500 to-rose-600 rounded-l-full transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                style={{ width: `${Math.min(100, Math.max(10, (momentumStrength - 50) * 2))}%` }}
              />
            )}
          </div>

          {/* Center Dividing Zero Line */}
          <div className="w-0.5 h-full bg-white/40 z-10 shrink-0" />

          {/* Bullish Side (Right half: 50% to 100%) */}
          <div className="w-1/2 h-full flex justify-start bg-neutral-900/50 relative">
            {isBull && (
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-r-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                style={{ width: `${Math.min(100, Math.max(10, (momentumStrength - 50) * 2))}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Technical Metric Values & Mini Histogram Wave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Metric Value Columns */}
        <div className="grid grid-cols-3 gap-2 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80 font-mono text-xs">
          <div>
            <span className="text-[10px] text-neutral-500 block">MACD (12, 26)</span>
            <strong className={`font-bold ${macdLine >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatVal(macdLine)}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Signal (9)</span>
            <strong className="text-amber-400 font-bold">{formatVal(signalLine)}</strong>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Histogram</span>
            <strong className={`font-bold ${histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {histogram >= 0 ? `+${formatVal(histogram)}` : formatVal(histogram)}
            </strong>
          </div>
        </div>

        {/* Mini MACD Histogram Bars Visualizer */}
        <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-1">
            <span>Recent 14 Bars Histogram</span>
            <span className={isBull ? 'text-emerald-400' : 'text-rose-400'}>
              {histogramState.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between h-7 gap-1">
            {recentHistogram.length > 0 ? (
              recentHistogram.map((h, i) => {
                const isBarGreen = h >= 0;
                const heightPct = Math.min(100, Math.max(15, (Math.abs(h) / maxAbsHist) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-center h-full">
                    <div
                      className={`w-full rounded-sm transition-all ${
                        isBarGreen
                          ? i === recentHistogram.length - 1
                            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                            : 'bg-emerald-500/70'
                          : i === recentHistogram.length - 1
                          ? 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                          : 'bg-rose-500/70'
                      }`}
                      style={{ height: `${heightPct * 0.75}%` }}
                      title={`Bar ${i + 1}: ${h.toFixed(6)}`}
                    />
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-[10px] text-neutral-500 font-mono">
                Computing bars...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tactical Quotex Execution Note */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/90 text-xs">
        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-neutral-300">
          <strong>Tactical Status:</strong> {stateDescription}
        </span>
      </div>
    </div>
  );
};
