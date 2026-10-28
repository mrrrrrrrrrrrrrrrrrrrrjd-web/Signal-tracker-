import React, { useState } from 'react';
import { CurrencyPair, PredictionSignal, SignalDirection } from '../types/trading';
import { TrendingUp, TrendingDown, Clock, Zap, Copy, Check, AlertCircle, Play, ShieldAlert } from 'lucide-react';

interface SignalAlertBannerProps {
  pair: CurrencyPair;
  displayName: string;
  payoutPercent: number;
  currentPrice: number;
  decimals: number;
  activeSignal: PredictionSignal | null;
  secondsRemaining: number;
  onTestSignal: (pair: CurrencyPair, forcedDirection?: SignalDirection) => void;
  isSafeMode?: boolean;
  onOpenSafeExit?: () => void;
}

export const SignalAlertBanner: React.FC<SignalAlertBannerProps> = ({
  pair,
  displayName,
  payoutPercent,
  currentPrice,
  decimals,
  activeSignal,
  secondsRemaining,
  onTestSignal,
  isSafeMode,
  onOpenSafeExit,
}) => {
  const [copied, setCopied] = useState(false);

  const isCall = activeSignal?.direction === 'CALL';
  const isPut = activeSignal?.direction === 'PUT';

  const copySignalText = () => {
    if (!activeSignal) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes() + 1).padStart(2, '0')}`;
    const text = `🔥 QUOTEX 1M SIGNAL\nPair: ${pair}\nDirection: ${activeSignal.direction} ${isCall ? '🟢' : '🔴'}\nTimeframe: 1 Minute\nEntry Time: ${timeStr}:00 (At candle open)\nConfluence: ${activeSignal.probability}%\nStrategy: G0 (Direct) + Max G1`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm">
      {/* Background ambient lighting for active signal */}
      {activeSignal && (
        <div
          className={`absolute inset-0 pointer-events-none opacity-15 transition-opacity ${
            isCall
              ? 'bg-gradient-to-r from-emerald-500/30 via-emerald-600/10 to-transparent'
              : 'bg-gradient-to-r from-rose-500/30 via-rose-600/10 to-transparent'
          }`}
        />
      )}

      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        {/* Left Section: Pair Info & Next Candle Expiry Clock */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">{pair}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                {payoutPercent}% PAYOUT
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 font-mono">
              <span>Price: <strong className="text-neutral-200">{currentPrice.toFixed(decimals)}</strong></span>
              <span>·</span>
              <span>Quotex 1M Expiry</span>
            </div>
          </div>

          <div className="h-10 w-px bg-neutral-800 hidden sm:block" />

          {/* 1M Candle Timer Countdown */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Candle Closes In
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-2xl sm:text-3xl font-mono font-black tabular-nums ${
                  secondsRemaining <= 10
                    ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                    : 'text-white'
                }`}
              >
                00:{String(secondsRemaining).padStart(2, '0')}
              </span>
              {secondsRemaining <= 10 && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-1.5 py-0.5 rounded animate-pulse">
                  PREPARE ENTRY
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Section: Safe Mode State, Active Signal, or Scanning State */}
        {isSafeMode ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-rose-950/40 border border-rose-500/40 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-200 tracking-wide uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  SAFE EXIT ENGAGED · RISK FROZEN
                </span>
                <p className="text-[11px] text-rose-300/80 mt-0.5">
                  Automated signal generation, audio chimes, and push alerts are paused. Capital protected.
                </p>
              </div>
            </div>

            {onOpenSafeExit && (
              <button
                onClick={onOpenSafeExit}
                className="px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                Manage / Resume
              </button>
            )}
          </div>
        ) : activeSignal ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 bg-neutral-950/90 border border-neutral-800 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                  isCall
                    ? 'bg-emerald-500 shadow-emerald-500/30'
                    : 'bg-rose-500 shadow-rose-500/30'
                }`}
              >
                {isCall ? (
                  <TrendingUp className="w-7 h-7 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-7 h-7 stroke-[2.5]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xl sm:text-2xl font-black tracking-wider ${
                      isCall ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    NEXT: {activeSignal.direction}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-neutral-200 border border-neutral-700">
                    {activeSignal.probability}% ACCURACY
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-0.5 font-medium">
                  {secondsRemaining <= 10 ? (
                    <strong className="text-amber-400">⚡ ENTER AT 00:58 - 00:00 FOR 1M CANDLE</strong>
                  ) : (
                    <span>Ready for next 1M candle open · Strategy: Direct + G1</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
              <button
                onClick={copySignalText}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
                title="Copy Quotex VIP Signal format"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onOpenSafeExit && (
                <button
                  onClick={onOpenSafeExit}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 rounded-lg transition-colors border border-rose-800/80"
                  title="Emergency Safe Exit: Halt trading immediately"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Exit Safe</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-neutral-950/60 border border-neutral-800/80 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-neutral-400">
                <Clock className="w-5 h-5 text-neutral-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 tracking-wide">
                  SCANNING 1M HIGH-PROBABILITY CONFLUENCE
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Signals automatically trigger at T-8s to T-3s before candle open when $\ge 80\%$ confidence is confirmed.
                </p>
              </div>
            </div>

            {/* Test Signal Trigger & Safe Exit Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onTestSignal(pair, 'CALL')}
                className="px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/60 border border-emerald-700/60 rounded-lg transition-colors flex items-center gap-1.5"
                title="Trigger a test CALL signal to verify sound and push alerts"
              >
                <Play className="w-3 h-3 fill-emerald-400" />
                <span>Test CALL</span>
              </button>
              <button
                onClick={() => onTestSignal(pair, 'PUT')}
                className="px-2.5 py-1.5 text-[11px] font-bold text-rose-300 bg-rose-950/70 hover:bg-rose-900/60 border border-rose-700/60 rounded-lg transition-colors flex items-center gap-1.5"
                title="Trigger a test PUT signal to verify sound and push alerts"
              >
                <Play className="w-3 h-3 fill-rose-400" />
                <span>Test PUT</span>
              </button>

              {onOpenSafeExit && (
                <button
                  onClick={onOpenSafeExit}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 rounded-lg transition-colors flex items-center gap-1"
                  title="Emergency Safe Exit: Freeze risks"
                >
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span>Exit Safe</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Immediate Execution Timing Helper Bar */}
      <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quotex Rule: Enter at <strong>00:58</strong> to eliminate broker server latency. Expiration: <strong>1 Minute (M1)</strong>.</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>Target Accuracy: <strong className="text-emerald-400">88% - 94%</strong></span>
          <span>·</span>
          <span>Martingale: <strong className="text-neutral-200">Max 1 Step (G1)</strong></span>
        </div>
      </div>
    </div>
  );
};
