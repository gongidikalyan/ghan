import React from 'react';
import { X, Trophy, Flame, PlayCircle, Award, Target } from 'lucide-react';
import { ColorMode, UserStats } from '../types/game';

interface StatsModalProps {
  stats: UserStats;
  colorMode: ColorMode;
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  stats,
  colorMode,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isLight = colorMode === 'light';

  const averageScore = stats.gamesPlayed > 0 
    ? (stats.totalScore / stats.gamesPlayed).toFixed(1) 
    : '0';

  const challengeBreakdown = [
    { key: 'color_tap', label: 'Color Tap', icon: '🎨' },
    { key: 'dont_touch', label: "Don't Touch", icon: '🚫' },
    { key: 'find_odd', label: 'Find Odd', icon: '🔍' },
    { key: 'memory_position', label: 'Memory', icon: '🧠' },
    { key: 'stop_target', label: 'Stop Target', icon: '🎯' },
    { key: 'swipe_direction', label: 'Swipe Direction', icon: '↔️' },
    { key: 'quick_math', label: 'Fast Math', icon: '⚡' },
    { key: 'tap_count', label: 'Rapid Taps', icon: '👆' },
    { key: 'rock_paper_scissors', label: 'R-P-S', icon: '✂️' },
    { key: 'shape_match', label: 'Shape Match', icon: '📐' },
    { key: 'order_sequence', label: 'Order Sequence', icon: '🔢' },
    { key: 'lane_action', label: 'Lane & Dodge', icon: '🏃' },
    { key: 'tension_meter', label: 'Tension Meters', icon: '⚡' },
    { key: 'floating_target', label: 'Floating Targets', icon: '🫧' },
    { key: 'choice_hazard', label: 'Doors & Hazards', icon: '🚪' },
    { key: 'wire_switch', label: 'Wires & Switches', icon: '💣' },
    { key: 'code_puzzle', label: 'Code & Logic', icon: '🔐' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] border ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/40 dark:border-slate-800">
          <h3 className="text-xl font-black font-display tracking-tight uppercase">
            Career Records
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Close statistics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Stat Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-3 rounded-2xl border flex flex-col ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <span className={`text-[11px] font-semibold uppercase flex items-center gap-1.5 mb-0.5 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Best Score
            </span>
            <span className="text-2xl font-black font-display font-mono-numbers">
              {stats.bestScore}
            </span>
          </div>

          <div className={`p-3 rounded-2xl border flex flex-col ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <span className={`text-[11px] font-semibold uppercase flex items-center gap-1.5 mb-0.5 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Flame className="w-3.5 h-3.5 text-orange-500" /> Best Streak
            </span>
            <span className="text-2xl font-black font-display font-mono-numbers">
              {stats.bestCombo > 0 ? `${stats.bestCombo}x` : '—'}
            </span>
          </div>

          <div className={`p-3 rounded-2xl border flex flex-col ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <span className={`text-[11px] font-semibold uppercase flex items-center gap-1.5 mb-0.5 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <PlayCircle className="w-3.5 h-3.5 text-sky-500" /> Runs Played
            </span>
            <span className="text-2xl font-black font-display font-mono-numbers">
              {stats.gamesPlayed}
            </span>
          </div>

          <div className={`p-3 rounded-2xl border flex flex-col ${
            isLight
              ? 'bg-slate-50 border-slate-200/90'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <span className={`text-[11px] font-semibold uppercase flex items-center gap-1.5 mb-0.5 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Award className="w-3.5 h-3.5 text-emerald-500" /> Avg Score
            </span>
            <span className="text-2xl font-black font-display font-mono-numbers">
              {averageScore}
            </span>
          </div>
        </div>

        {/* Scrollable Challenges Mastered */}
        <div className={`p-3 rounded-2xl border flex-1 overflow-y-auto flex flex-col gap-1.5 ${
          isLight
            ? 'bg-slate-50 border-slate-200/90'
            : 'bg-slate-950/60 border-slate-800/80'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isLight ? 'text-slate-700' : 'text-slate-300'
          }`}>
            <Target className="w-3.5 h-3.5 text-rose-500" /> Challenges Cleared
          </span>

          <div className="flex flex-col gap-1 pt-1">
            {challengeBreakdown.map((item) => {
              const count = stats.challengesCompleted[item.key] || 0;
              return (
                <div 
                  key={item.key} 
                  className={`flex items-center justify-between text-xs py-1 border-b last:border-none ${
                    isLight ? 'border-slate-200/80' : 'border-slate-900'
                  }`}
                >
                  <span className={`flex items-center gap-2 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    <span className="text-sm">{item.icon}</span> {item.label}
                  </span>
                  <span className="font-bold font-mono-numbers">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close CTA */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          BACK
        </button>
      </div>
    </div>
  );
};
