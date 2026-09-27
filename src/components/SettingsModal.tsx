import React from 'react';
import { X, Volume2, VolumeX, Smartphone, Zap, Trash2, Palette, Sun, Moon } from 'lucide-react';
import { ColorMode, GameSettings, ThemeId } from '../types/game';
import { soundManager } from '../utils/audio';
import { hapticManager } from '../utils/haptics';

interface SettingsModalProps {
  settings: GameSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (settings: GameSettings) => void;
  onResetStats: () => void;
}

const THEMES: { id: ThemeId; label: string; accentColor: string }[] = [
  { id: 'crimson', label: 'Crimson', accentColor: '#ef4444' },
  { id: 'amber', label: 'Amber', accentColor: '#f59e0b' },
  { id: 'indigo', label: 'Indigo', accentColor: '#6366f1' },
  { id: 'emerald', label: 'Emerald', accentColor: '#10b981' },
  { id: 'mono', label: 'Mono', accentColor: '#64748b' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const isLight = settings.colorMode === 'light';

  const toggleColorMode = () => {
    const next: ColorMode = settings.colorMode === 'light' ? 'dark' : 'light';
    onUpdateSettings({ ...settings, colorMode: next });
    soundManager.playTap();
  };

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    soundManager.enabled = next;
    onUpdateSettings({ ...settings, soundEnabled: next });
    if (next) soundManager.playTap();
  };

  const toggleHaptics = () => {
    const next = !settings.hapticsEnabled;
    hapticManager.enabled = next;
    onUpdateSettings({ ...settings, hapticsEnabled: next });
    if (next) hapticManager.lightTap();
  };

  const toggleQuickCountdown = () => {
    onUpdateSettings({ ...settings, quickCountdown: !settings.quickCountdown });
    soundManager.playTap();
  };

  const setTheme = (theme: ThemeId) => {
    onUpdateSettings({ ...settings, theme });
    soundManager.playTap();
  };

  const handleReset = () => {
    if (window.confirm('Reset all your scores, best combo, and career stats?')) {
      onResetStats();
      soundManager.playTap();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 border ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black font-display tracking-tight uppercase">
            Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Items */}
        <div className="flex flex-col gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-3">
              {isLight ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-400" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Theme Mode</span>
                <span className="text-[11px] text-slate-500">
                  {isLight ? 'Light Theme (Bright)' : 'Dark Theme (Night)'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleColorMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 border ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              {isLight ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Sound FX */}
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Sound Effects</span>
                <span className="text-[11px] text-slate-500">Audio chimes & alerts</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                settings.soundEnabled
                  ? 'bg-rose-600 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Vibration / Haptics */}
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-3">
              <Smartphone className={`w-5 h-5 ${settings.hapticsEnabled ? 'text-rose-500' : 'text-slate-400'}`} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Vibration</span>
                <span className="text-[11px] text-slate-500">Tactile tap feedback</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleHaptics}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                settings.hapticsEnabled
                  ? 'bg-rose-600 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Quick Countdown */}
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-3">
              <Zap className={`w-5 h-5 ${settings.quickCountdown ? 'text-amber-500' : 'text-slate-400'}`} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Quick Start</span>
                <span className="text-[11px] text-slate-500">Fast 1-second countdown</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleQuickCountdown}
              className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                settings.quickCountdown
                  ? 'bg-rose-600 justify-end'
                  : isLight
                  ? 'bg-slate-300 justify-start'
                  : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Theme Palette */}
          <div className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Palette className="w-4 h-4 text-slate-400" />
              <span>Accent Color</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 border ${
                    settings.theme === t.id
                      ? isLight
                        ? 'border-slate-900 bg-white text-slate-900 shadow-sm'
                        : 'border-white bg-slate-800 text-white'
                      : isLight
                      ? 'border-slate-200 text-slate-500 hover:border-slate-300'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: t.accentColor }}
                  />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Stats */}
        <button
          type="button"
          onClick={handleReset}
          className={`w-full py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
            isLight
              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
              : 'border-rose-900/40 text-rose-400 hover:bg-rose-950/30'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Reset Game Data
        </button>
      </div>
    </div>
  );
};
