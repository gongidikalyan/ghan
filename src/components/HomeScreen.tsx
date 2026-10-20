import React from 'react';
import { Play, Trophy, BarChart2, Settings, HelpCircle } from 'lucide-react';
import { ColorMode, UserStats } from '../types/game';

interface HomeScreenProps {
  stats: UserStats;
  colorMode: ColorMode;
  onPlay: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  colorMode,
  onPlay,
  onOpenStats,
  onOpenSettings,
  onOpenRules,
}) => {
  const isLight = colorMode === 'light';

  return (
    <div className="flex-1 w-full flex flex-col justify-between items-center py-6 px-4 z-10 max-w-sm mx-auto">
      {/* Top Header / Quick Actions */}
      <div className="w-full flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenRules}
          className={`p-2.5 rounded-xl transition-colors ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="How to Play"
          aria-label="How to play"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          

          <button
            type="button"
            onClick={onOpenStats}
            className={`p-2.5 rounded-xl transition-colors ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Statistics"
            aria-label="View statistics"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`p-2.5 rounded-xl transition-colors ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Settings"
            aria-label="Game settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Branding */}
      <div className="w-full text-center flex flex-col items-center my-auto">
        {/* Title: SPEED on line 1, N on line 2, TENSION on line 3 */}
        <h1 className={`text-5xl sm:text-6xl font-black font-display tracking-tight uppercase leading-[0.88] flex flex-col items-center mb-4 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          <span>SPEED</span>
          <span className="text-3xl sm:text-4xl text-rose-500 font-extrabold my-1">N</span>
          <span>TENSION</span>
        </h1>

        {/* Subtitle / Hook */}
        <p className={`text-sm font-semibold tracking-wide uppercase mb-8 ${
          isLight ? 'text-slate-500' : 'text-slate-400'
        }`}>
          HIGH SPEED. HIGH TENSION. ONE LIFE.
        </p>

        {/* Personal Best Display */}
        <div className={`flex items-center gap-2 text-sm font-medium mb-8 ${
          isLight ? 'text-slate-600' : 'text-slate-300'
        }`}>
          <Trophy className={`w-4 h-4 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>BEST SCORE</span>
          <span aria-hidden="true" className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
          <span className={`text-xl font-black font-display font-mono-numbers ${
            isLight ? 'text-amber-600' : 'text-amber-400'
          }`}>
            {stats.bestScore}
          </span>
        </div>

        {/* Primary Tactile PLAY Button */}
        <button
          type="button"
          onClick={onPlay}
          className="w-full h-18 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black font-display text-2xl tracking-wider uppercase shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer border border-rose-400/40 hover:shadow-rose-600/50"
        >
          <Play className="w-7 h-7 fill-white" />
          PLAY NOW
        </button>
      </div>

      {/* Empty spacer replacing footer */}
      <div className="h-2" />
    </div>
  );
};
