import React from 'react';
import { X, Heart, ShieldAlert, Zap } from 'lucide-react';
import { ColorMode } from '../types/game';

interface RulesModalProps {
  colorMode: ColorMode;
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ colorMode, isOpen, onClose }) => {
  if (!isOpen) return null;

  const isLight = colorMode === 'light';

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
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] border ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <h3 className="text-xl font-black font-display tracking-tight uppercase">
              50+ Micro Challenges
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Close rules"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2 pr-1">
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
              </strong> Rapid correct answers build up combo multipliers!
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className={`pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
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
