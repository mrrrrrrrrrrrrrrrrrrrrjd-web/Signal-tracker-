import React, { useState, useMemo } from 'react';
import { CurrencyPair, PredictionSignal, SignalOutcome } from '../types/trading';
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock, Copy, Check, Filter } from 'lucide-react';

interface SignalHistoryTableProps {
  signals: PredictionSignal[];
}

export const SignalHistoryTable: React.FC<SignalHistoryTableProps> = ({ signals }) => {
  const [pairFilter, setPairFilter] = useState<string>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const availablePairs = useMemo(() => {
    const set = new Set<string>();
    signals.forEach((s) => set.add(s.pair));
    return Array.from(set).sort();
  }, [signals]);

  // Filter signals
  const filtered = signals.filter((s) => {
    if (pairFilter !== 'ALL' && s.pair !== pairFilter) return false;
    if (outcomeFilter === 'WIN' && s.outcome !== 'WIN_DIRECT' && s.outcome !== 'WIN_G1' && s.outcome !== 'WIN_G2') {
      return false;
    }
    if (outcomeFilter === 'DIRECT' && s.outcome !== 'WIN_DIRECT') return false;
    if (outcomeFilter === 'G1' && s.outcome !== 'WIN_G1') return false;
    if (outcomeFilter === 'LOSS' && s.outcome !== 'LOSS') return false;
    return true;
  });

  // Calculate stats
  const completed = signals.filter((s) => s.outcome !== 'PENDING');
  const directWins = completed.filter((s) => s.outcome === 'WIN_DIRECT').length;
  const g1Wins = completed.filter((s) => s.outcome === 'WIN_G1').length;
  const losses = completed.filter((s) => s.outcome === 'LOSS').length;
  const totalCompleted = completed.length;
  const overallWinRate = totalCompleted > 0 ? (((directWins + g1Wins) / totalCompleted) * 100).toFixed(1) : '0.0';
  const directWinRate = totalCompleted > 0 ? ((directWins / totalCompleted) * 100).toFixed(1) : '0.0';

  const copyVIPList = () => {
    const lines = filtered.slice(0, 15).map((s) => {
      const d = new Date(s.targetCandleTime);
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const outcomeIcon =
        s.outcome === 'WIN_DIRECT'
          ? '✅ DIRECT WIN'
          : s.outcome === 'WIN_G1'
          ? '✅ G1 WIN'
          : s.outcome === 'LOSS'
          ? '❌ LOSS'
          : '⏳ PENDING';
      return `${s.pair} - 1M - ${s.direction} - ${timeStr} - ${s.probability}% - [${outcomeIcon}]`;
    });

    const header = `📊 QUOTEX 1M SIGNALS AUDIT (DIRECT + G1)\nOverall Accuracy: ${overallWinRate}% (Direct: ${directWinRate}%)\n\n`;
    navigator.clipboard.writeText(header + lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Top Bar with Stats and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Signal Execution & Outcome Audit Log</h2>
          <p className="text-xs text-neutral-400">
            Real-time verification of next-candle predictions (G0 Direct Entry & Step G1 Recovery).
          </p>
        </div>

        {/* Global Performance Summary KPIs */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs flex-wrap">
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-center">
            <span className="text-[10px] text-neutral-500 uppercase block">Accuracy (G0+G1)</span>
            <strong className="text-emerald-400 font-bold text-sm">{overallWinRate}%</strong>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-center">
            <span className="text-[10px] text-neutral-500 uppercase block">Direct Wins</span>
            <strong className="text-white font-bold text-sm">{directWins}</strong>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-center">
            <span className="text-[10px] text-neutral-500 uppercase block">G1 Recovery</span>
            <strong className="text-cyan-400 font-bold text-sm">{g1Wins}</strong>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-center">
            <span className="text-[10px] text-neutral-500 uppercase block">Losses</span>
            <strong className="text-rose-400 font-bold text-sm">{losses}</strong>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-center">
            <span className="text-[10px] text-neutral-500 uppercase block">Total Verified</span>
            <strong className="text-neutral-300 font-bold text-sm">{totalCompleted}</strong>
          </div>
        </div>
      </div>

      {/* Filter Row & Copy Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800 text-xs">
        <div className="flex items-center gap-2">
          {/* Pair filter selector */}
          <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Asset:</span>
            <select
              value={pairFilter}
              onChange={(e) => setPairFilter(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-neutral-900 text-white">All Assets ({signals.length})</option>
              {availablePairs.map((p) => (
                <option key={p} value={p} className="bg-neutral-900 text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome filter */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            {[
              { id: 'ALL', label: 'All Results' },
              { id: 'WIN', label: 'All Wins' },
              { id: 'DIRECT', label: 'Direct' },
              { id: 'G1', label: 'Step G1' },
              { id: 'LOSS', label: 'Losses' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setOutcomeFilter(f.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  outcomeFilter === f.id
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Copy VIP List for Telegram */}
        <button
          onClick={copyVIPList}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold border border-neutral-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Audit Copied!' : 'Export VIP Log'}</span>
        </button>
      </div>

      {/* Signals Table */}
      <div className="overflow-x-auto border border-neutral-800 rounded-lg">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
            <tr>
              <th className="py-2.5 px-3">Candle Time</th>
              <th className="py-2.5 px-3">Pair</th>
              <th className="py-2.5 px-3">Direction</th>
              <th className="py-2.5 px-3">Accuracy</th>
              <th className="py-2.5 px-3">Entry Price</th>
              <th className="py-2.5 px-3">Quotex Payout</th>
              <th className="py-2.5 px-3 text-right">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 bg-neutral-950">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500 font-sans">
                  No signals found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const isCall = s.direction === 'CALL';
                const d = new Date(s.targetCandleTime);
                const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

                return (
                  <tr key={s.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-2.5 px-3 text-neutral-300 font-mono">{timeStr}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{s.pair}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isCall ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCall ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {s.direction}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-200">{s.probability}%</td>
                    <td className="py-2.5 px-3 text-neutral-400">{s.entryPrice.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{s.payoutPercent}%</td>
                    <td className="py-2.5 px-3 text-right">
                      {s.outcome === 'WIN_DIRECT' && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          DIRECT WIN
                        </span>
                      )}
                      {s.outcome === 'WIN_G1' && (
                        <span className="inline-flex items-center gap-1 text-cyan-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          G1 WIN
                        </span>
                      )}
                      {s.outcome === 'WIN_G2' && (
                        <span className="inline-flex items-center gap-1 text-indigo-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          G2 WIN
                        </span>
                      )}
                      {s.outcome === 'LOSS' && (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          LOSS
                        </span>
                      )}
                      {s.outcome === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-neutral-400 font-bold animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          PENDING 1M
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
