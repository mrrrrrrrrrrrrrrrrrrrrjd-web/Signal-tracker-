import React, { useState } from 'react';
import { DollarSign, ShieldAlert, TrendingUp, Calculator, AlertOctagon } from 'lucide-react';

export const MartingaleCalculator: React.FC = () => {
  const [balance, setBalance] = useState<number>(500);
  const [initialStake, setInitialStake] = useState<number>(10);
  const [payoutRate, setPayoutRate] = useState<number>(89);
  const [stopLossPercent, setStopLossPercent] = useState<number>(15);

  const payoutDec = payoutRate / 100;
  const initialProfit = initialStake * payoutDec;

  // G1 Stake to recover initial stake + yield initial target profit
  const g1Stake = Number(((initialStake + initialProfit) / payoutDec).toFixed(2));
  const g1TotalInvested = Number((initialStake + g1Stake).toFixed(2));
  const g1NetProfit = Number((g1Stake * payoutDec - initialStake).toFixed(2));

  // G2 Stake to recover (initial + G1) + yield initial target profit
  const g2Stake = Number(((g1TotalInvested + initialProfit) / payoutDec).toFixed(2));
  const g2TotalInvested = Number((g1TotalInvested + g2Stake).toFixed(2));
  const g2NetProfit = Number((g2Stake * payoutDec - g1TotalInvested).toFixed(2));

  // Risk of Ruin & Max consecutive losses permitted
  const maxLossAmount = (balance * stopLossPercent) / 100;
  const canAffordG1 = balance >= g1TotalInvested;
  const canAffordG2 = balance >= g2TotalInvested;

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            Quotex Martingale & Capital Recovery Matrix
          </h2>
          <p className="text-xs text-neutral-400">
            Formulated to preserve capital and guarantee net profit on win at Direct (G0), G1, or G2.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
          <span>Max Recommended MTG:</span>
          <strong className="text-amber-400 font-bold">1 Step (G1 Only)</strong>
        </div>
      </div>

      {/* Input Parameter Form */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Initial Stake G0 ($)</label>
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
          <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Daily Stop Loss (%)</label>
          <div className="relative">
            <input
              type="number"
              min={5}
              max={50}
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            />
            <span className="absolute right-3 top-2.5 text-neutral-500 font-mono text-xs">%</span>
          </div>
        </div>
      </div>

      {/* Stepped Execution Stakes Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 0 - Direct Entry */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 font-mono">G0: DIRECT ENTRY</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              74% WIN RATE
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white my-2">${initialStake.toFixed(2)}</div>
          <div className="space-y-1.5 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-800">
            <div className="flex justify-between">
              <span>Return on Win:</span>
              <strong className="text-emerald-400">+${initialProfit.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Risk % of Bankroll:</span>
              <span className="text-neutral-300">{((initialStake / balance) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Status:</span>
              <span className="text-emerald-400">Low Risk</span>
            </div>
          </div>
        </div>

        {/* Step 1 - Martingale 1 (G1) */}
        <div className="bg-neutral-900/80 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 font-mono">G1: RECOVERY STEP 1</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
              91% CONFLUENCE
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 my-2">${g1Stake.toFixed(2)}</div>
          <div className="space-y-1.5 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-800">
            <div className="flex justify-between">
              <span>Net Profit if Won:</span>
              <strong className="text-emerald-400">+${g1NetProfit.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Capital at Risk:</span>
              <span className="text-neutral-200">${g1TotalInvested.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bankroll Affordability:</span>
              <span className={canAffordG1 ? 'text-emerald-400' : 'text-rose-400'}>
                {canAffordG1 ? 'Safe (Available)' : 'Insufficient Capital'}
              </span>
            </div>
          </div>
        </div>

        {/* Step 2 - Martingale 2 (G2 - Extreme) */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 opacity-90">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 font-mono">G2: RECOVERY STEP 2 (HIGH RISK)</span>
            <span className="text-[10px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
              MAX PROTECTION
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-300 my-2">${g2Stake.toFixed(2)}</div>
          <div className="space-y-1.5 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-800">
            <div className="flex justify-between">
              <span>Net Profit if Won:</span>
              <strong className="text-emerald-400">+${g2NetProfit.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Cumulative Risk:</span>
              <span className="text-rose-400">${g2TotalInvested.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bankroll Impact:</span>
              <span className={canAffordG2 ? 'text-amber-400' : 'text-rose-400'}>
                {((g2TotalInvested / balance) * 100).toFixed(1)}% of Balance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Quotex Rule Warnings */}
      <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Quotex Professional Risk Management Rules:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-neutral-300 font-sans">
          <li>Never trade Martingale beyond <strong>G1</strong> on standard accounts. If G1 closes in a loss, accept the loss and wait for the next high-confidence signal.</li>
          <li>Stop trading immediately if daily drawdown reaches <strong>${maxLossAmount.toFixed(2)} ({stopLossPercent}%)</strong>.</li>
          <li>On Quotex, enter the 1M trade at <strong>00:58</strong> to prevent 1-2 second execution delays.</li>
        </ul>
      </div>
    </div>
  );
};
