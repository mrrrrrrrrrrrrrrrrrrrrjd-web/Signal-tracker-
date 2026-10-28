import React from 'react';
import { X, ShieldAlert, ShieldCheck, Power, RotateCcw, ExternalLink, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SafeExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSafeMode: boolean;
  onToggleSafeMode: (enable: boolean) => void;
  onClearSession: () => void;
  totalSignalsTracked: number;
  overallWinRate: number;
  directWinRate: number;
}

export const SafeExitModal: React.FC<SafeExitModalProps> = ({
  isOpen,
  onClose,
  isSafeMode,
  onToggleSafeMode,
  onClearSession,
  totalSignalsTracked,
  overallWinRate,
  directWinRate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSafeMode
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Safe Exit & Risk Lockdown</h3>
              <span className="text-[11px] text-neutral-400 font-mono">
                Capital Protection Protocol · Quotex Execution Guard
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current State Indicator */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isSafeMode
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isSafeMode ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <div>
              <span className="text-xs font-bold block">
                {isSafeMode ? 'SAFE EXIT ENGAGED (SIGNALS HALTED)' : 'LIVE SCANNING ACTIVE'}
              </span>
              <span className="text-[11px] opacity-80">
                {isSafeMode
                  ? 'All automated predictions, audio alarms, and push triggers are frozen.'
                  : 'Live 1M confluence scanner actively analyzing market entries.'}
              </span>
            </div>
          </div>
        </div>

        {/* Session Performance Snapshot */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
            Session Performance Summary
          </span>
          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Signals Run</span>
              <strong className="text-white text-sm">{totalSignalsTracked}</strong>
            </div>
            <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Total Win Rate</span>
              <strong className="text-emerald-400 text-sm">{overallWinRate}%</strong>
            </div>
            <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Direct Win</span>
              <strong className="text-amber-400 text-sm">{directWinRate}%</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Toggle Safe Mode / Emergency Halt */}
          {isSafeMode ? (
            <button
              onClick={() => {
                onToggleSafeMode(false);
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Play className="w-4 h-4 fill-neutral-950" />
              <span>Resume Live Market Scanning</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onToggleSafeMode(true);
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
            >
              <Power className="w-4 h-4" />
              <span>Engage Safe Exit (Halt All Signals & Risk)</span>
            </button>
          )}

          {/* 2. Clear Session & Reset Matrix */}
          <button
            onClick={() => {
              onClearSession();
              onClose();
            }}
            className="w-full py-2 px-4 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Reset Active Session Stats & Clear Signals</span>
          </button>

          {/* 3. Safe Quotex Broker Exit */}
          <a
            href="https://quotex.com"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-4 text-xs font-semibold text-neutral-400 hover:text-neutral-200 bg-neutral-950 border border-neutral-800/80 rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Quotex Account History & Close Trades</span>
          </a>
        </div>

        {/* Protection Tip */}
        <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Trading Rule:</strong> Use Safe Exit immediately after achieving your daily profit target (e.g. +$50 to +$150) or if consecutive losses reach 2 steps, to prevent emotional overtrading.
          </span>
        </div>
      </div>
    </div>
  );
};
