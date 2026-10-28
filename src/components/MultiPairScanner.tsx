import React from 'react';
import { CurrencyPair, PairMarketData, SignalDirection } from '../types/trading';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Zap, ArrowRight, Play } from 'lucide-react';

interface MultiPairScannerProps {
  pairsData: PairMarketData[];
  selectedPair: CurrencyPair;
  onSelectPair: (pair: CurrencyPair) => void;
  secondsRemaining: number;
  onTestSignal: (pair: CurrencyPair, dir?: SignalDirection) => void;
}

export const MultiPairScanner: React.FC<MultiPairScannerProps> = ({
  pairsData,
  selectedPair,
  onSelectPair,
  secondsRemaining,
  onTestSignal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">4-Pair Quotex Confluence Radar</h2>
          <p className="text-xs text-neutral-400">
            Real-time algorithmic scanner actively computing next 1-minute candle CALL / PUT predictions across all pairs.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-300">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span>Synchronized 1M Expiry:</span>
          <strong
            className={`font-bold ${
              secondsRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            00:{String(secondsRemaining).padStart(2, '0')}
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pairsData.map((data) => {
          const isSelected = data.pair === selectedPair;
          const activeSig = data.activeSignal;
          const isCall = activeSig?.direction === 'CALL';
          const isPut = activeSig?.direction === 'PUT';
          const isBullTrend = data.indicators.trend.includes('BULL');

          return (
            <div
              key={data.pair}
              onClick={() => onSelectPair(data.pair)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-neutral-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'bg-neutral-950/80 border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-900/40'
              }`}
            >
              {/* Header: Pair Name, Payout & Price */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{data.pair}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                      {data.payoutPercent}% PAYOUT
                    </span>
                    {data.pair === 'USD/BRL' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        OTC HIGH VOL
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 mt-0.5 block">{data.displayName}</span>
                </div>

                <div className="text-right">
                  <div className="text-base font-mono font-bold text-white">
                    {data.currentPrice.toFixed(data.pair === 'USD/JPY' ? 3 : data.pair === 'USD/BRL' ? 4 : 5)}
                  </div>
                  <span
                    className={`text-[11px] font-mono flex items-center justify-end gap-1 ${
                      isBullTrend ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isBullTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {data.indicators.trend.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Middle Section: Active Signal or Indicator Confluence Gauge */}
              <div className="my-3.5 p-3 rounded-lg bg-neutral-900/70 border border-neutral-800">
                {activeSig ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                          isCall ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      >
                        {isCall ? (
                          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <TrendingDown className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black tracking-wide ${
                              isCall ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            NEXT CANDLE: {activeSig.direction}
                          </span>
                          <span className="text-xs font-mono font-bold text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                            {activeSig.probability}% CONF
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          Execute at 00:58 · Expiry: 1 Min · Rec: Direct + G1
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-neutral-400 block text-[10px]">T-MINUS</span>
                      <strong
                        className={`font-bold ${
                          secondsRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'
                        }`}
                      >
                        00:{String(secondsRemaining).padStart(2, '0')}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400">
                      <div>
                        RSI: <strong className="text-neutral-200">{data.indicators.rsi14.toFixed(1)}</strong>
                      </div>
                      <div>
                        Stoch: <strong className="text-neutral-200">{data.indicators.stochK.toFixed(1)}</strong>
                      </div>
                      <div className="truncate max-w-[130px] text-neutral-300">
                        {data.indicators.pattern}
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">Scanning edge...</span>
                  </div>
                )}
              </div>

              {/* Bottom: Accuracy Metrics & Quick Select Action */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
                  <span>
                    Acc: <strong className="text-emerald-400">{data.overallAccuracy}%</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Direct: <strong className="text-white">{data.directWinRate}%</strong>
                  </span>
                  <span>·</span>
                  <span>
                    G1: <strong className="text-neutral-300">{data.g1WinRate}%</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTestSignal(data.pair);
                    }}
                    className="p-1 text-neutral-400 hover:text-emerald-400 transition-colors"
                    title="Send test signal for this pair"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <span>{isSelected ? 'Active Chart' : 'Load Terminal'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
