import React from 'react';
import { Candle, ConfluenceFactor, IndicatorValues, SignalDirection } from '../types/trading';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Activity, Sliders, ShieldCheck } from 'lucide-react';
import { TrendStrengthIndicator } from './TrendStrengthIndicator';

interface IndicatorsPanelProps {
  indicators: IndicatorValues;
  confluenceFactors: ConfluenceFactor[];
  probability: number;
  direction: SignalDirection | null;
  candles?: Candle[];
}

export const IndicatorsPanel: React.FC<IndicatorsPanelProps> = ({
  indicators,
  confluenceFactors,
  probability,
  direction,
  candles,
}) => {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-5 space-y-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Technical Confluence Engine (1M)
          </h3>
          <p className="text-xs text-neutral-400">
            Multi-indicator algorithmic model filtering noise for binary options 60s expiries.
          </p>
        </div>

        {direction ? (
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                direction === 'CALL'
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40'
                  : 'bg-rose-950/70 text-rose-300 border-rose-600/40'
              }`}
            >
              PREDICTED: {direction} ({probability}%)
            </span>
          </div>
        ) : (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800">
            Scanning Confluence
          </span>
        )}
      </div>

      {/* Key Metric Gauges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. RSI 14 Gauge */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>RSI (14)</span>
            <span
              className={`font-mono font-bold ${
                indicators.rsi14 <= 30
                  ? 'text-emerald-400'
                  : indicators.rsi14 >= 70
                  ? 'text-rose-400'
                  : 'text-neutral-300'
              }`}
            >
              {indicators.rsi14.toFixed(1)}
            </span>
          </div>
          {/* Progress bar with 30-70 zones */}
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                indicators.rsi14 <= 30
                  ? 'bg-emerald-500'
                  : indicators.rsi14 >= 70
                  ? 'bg-rose-500'
                  : 'bg-neutral-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, indicators.rsi14))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
            <span>Oversold 30</span>
            <span>Overbought 70</span>
          </div>
        </div>

        {/* 2. Fast RSI 7 */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>RSI (7 Fast)</span>
            <span
              className={`font-mono font-bold ${
                indicators.rsi7 <= 20
                  ? 'text-emerald-400'
                  : indicators.rsi7 >= 80
                  ? 'text-rose-400'
                  : 'text-neutral-300'
              }`}
            >
              {indicators.rsi7.toFixed(1)}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                indicators.rsi7 <= 20
                  ? 'bg-emerald-500'
                  : indicators.rsi7 >= 80
                  ? 'bg-rose-500'
                  : 'bg-neutral-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, indicators.rsi7))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
            <span>Extreme 20</span>
            <span>Extreme 80</span>
          </div>
        </div>

        {/* 3. Stochastic Oscillator %K / %D */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Stochastic (14, 3)</span>
            <span className="font-mono text-[11px] text-neutral-200">
              K:{indicators.stochK.toFixed(0)} D:{indicators.stochD.toFixed(0)}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                indicators.stochK < 20
                  ? 'bg-emerald-500'
                  : indicators.stochK > 80
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, indicators.stochK))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
            <span>Cross Reversal</span>
            <span className={indicators.stochK > indicators.stochD ? 'text-emerald-400' : 'text-rose-400'}>
              {indicators.stochK > indicators.stochD ? 'Bullish' : 'Bearish'}
            </span>
          </div>
        </div>

        {/* 4. EMA Ribbon Trend */}
        <div className="bg-neutral-900/70 border border-neutral-800/80 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>EMA 9 / 21 / 50</span>
            <span
              className={`font-mono text-xs font-bold ${
                indicators.trend.includes('BULL')
                  ? 'text-emerald-400'
                  : indicators.trend.includes('BEAR')
                  ? 'text-rose-400'
                  : 'text-neutral-400'
              }`}
            >
              {indicators.trend.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                indicators.trend.includes('BULL') ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                indicators.trend === 'NEUTRAL' ? 'bg-amber-500' : 'bg-neutral-800'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                indicators.trend.includes('BEAR') ? 'bg-rose-500' : 'bg-neutral-800'
              }`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
            <span>Trend Filter</span>
            <span>Dynamic Support</span>
          </div>
        </div>
      </div>

      {/* MACD Market Momentum Strength (0-100% Bullish/Bearish) */}
      <TrendStrengthIndicator macd={indicators.macd} candles={candles} />

      {/* Candlestick Price Action Recognition Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-neutral-400">Pattern Detected: </span>
            <strong className="text-white font-medium">{indicators.pattern}</strong>
          </div>
        </div>
        <div className="mt-1 sm:mt-0 font-mono text-[11px] text-neutral-400">
          Bollinger: U {indicators.bbUpper.toFixed(4)} · M {indicators.bbMiddle.toFixed(4)} · L{' '}
          {indicators.bbLower.toFixed(4)}
        </div>
      </div>

      {/* Confluence Factor Breakdown Checklist */}
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase block">
          Current Confluence Evaluation Matrix
        </span>
        <div className="divide-y divide-neutral-900 border border-neutral-800/80 rounded-lg overflow-hidden bg-neutral-900/30">
          {confluenceFactors.map((factor, idx) => {
            const isCall = factor.verdict === 'CALL';
            const isPut = factor.verdict === 'PUT';
            return (
              <div
                key={idx}
                className="p-2.5 sm:px-3 sm:py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isCall ? 'bg-emerald-400' : isPut ? 'bg-rose-400' : 'bg-neutral-600'
                    }`}
                  />
                  <div className="truncate">
                    <span className="font-semibold text-neutral-200">{factor.name}</span>
                    <p className="text-[11px] text-neutral-400 truncate">{factor.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  <span
                    className={`font-bold ${
                      isCall ? 'text-emerald-400' : isPut ? 'text-rose-400' : 'text-neutral-500'
                    }`}
                  >
                    {factor.verdict}
                  </span>
                  <span className="text-neutral-500 text-[11px]">wt {factor.weight}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
