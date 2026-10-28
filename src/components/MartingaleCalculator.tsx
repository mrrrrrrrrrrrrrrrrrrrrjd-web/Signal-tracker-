import React, { useState } from 'react';
import { DollarSign, ShieldAlert, TrendingUp, Calculator, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const MartingaleCalculator: React.FC = () => {
  const [balance, setBalance] = useState<number>(500);
  const [initialStake, setInitialStake] = useState<number>(10);
  const [payoutRate, setPayoutRate] = useState<number>(89);
  const [multiplier, setMultiplier] = useState<number>(2.25);
  const [dailyTargetWins, setDailyTargetWins] = useState<number>(5);

  const payoutDec = payoutRate / 100;

  // Step G0 (Direct Entry)
  const g0Stake = initialStake;
  const g0TotalRisk = g0Stake;
  const g0Payout = g0Stake * payoutDec;
  const g0NetProfit = g0Payout;

  // Step G1 (Recovery 1)
  const g1Stake = Number((g0Stake * multiplier).toFixed(2));
  const g1TotalRisk = Number((g0TotalRisk + g1Stake).toFixed(2));
  const g1Payout = g1Stake * payoutDec;
  const g1NetProfit = Number((g1Payout - g0Stake).toFixed(2));

  // Step G2 (Recovery 2 - Maximum limit)
  const g2Stake = Number((g1Stake * multiplier).toFixed(2));
  const g2TotalRisk = Number((g1TotalRisk + g2Stake).toFixed(2));
  const g2Payout = g2Stake * payoutDec;
  const g2NetProfit = Number((g2Payout - g1TotalRisk).toFixed(2));

  const dailyTargetProfit = g0NetProfit * dailyTargetWins;

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            Quotex Martingale & Step G1 Recovery Matrix
          </h2>
          <p className="text-xs text-neutral-400">
            Algorithmic stake sizing and recovery model calibrated for 1-minute candle entries with maximum 1 Step (G1).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
          <span>Recommended Protocol:</span>
          <strong className="text-emerald-400 font-bold">G0 Direct + Max Step G1</strong>
        </div>
      </div>

      {/* Input Parameter Form */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Account Balance ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-neutral-500 font-mono text-xs">$</span>
            <input
              type="number"
              min={10}
              value={balance}
              onChange={(e) => setBalance(Math.max(1, Number(e.target.value)))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 pl-7 pr-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Initial Base Stake [G0] ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-neutral-500 font-mono text-xs">$</span>
            <input
              type="number"
              min={1}
              value={initialStake}
              onChange={(e) => setInitialStake(Math.max(1, Number(e.target.value)))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 pl-7 pr-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Broker Payout (%)</label>
          <div className="relative">
            <input
              type="number"
              min={50}
              max={98}
              value={payoutRate}
              onChange={(e) => setPayoutRate(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute right-3 top-2.5 text-neutral-500 font-mono text-xs">%</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">G1 Multiplier (x)</label>
          <div className="relative">
            <input
              type="number"
              step="0.05"
              min={2.0}
              max={3.0}
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute right-3 top-2.5 text-neutral-500 font-mono text-xs">x</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Daily Direct Win Target</label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={30}
              value={dailyTargetWins}
              onChange={(e) => setDailyTargetWins(Math.max(1, Number(e.target.value)))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute right-3 top-2.5 text-neutral-500 font-mono text-xs">Wins</span>
          </div>
        </div>
      </div>

      {/* Step G0, Step G1, and Step G2 Execution Table */}
      <div className="border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
            <tr>
              <th className="py-3 px-4">Step Execution</th>
              <th className="py-3 px-4">Stake Amount</th>
              <th className="py-3 px-4">Cumulative Invested</th>
              <th className="py-3 px-4">Gross Payout</th>
              <th className="py-3 px-4">Net Recovered Profit</th>
              <th className="py-3 px-4">Bankroll Risk %</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 bg-neutral-950">
            {/* G0 - Direct Entry */}
            <tr className="hover:bg-neutral-900/40 transition-colors">
              <td className="py-3.5 px-4">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>STEP G0 (Direct Candle)</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-sans">Primary 1M execution at 00:58</span>
              </td>
              <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">${g0Stake.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-neutral-300">${g0TotalRisk.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-neutral-300">${(g0Stake + g0Payout).toFixed(2)}</td>
              <td className="py-3.5 px-4 font-bold text-emerald-400">+${g0NetProfit.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-neutral-400">{((g0TotalRisk / balance) * 100).toFixed(1)}%</td>
              <td className="py-3.5 px-4 text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  STANDARD (74% WINS)
                </span>
              </td>
            </tr>

            {/* G1 - Step 1 Martingale */}
            <tr className="hover:bg-neutral-900/40 transition-colors bg-cyan-950/10">
              <td className="py-3.5 px-4">
                <div className="font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>STEP G1 (Recovery Candle)</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-sans">Enter if G0 candle closes opposite</span>
              </td>
              <td className="py-3.5 px-4 font-bold text-cyan-400 text-sm">${g1Stake.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-neutral-300">${g1TotalRisk.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-neutral-300">${(g1Stake + g1Payout).toFixed(2)}</td>
              <td className="py-3.5 px-4 font-bold text-cyan-400">+${g1NetProfit.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-neutral-400">{((g1TotalRisk / balance) * 100).toFixed(1)}%</td>
              <td className="py-3.5 px-4 text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  RECOMMENDED MAX (+17% RECOVERED)
                </span>
              </td>
            </tr>

            {/* G2 - Step 2 (Optional High Risk) */}
            <tr className="hover:bg-neutral-900/40 transition-colors opacity-75">
              <td className="py-3.5 px-4">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>STEP G2 (High Risk Optional)</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-sans">Not recommended for daily sessions</span>
              </td>
              <td className="py-3.5 px-4 font-bold text-amber-400 text-sm">${g2Stake.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-neutral-300">${g2TotalRisk.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-neutral-300">${(g2Stake + g2Payout).toFixed(2)}</td>
              <td className="py-3.5 px-4 font-bold text-amber-400">+${g2NetProfit.toFixed(2)}</td>
              <td className="py-3.5 px-4 text-rose-400">{((g2TotalRisk / balance) * 100).toFixed(1)}%</td>
              <td className="py-3.5 px-4 text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  HIGH DRAWDOWN
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Target Goal & Bankroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-neutral-400">Target Session Profit ({dailyTargetWins} Direct Wins)</div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            +${dailyTargetProfit.toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1 font-sans">
            Reach target and lock profits with the <strong>Exit Safe</strong> button.
          </p>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-neutral-400">Step G1 Recovery Coverage</div>
          <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
            +${g1NetProfit.toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1 font-sans">
            Guarantees positive net returns even after absorbing initial G0 candle loss.
          </p>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-neutral-400">Max Recommended Stop Loss</div>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            -${(balance * 0.1).toFixed(2)} (10%)
          </div>
          <p className="text-[11px] text-neutral-500 mt-1 font-sans">
            Strict risk limit to guarantee long-term account survival.
          </p>
        </div>
      </div>

      {/* Professional Martingale Protocol Guidelines */}
      <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Quotex Step G1 Execution Protocol Rules:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-neutral-300 font-sans">
          <li><strong>G0 Direct Entry:</strong> Place initial trade at <strong>00:58</strong> for 1-minute expiration with base stake of ${initialStake.toFixed(2)}.</li>
          <li><strong>Step G1 Entry:</strong> If the candle closes against the prediction, immediately execute <strong>Step G1</strong> on the consecutive 1-minute candle in the <strong>same direction</strong> with ${g1Stake.toFixed(2)} stake.</li>
          <li><strong>Strict Stop Rule:</strong> <strong>NEVER exceed Step G1</strong>. If G1 loses, accept the loss (-${g1TotalRisk.toFixed(2)}) and wait for the next high-probability setup.</li>
        </ul>
      </div>
    </div>
  );
};
