import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CurrencyPair, PairMarketData, AssetCategory } from '../types/trading';
import { PAIR_CONFIGS, ALL_QUOTEX_PAIRS, BasePairConfig } from '../utils/marketSimulator';
import { Search, X, Sparkles, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Flame, Filter, SlidersHorizontal, Check, Zap } from 'lucide-react';

interface AssetSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPair: CurrencyPair;
  onSelectPair: (pair: CurrencyPair) => void;
  pairsData: PairMarketData[];
}

export const AssetSearchPanel: React.FC<AssetSearchPanelProps> = ({
  isOpen,
  onClose,
  selectedPair,
  onSelectPair,
  pairsData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AssetCategory>('ALL');
  const [onlyHighPayout, setOnlyHighPayout] = useState(false);
  const [onlyActiveSignals, setOnlyActiveSignals] = useState(false);
  const [sortBy, setSortBy] = useState<'payout' | 'accuracy' | 'volatility' | 'name'>('payout');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Map pairsData to quick lookup
  const pairDataMap = useMemo(() => {
    const map = new Map<CurrencyPair, PairMarketData>();
    for (const data of pairsData) {
      map.set(data.pair, data);
    }
    return map;
  }, [pairsData]);

  // Filter and sort items
  const filteredPairs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ALL_QUOTEX_PAIRS.filter((pair) => {
      const config = PAIR_CONFIGS[pair];
      const data = pairDataMap.get(pair);

      // Category filter
      if (selectedCategory !== 'ALL' && config.category !== selectedCategory) {
        return false;
      }

      // High payout filter (>=90%)
      if (onlyHighPayout && config.payoutPercent < 90) {
        return false;
      }

      // Active signals filter
      if (onlyActiveSignals && !data?.activeSignal) {
        return false;
      }

      // Text Search query matching
      if (query) {
        const matchesPair = pair.toLowerCase().includes(query);
        const matchesName = config.displayName.toLowerCase().includes(query);
        const matchesDesc = config.countryOrAsset.toLowerCase().includes(query);
        const matchesCategory = config.category.toLowerCase().includes(query);
        const matchesPayout = `${config.payoutPercent}%`.includes(query);

        if (!matchesPair && !matchesName && !matchesDesc && !matchesCategory && !matchesPayout) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const configA = PAIR_CONFIGS[a];
      const configB = PAIR_CONFIGS[b];
      const dataA = pairDataMap.get(a);
      const dataB = pairDataMap.get(b);

      if (sortBy === 'payout') {
        return configB.payoutPercent - configA.payoutPercent;
      }
      if (sortBy === 'accuracy') {
        return (dataB?.overallAccuracy || 0) - (dataA?.overallAccuracy || 0);
      }
      if (sortBy === 'volatility') {
        return configB.volatility - configA.volatility;
      }
      return a.localeCompare(b);
    });
  }, [searchQuery, selectedCategory, onlyHighPayout, onlyActiveSignals, sortBy, pairDataMap]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      ALL: ALL_QUOTEX_PAIRS.length,
      OTC: 0,
      FOREX: 0,
      CROSS: 0,
      CRYPTO: 0,
      COMMODITY: 0,
    };
    for (const pair of ALL_QUOTEX_PAIRS) {
      const cat = PAIR_CONFIGS[pair].category;
      if (cat in counts) {
        counts[cat]++;
      }
    }
    return counts;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header / Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/60 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Quotex Assets & Currency Directory
                  <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ALL_QUOTEX_PAIRS.length} Active Assets
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Search, filter by payout yields, and switch 1-minute real-time predictive tracking.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Quotex pairs (e.g. INR, BRL, EUR, Gold, 94%)..."
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="absolute right-3 top-3 text-[11px] font-mono text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
                ESC
              </span>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              All Assets ({categoryCounts.ALL})
            </button>
            <button
              onClick={() => setSelectedCategory('OTC')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                selectedCategory === 'OTC'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Quotex OTC 24/7 ({categoryCounts.OTC})
            </button>
            <button
              onClick={() => setSelectedCategory('FOREX')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === 'FOREX'
                  ? 'bg-neutral-800 text-white border-neutral-600 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              Forex Majors ({categoryCounts.FOREX})
            </button>
            <button
              onClick={() => setSelectedCategory('CROSS')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === 'CROSS'
                  ? 'bg-neutral-800 text-white border-neutral-600 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              Cross Pairs ({categoryCounts.CROSS})
            </button>
            <button
              onClick={() => setSelectedCategory('CRYPTO')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === 'CRYPTO'
                  ? 'bg-neutral-800 text-white border-neutral-600 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              Crypto & Metals ({categoryCounts.CRYPTO + categoryCounts.COMMODITY})
            </button>
          </div>

          {/* Quick Filters & Sorting Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnlyHighPayout(!onlyHighPayout)}
                className={`px-2.5 py-1 rounded-md border font-medium transition-colors flex items-center gap-1.5 ${
                  onlyHighPayout
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>≥ 90% High Payout</span>
              </button>

              <button
                onClick={() => setOnlyActiveSignals(!onlyActiveSignals)}
                className={`px-2.5 py-1 rounded-md border font-medium transition-colors flex items-center gap-1.5 ${
                  onlyActiveSignals
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Signals Only</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-900 border border-neutral-800 rounded-md px-2 py-1 text-neutral-200 text-xs focus:outline-none focus:border-neutral-600"
              >
                <option value="payout">Highest Payout %</option>
                <option value="accuracy">Historical Win Rate</option>
                <option value="volatility">Market Volatility</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assets Results Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredPairs.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="text-sm">No Quotex assets found matching &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setOnlyHighPayout(false);
                  setOnlyActiveSignals(false);
                }}
                className="text-xs text-emerald-400 underline hover:text-emerald-300"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPairs.map((pair) => {
                const config = PAIR_CONFIGS[pair];
                const data = pairDataMap.get(pair);
                const isSelected = pair === selectedPair;
                const activeSig = data?.activeSignal;
                const isCall = activeSig?.direction === 'CALL';
                const isPut = activeSig?.direction === 'PUT';

                return (
                  <div
                    key={pair}
                    onClick={() => {
                      onSelectPair(pair);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-900/90 border-emerald-500 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/40'
                        : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                    }`}
                  >
                    {/* Top Row: Flag, Pair Name & Payout Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl leading-none" role="img" aria-label={pair}>
                          {config.flag}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-mono">{pair}</span>
                            {isSelected && (
                              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 block truncate max-w-[200px]">
                            {config.countryOrAsset}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {config.payoutPercent}% PAYOUT
                        </span>
                        {config.category === 'OTC' && (
                          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Quotex OTC 24/7
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Live Price & Signal Status */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/60 font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">CURRENT PRICE</span>
                        <strong className="text-white text-sm">
                          {data ? data.currentPrice.toFixed(config.decimals) : config.basePrice.toFixed(config.decimals)}
                        </strong>
                      </div>

                      {/* Active Signal / Prediction Tag */}
                      <div className="text-right">
                        {activeSig ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                                isCall
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {isCall ? (
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-rose-400" />
                              )}
                              <span>1M {activeSig.direction} {activeSig.probability}%</span>
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full animate-ping ${
                                isCall ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                            Scanning 1M...
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          Win Rate: <strong className="text-neutral-200">{data?.overallAccuracy || 91.2}%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPair(pair);
                        onClose();
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      }`}
                    >
                      <span>{isSelected ? 'Currently Selected' : 'Trade on Quotex'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Quotex High-Yield OTC & Majors 24/7 Real-Time Confluence Engine</span>
          </div>
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-mono text-[10px]">/</kbd> anytime to search</span>
        </div>
      </div>
    </div>
  );
};
