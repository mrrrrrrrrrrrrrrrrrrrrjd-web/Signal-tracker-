import React, { useState } from 'react';
import { X, Bell, Volume2, Sliders, ShieldCheck, Play, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { notificationService, NotificationPermissionState } from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notifState: NotificationPermissionState;
  onRequestNotif: () => void;
  minConfluence: number;
  setMinConfluence: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  notifState,
  onRequestNotif,
  minConfluence,
  setMinConfluence,
}) => {
  const [volume, setVolume] = useState<number>(soundEngine.getVolume() * 100);
  const [testNotifMessage, setTestNotifMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol / 100);
  };

  const testPushNotification = () => {
    const res = notificationService.sendTestNotification();
    setTestNotifMessage(res.message);
    setTimeout(() => setTestNotifMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Signal Alert & Engine Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Browser Push Notifications Section */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Immediate Push Notifications</span>
                <span className="text-[11px] text-neutral-400">
                  Sends desktop & lock-screen alerts 5 seconds prior to 1M candle open.
                </span>
              </div>
            </div>

            {notifState === 'granted' ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                Active
              </span>
            ) : (
              <button
                onClick={onRequestNotif}
                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
              >
                Grant Access
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-[11px] text-neutral-400 font-mono">
              Status: <strong className="text-neutral-200 capitalize">{notifState}</strong>
            </span>
            <button
              onClick={testPushNotification}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Test Push Notification</span>
            </button>
          </div>

          {testNotifMessage && (
            <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/50 p-2 rounded-lg">
              {testNotifMessage}
            </div>
          )}
        </div>

        {/* 2. Audio Chime Synthesizer Section */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Synthesized Audio Alerts</span>
                <span className="text-[11px] text-neutral-400">Zero-latency Web Audio chime on CALL / PUT / Win</span>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                soundEngine.setEnabled(next);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-neutral-800 text-white border-neutral-700'
                  : 'bg-neutral-900 text-neutral-500 border-neutral-800'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Volume slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>Alert Volume</span>
              <span className="text-white">{volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Test Chime Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => soundEngine.playCallAlert()}
              className="flex-1 py-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/50 border border-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Play className="w-3 h-3 fill-emerald-400" />
              Test CALL Chime
            </button>
            <button
              onClick={() => soundEngine.playPutAlert()}
              className="flex-1 py-1.5 text-[11px] font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/50 border border-rose-800 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Play className="w-3 h-3 fill-rose-400" />
              Test PUT Chime
            </button>
          </div>
        </div>

        {/* 3. High Probability Filter Threshold */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Minimum Confluence Filter</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              {minConfluence}% Threshold
            </span>
          </div>

          <p className="text-[11px] text-neutral-400">
            Higher thresholds trigger fewer signals with higher probability accuracy, filtering out choppy and low-conviction market regimes.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { val: 78, label: 'Standard (78%)' },
              { val: 82, label: 'Balanced (82%)' },
              { val: 88, label: 'VIP Elite (88%)' },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => setMinConfluence(preset.val)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                  minConfluence === preset.val
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-xs font-bold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors"
        >
          Save & Apply
        </button>
      </div>
    </div>
  );
};
