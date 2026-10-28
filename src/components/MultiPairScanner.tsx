import React, { useState, useMemo } from 'react';
import { CurrencyPair, PairMarketData, SignalDirection, AssetCategory } from '../types/trading';
import { PAIR_CONFIGS } from '../utils/marketSimulator';
import { TrendingUp, TrendingDown, Clock, Zap, ArrowRight, Play, Search, Filter, Flame, Check } from 'lucide-react';

interface MultiPairScannerProps {
  pairsData: PairMarketData[];
  selectedPair: CurrencyPair;
  onSelectPair: (pair: CurrencyPair) => void;
  secondsRemaining: number;
  onTestSignal: (pair: CurrencyPair, dir?: SignalDirection) => void;
  onOpenSearchModal?: () => void;
}

export const MultiPairScanner: React.FC<MultiPairScannerProps> = ({
  pairsData,
  selectedPair,
  onSelectPair,
  secondsRemaining,
  onTestSignal,
  onOpenSearchModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AssetCategory>('ALL');
  const [highPayoutOnly, setHighPayoutOnly] = useState(false);
  const [activeSignalOnly, setActiveSignalOnly] = useState(false);

  // Filter pairs
  const filteredPairs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return pairsData.filter((data) => {
      const config = PAIR_CONFIGS[data.pair];
      if (!config) return false;

      if (categoryFilter !== 'ALL' && config.category !== categoryFilter) {
        return false;
      }

      if (highPayoutOnly && config.payoutPercent < 90) {
        return false;
      }

      if (activeSignalOnly && !data.activeSignal) {
        return false;
      }

      if (q) {
        const matchPair = data.pair.toLowerCase().includes(q);
        const matchName = config.displayName.toLowerCase().includes(q);
        const matchCountry = config.countryOrAsset.toLowerCase().includes(q);
        if (!matchPair && !matchName && !matchCountry) return false;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize active signals first, then payout %
      if (a.activeSignal && !b.activeSignal) return -1;
      if (!a.activeSignal && b.activeSignal) return 1;
      return b.payoutPercent - a.payoutPercent;
    });
  }, [pairsData, searchQuery, categoryFilter, highPayoutOnly, activeSignalOnly]);

  const activeSignalsCount = useMemo(() => {
    return pairsData.filter((p) => !!p.activeSignal).length;
  }, [pairsData]);

  return (
    <div className="space-y-5">
      {/* Top Header & Live Candle Expiry Clock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Quotex Confluence Radar Scanner</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {pairsData.length} Monitored Assets
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Real-time algorithmic scanner actively computing next 1-minute candle CALL / PUT predictions across all Quotex pairs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSignalsCount > 0 && (
            <div className="flex items-center gap-1.5 font-mono text-xs bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{activeSignalsCount} Active 1M Signals</span>
            </div>
          )}

          <div className="flex items-center gap-2 font-mono text-xs bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>1M Expiry:</span>
            <strong
              className={`font-bold ${
                secondsRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              00:{String(secondsRemaining).padStart(2, '0')}
            </strong>
          </div>
        </div>
      </div>

      {/* Embedded Search & Filtering Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter scanner pairs (e.g. INR, BRL, EUR, Gold, 94%)..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Payout / Signal Filter buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setHighPayoutOnly(!highPayoutOnly)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                highPayoutOnly
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>≥90% Payout</span>
            </button>

            <button
              onClick={() => setActiveSignalOnly(!activeSignalOnly)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeSignalOnly
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Signals Only</span>
            </button>

            {onOpenSearchModal && (
              <button
                onClick={onOpenSearchModal}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1"
                title="Open full Quotex directory"
              >
                <span>All Assets</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              categoryFilter === 'ALL'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Categories ({pairsData.length})
          </button>
          <button
            onClick={() => setCategoryFilter('OTC')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
              categoryFilter === 'OTC'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Quotex OTC (24/7)
          </button>
          <button
            onClick={() => setCategoryFilter('FOREX')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              categoryFilter === 'FOREX'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Forex Majors
          </button>
          <button
            onClick={() => setCategoryFilter('CROSS')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              categoryFilter === 'CROSS'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Cross Pairs
          </button>
          <button
            onClick={() => setCategoryFilter('CRYPTO')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              categoryFilter === 'CRYPTO'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Crypto & Gold
          </button>
        </div>
      </div>

      {/* Scanner Cards Grid */}
      {filteredPairs.length === 0 ? (
        <div className="py-12 text-center text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800">
          <Search className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
          <p className="text-sm">No pairs match the active filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('ALL');
              setHighPayoutOnly(false);
              setActiveSignalOnly(false);
            }}
            className="text-xs text-emerald-400 underline mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPairs.map((data) => {
            const config = PAIR_CONFIGS[data.pair];
            const isSelected = data.pair === selectedPair;
            const activeSig = data.activeSignal;
            const isCall = activeSig?.direction === 'CALL';
            const isPut = activeSig?.direction === 'PUT';
            const isBullTrend = data.indicators.trend.includes('BULL');

            return (
              <div
                key={data.pair}
                onClick={() => onSelectPair(data.pair)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-neutral-900/95 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                    : 'bg-neutral-950/80 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                {/* Header: Flag, Pair Name, Payout & Price */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{config?.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white font-mono">{data.pair}</span>
                          {isSelected && (
                            <span className="text-[10px] text-emerald-400 flex items-center font-bold">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block truncate max-w-[150px]">
                          {config?.countryOrAsset}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                        {data.payoutPercent}% PAYOUT
                      </span>
                      {config?.category === 'OTC' && (
                        <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          OTC 24/7
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Trend Bar */}
                  <div className="flex items-center justify-between text-xs pt-2.5 mt-2 border-t border-neutral-800/60 font-mono">
                    <span className="text-white font-bold text-sm">
                      {data.currentPrice.toFixed(config?.decimals || 4)}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[11px] font-semibold ${
                        isBullTrend ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isBullTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{data.indicators.trend.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                {/* Algorithmic Technical Snapshot */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/80">
                  <div>
                    <span className="text-neutral-500 block">RSI (14)</span>
                    <span
                      className={`font-bold ${
                        data.indicators.rsi14 >= 70
                          ? 'text-rose-400'
                          : data.indicators.rsi14 <= 30
                          ? 'text-emerald-400'
                          : 'text-neutral-300'
                      }`}
                    >
                      {data.indicators.rsi14.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">STOCH</span>
                    <span className="text-neutral-300 font-bold">
                      {data.indicators.stochK.toFixed(0)}/{data.indicators.stochD.toFixed(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">ACCURACY</span>
                    <span className="text-emerald-400 font-bold">{data.overallAccuracy}%</span>
                  </div>
                </div>

                {/* 1-Minute Target Candle Prediction Banner */}
                {activeSig ? (
                  <div
                    className={`p-2.5 rounded-lg border flex items-center justify-between font-mono animate-pulse ${
                      isCall
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCall ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-bold">
                            NEXT 1M: {activeSig.direction}
                          </strong>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-black/40 font-bold">
                            {activeSig.probability}%
                          </span>
                        </div>
                        <span className="text-[10px] opacity-80 block">
                          Execute at 00:58 · Strategy: Direct + G1
                        </span>
                      </div>
                    </div>

                    <span className="w-2.5 h-2.5 rounded-full bg-current" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Computing 1M Confluence...
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      T-{secondsRemaining}s
                    </span>
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPair(data.pair);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                      isSelected
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    }`}
                  >
                    <span>{isSelected ? 'Viewing in Terminal' : 'Open Terminal'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTestSignal(data.pair);
                    }}
                    title="Force trigger test signal on this pair"
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
