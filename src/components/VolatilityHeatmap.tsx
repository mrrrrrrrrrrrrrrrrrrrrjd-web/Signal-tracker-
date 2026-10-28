import React, { useState, useMemo } from 'react';
import { CurrencyPair, PairMarketData } from '../types/trading';
import { calculateVolatilityMetrics, VolatilityMetrics } from '../utils/indicators';
import { PAIR_CONFIGS } from '../utils/marketSimulator';
import { Flame, Zap, ArrowRight, Activity, TrendingUp, AlertTriangle, ShieldCheck, BarChart2 } from 'lucide-react';

interface VolatilityHeatmapProps {
  pairsData: PairMarketData[];
  selectedPair: CurrencyPair;
  onSelectPair: (pair: CurrencyPair) => void;
  className?: string;
}

interface PairVolatilityItem {
  pair: CurrencyPair;
  displayName: string;
  currentPrice: number;
  decimals: number;
  payoutPercent: number;
  metrics: VolatilityMetrics;
  trend: string;
}

export const VolatilityHeatmap: React.FC<VolatilityHeatmapProps> = ({
  pairsData,
  selectedPair,
  onSelectPair,
  className = '',
}) => {
  const [sortBy, setSortBy] = useState<'volatility' | 'payout' | 'range'>('volatility');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute volatility metrics for all pairs
  const volatilityList: PairVolatilityItem[] = useMemo(() => {
    return pairsData.map((data) => {
      const config = PAIR_CONFIGS[data.pair];
      const metrics = calculateVolatilityMetrics(data.candles, config.decimals);
      return {
        pair: data.pair,
        displayName: data.displayName,
        currentPrice: data.currentPrice,
        decimals: config.decimals,
        payoutPercent: data.payoutPercent,
        metrics,
        trend: data.indicators.trend,
      };
    });
  }, [pairsData]);

  // Sort and filter list
  const sortedList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = volatilityList.filter((item) => {
      if (!q) return true;
      return (
        item.pair.toLowerCase().includes(q) ||
        item.displayName.toLowerCase().includes(q) ||
        `${item.payoutPercent}%`.includes(q)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'volatility') {
        return b.metrics.volatilityScore - a.metrics.volatilityScore;
      }
      if (sortBy === 'payout') {
        return b.payoutPercent - a.payoutPercent;
      }
      return b.metrics.range1M - a.metrics.range1M;
    });
  }, [volatilityList, sortBy, searchQuery]);

  // Identify most volatile / optimal pair for binary options
  const topActivePair = sortedList[0];

  // Helper for Heat intensity styling
  const getHeatStyles = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        gradient: 'from-rose-500 to-amber-500',
        badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
        label: 'ULTRA VOLATILITY',
      };
    }
    if (score >= 62) {
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        gradient: 'from-amber-500 to-yellow-500',
        badge: 'bg-amber-950/80 text-amber-300 border-amber-800',
        label: 'HIGH MOMENTUM',
      };
    }
    if (score >= 42) {
      return {
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        gradient: 'from-emerald-500 to-teal-500',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        label: 'BALANCED FLOW',
      };
    }
    return {
      bg: 'bg-neutral-800/40',
      border: 'border-neutral-700',
      text: 'text-neutral-400',
      gradient: 'from-neutral-600 to-neutral-500',
      badge: 'bg-neutral-900 text-neutral-400 border-neutral-800',
      label: 'LOW CHOPPY',
    };
  };

  return (
    <div className={`bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-5 space-y-5 ${className}`}>
      {/* Header and Sorting Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400/20" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Real-Time Volatility Heatmap</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                Live 1M / 5M ATR
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Evaluates candle range expansion and tick velocity to detect high-impulse markets for Quotex 1M execution.
            </p>
          </div>
        </div>

        {/* Controls: Search & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pairs..."
              className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500 w-32 sm:w-40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1 text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs font-medium">
            <span className="text-[10px] text-neutral-500 uppercase px-1.5 font-mono">Sort:</span>
            <button
              onClick={() => setSortBy('volatility')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortBy === 'volatility'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Volatility
            </button>
            <button
              onClick={() => setSortBy('payout')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortBy === 'payout'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Payout %
            </button>
            <button
              onClick={() => setSortBy('range')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortBy === 'range'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Range
            </button>
          </div>
        </div>
      </div>

      {/* Top Featured Callout: Most Active Market */}
      {topActivePair && (
        <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900/60 to-neutral-900/30 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
                  Current Prime Opportunity
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {topActivePair.payoutPercent}% PAYOUT
                </span>
              </div>
              <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                {topActivePair.pair} — {topActivePair.metrics.volatilityScore}% Volatility Score ({topActivePair.metrics.volatilityLevel})
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Superior price displacement prevents tie/draw expirations. Average 1M expansion:{' '}
                <strong className="text-neutral-200 font-mono">
                  {topActivePair.metrics.range1M.toFixed(topActivePair.decimals)}
                </strong>{' '}
                pts.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectPair(topActivePair.pair)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-md shadow-amber-950/40 shrink-0"
          >
            <span>Trade {topActivePair.pair}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Heatmap Matrix Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {sortedList.map((item) => {
          const isSelected = item.pair === selectedPair;
          const heat = getHeatStyles(item.metrics.volatilityScore);

          return (
            <div
              key={item.pair}
              onClick={() => onSelectPair(item.pair)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-neutral-900 border-amber-500/50 ring-1 ring-amber-500/30 shadow-lg shadow-neutral-950'
                  : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/90'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base">{item.pair}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${heat.badge}`}>
                    {heat.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mt-1 font-mono">
                  <span>{item.currentPrice.toFixed(item.decimals)}</span>
                  <span className="text-emerald-400 font-bold">{item.payoutPercent}% Return</span>
                </div>
              </div>

              {/* Volatility Intensity Gauge Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Activity Level</span>
                  <strong className={`font-bold ${heat.text}`}>
                    {item.metrics.volatilityScore}%
                  </strong>
                </div>
                <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${heat.gradient} transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(8, item.metrics.volatilityScore))}%` }}
                  />
                </div>
              </div>

              {/* Micro-Metrics Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-neutral-950/70 border border-neutral-800/70 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-neutral-500 block">1M Range</span>
                  <strong className="text-neutral-200">
                    {item.metrics.range1M.toFixed(item.decimals)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">ATR (14)</span>
                  <strong className="text-neutral-200">
                    {item.metrics.atr14.toFixed(item.decimals)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">15M Channel</span>
                  <strong className="text-neutral-300">
                    {item.metrics.range15M.toFixed(item.decimals)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">Tick Velocity</span>
                  <strong className={item.metrics.tickIntensity >= 70 ? 'text-amber-400' : 'text-neutral-300'}>
                    {item.metrics.tickIntensity}%
                  </strong>
                </div>
              </div>

              {/* Bottom Execution Status & Action */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/70 text-xs">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.metrics.binaryOptionsSuitability === 'OPTIMAL'
                        ? 'bg-emerald-400'
                        : item.metrics.binaryOptionsSuitability === 'GOOD'
                        ? 'bg-cyan-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>{item.metrics.binaryOptionsSuitability}</span>
                </span>

                <span className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  <span>{isSelected ? 'Loaded' : 'Switch'}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Strategy Guide for 60s Binary Options */}
      <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Quotex Volatility Strategy:</strong> Pairs with $\ge 65\%$ volatility yield wider candle bodies and definitive directional momentum, minimizing at-the-money (draw) risk on 1-minute expiries.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-300 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Ultra (80%+)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> High (62-79%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Balanced
          </span>
        </div>
      </div>
    </div>
  );
};
