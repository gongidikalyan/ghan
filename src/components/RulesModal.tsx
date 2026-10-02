import React, { useState } from 'react';
import { X, Heart, ShieldAlert, Zap, CheckCircle2, Lock, Sparkles, Layers } from 'lucide-react';
import { ColorMode } from '../types/game';
import { mechanicsDeckManager } from '../utils/challengeGenerator';

interface RulesModalProps {
  colorMode: ColorMode;
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ colorMode, isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'rules' | 'mechanics'>('mechanics');
  const isLight = colorMode === 'light';
  const catalog = mechanicsDeckManager.getCatalog();
  const discoveredCount = mechanicsDeckManager.getDiscoveredCount();
  const discoveredPercent = Math.round((discoveredCount / catalog.length) * 100);

  const rules = [
    {
      title: 'LANE ACTION & DODGE',
      badge: '01',
      desc: 'Knife Dodge, Meteor Dodge, Laser Dodge, Catch the Star, and Coin Catch! Move lanes to evade or catch.',
      icon: '🏃',
    },
    {
      title: 'TENSION METERS & TIMING',
      badge: '02',
      desc: 'Bullseye, Rocket Launch, Bottle Flip, Power Charge, Tug of War! Hit sweet spot zones or rapid mash.',
      icon: '⚡',
    },
    {
      title: 'FLOATING TARGETS & BUBBLES',
      badge: '03',
      desc: 'Pop the Bubbles, Balloon Burst, Moving Target, Avoid the Bomb, and Spot the Crack!',
      icon: '🫧',
    },
    {
      title: 'HAZARDS, DOORS & TILES',
      badge: '04',
      desc: 'Which Door?, Trap Door, Floor is Lava, Safe Tile, Key & Lock, Escape the Box, and Magnet Match!',
      icon: '🚪',
    },
    {
      title: 'WIRES & CIRCUIT SWITCHES',
      badge: '05',
      desc: 'Bomb Defuse, Wire Connect, Light Switch, Train Switch, Traffic Control, and Pipe Connect!',
      icon: '💣',
    },
    {
      title: 'MEMORY & CODE SEQUENCES',
      badge: '06',
      desc: 'Unlock Code, Disappearing Path, Mirror Match, Rapid Sort, Object Swap, and Order Sequence!',
      icon: '🔐',
    },
    {
      title: 'REFLEX & BRAIN TEASERS',
      badge: '07',
      desc: 'Tap the Color (Stroop), Find the Odd One, Fast Math, Rock Paper Scissors, and Shape Match!',
      icon: '🎨',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh] border ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-black font-display tracking-tight uppercase">
              50 Reusable Mechanics
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Close rules"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-2xl my-2.5 border ${
          isLight ? 'bg-slate-100 border-slate-200/80' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`py-1.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'mechanics'
                ? isLight
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : isLight
                ? 'text-slate-500 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>50 Mechanics ({discoveredCount}/50)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`py-1.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rules'
                ? isLight
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : isLight
                ? 'text-slate-500 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Game Rules</span>
          </button>
        </div>

        {/* Tab 1: 50 Mechanics Compendium */}
        {activeTab === 'mechanics' && (
          <div className="flex-1 overflow-y-auto py-1 flex flex-col gap-2 pr-1">
            {/* Discovery Progress Meter */}
            <div className={`p-3 rounded-2xl border ${
              isLight
                ? 'bg-indigo-50/70 border-indigo-200'
                : 'bg-indigo-950/40 border-indigo-900/60'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1.5">
                <span className={isLight ? 'text-indigo-900' : 'text-indigo-200'}>
                  Discovery Progress
                </span>
                <span className="font-mono-numbers text-indigo-500">
                  {discoveredCount} / {catalog.length} ({discoveredPercent}%)
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isLight ? 'bg-indigo-200/60' : 'bg-indigo-900/50'
              }`}>
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, discoveredPercent)}%` }}
                />
              </div>
              <p className={`text-[11px] mt-1.5 leading-tight ${isLight ? 'text-indigo-800/80' : 'text-indigo-300/80'}`}>
                Survive longer runs to discover all 50 unique mechanics! Fresh mechanics are dealt from a non-repeating 50-card shuffled deck.
              </p>
            </div>

            {/* Catalog Grid */}
            <div className="flex flex-col gap-1.5">
              {catalog.map((m) => {
                const isDiscovered = mechanicsDeckManager.isDiscovered(m.index);
                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                      isDiscovered
                        ? isLight
                          ? 'bg-slate-50 border-slate-200/90'
                          : 'bg-slate-950/60 border-slate-800/80'
                        : isLight
                        ? 'bg-slate-100/50 border-slate-200/50 opacity-70'
                        : 'bg-slate-900/40 border-slate-800/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        isLight ? 'bg-white shadow-xs' : 'bg-slate-800'
                      }`}>
                        {m.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-bold ${
                            isLight ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            #{m.index.toString().padStart(2, '0')}
                          </span>
                          <span className="text-xs font-black font-display tracking-tight truncate">
                            {m.name}
                          </span>
                        </div>
                        <span className={`text-[10px] leading-tight truncate ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {m.summary}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isDiscovered ? (
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isLight
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-400'
                        }`}>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Seen</span>
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isLight
                            ? 'bg-slate-200/60 border-slate-300/60 text-slate-600'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Survival Rules */}
        {activeTab === 'rules' && (
          <div className="flex-1 overflow-y-auto py-1 flex flex-col gap-2 pr-1">
            <div className={`p-3 rounded-2xl flex items-start gap-2.5 border ${
              isLight
                ? 'bg-rose-50/80 border-rose-200'
                : 'bg-rose-500/10 border-rose-500/20'
            }`}>
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className={`text-xs font-medium leading-relaxed ${
                isLight ? 'text-rose-800' : 'text-rose-300'
              }`}>
                <strong className={isLight ? 'text-rose-950 font-bold' : 'text-white font-bold'}>
                  ONE LIFE RULE:
                </strong> Exactly 1 life. One wrong tap or expired timer ends the run instantly!
              </p>
            </div>

            {rules.map((r) => (
              <div 
                key={r.badge} 
                className={`p-2.5 rounded-2xl border flex items-start gap-3 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200/90'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <span className="text-xl mt-0.5">{r.icon}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black font-display tracking-tight">
                      {r.title}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-normal ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}

            <div className={`p-3 rounded-2xl flex items-start gap-2.5 border ${
              isLight
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-amber-500/10 border-amber-500/20'
            }`}>
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className={`text-xs font-medium leading-relaxed ${
                isLight ? 'text-amber-800' : 'text-amber-300'
              }`}>
                <strong className={isLight ? 'text-amber-950 font-bold' : 'text-white font-bold'}>
                  COMBO STREAKS:
                </strong> Rapid correct answers build up combo multipliers and dynamic tension speed!
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className={`pt-3 border-t mt-2 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-rose-600/20"
          >
            I'M READY TO PLAY
          </button>
        </div>
      </div>
    </div>
  );
};
