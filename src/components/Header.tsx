import React from 'react';
import { Bell, BellOff, Volume2, VolumeX, ShieldAlert, Zap, Search } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { NotificationPermissionState } from '../utils/notifications';

interface HeaderProps {
  activeTab: 'terminal' | 'scanner' | 'matrix' | 'history';
  setActiveTab: (tab: 'terminal' | 'scanner' | 'matrix' | 'history') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notifState: NotificationPermissionState;
  onRequestNotif: () => void;
  onOpenSettings: () => void;
  isSafeMode: boolean;
  onOpenSafeExit: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  notifState,
  onRequestNotif,
  onOpenSettings,
  isSafeMode,
  onOpenSafeExit,
  onOpenSearch,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setEnabled(next);
    if (next) {
      soundEngine.playCountdownTick(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4 fill-emerald-400/20" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            QUOTEX <span className="text-emerald-400">1M</span> PULSE
          </span>
        </div>

        {/* Search trigger button in header */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs transition-colors group"
          title="Search Quotex Assets & Currencies (Hotkeys: / or Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline font-mono">Search Assets & Payouts...</span>
          <span className="sm:hidden font-mono">Search</span>
          <kbd className="hidden md:inline px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-[10px] rounded text-neutral-400 font-mono">
            /
          </kbd>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'terminal'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Trading Terminal
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'scanner'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Confluence Radar
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'matrix'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Martingale Matrix
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'history'
                ? 'text-white border-b-2 border-emerald-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Signal Audit Log
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Audio Chime Mute/Unmute */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute audio alerts' : 'Enable audio alerts'}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Push Notification Toggle Button */}
          {notifState === 'granted' ? (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 rounded-lg hover:bg-emerald-900/40 transition-colors whitespace-nowrap"
            >
              <Bell className="w-3.5 h-3.5 fill-emerald-400/20 text-emerald-400" />
              <span className="hidden sm:inline">Push Active</span>
            </button>
          ) : (
            <button
              onClick={onRequestNotif}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors whitespace-nowrap shadow-sm shadow-emerald-900/40"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enable Push</span>
            </button>
          )}

          {/* Exit Safe Button */}
          <button
            onClick={onOpenSafeExit}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap shadow-sm ${
              isSafeMode
                ? 'bg-rose-950/80 text-rose-300 border-rose-600 hover:bg-rose-900/70'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-300'
            }`}
            title="Safe Exit & Capital Protection"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isSafeMode ? 'Safe Exit: On' : 'Exit Safe'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
