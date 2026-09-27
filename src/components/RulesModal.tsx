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
      title: 'TAP THE COLOR',
      badge: '01',
      desc: 'Tap the shape matching the requested color name. Beware of tricky ink text!',
      icon: '🎨',
    },
    {
      title: "DON'T TOUCH",
      badge: '02',
      desc: 'Tap ANY safe object on screen, but NEVER touch the forbidden hazard!',
      icon: '🚫',
    },
    {
      title: 'FIND THE ODD ONE',
      badge: '03',
      desc: 'Spot the single subtle difference (color, angle, or symbol) among identical items.',
      icon: '🔍',
    },
    {
      title: 'REMEMBER POSITION',
      badge: '04',
      desc: 'Memorize the grid tile where the icon flashes, then tap the exact hidden spot!',
      icon: '🧠',
    },
    {
      title: 'STOP THE TARGET',
      badge: '05',
      desc: 'A moving marker sweeps the track. Tap when it aligns inside the green zone!',
      icon: '🎯',
    },
    {
      title: 'SWIPE DIRECTION',
      badge: '06',
      desc: 'Swipe or tap Left, Right, Up, or Down. Watch out for the "OPPOSITE" rule!',
      icon: '↔️',
    },
    {
      title: 'FAST MATH',
      badge: '07',
      desc: 'Lightning mental arithmetic: verify True/False, tap Even/Odd, or find Highest number.',
      icon: '⚡',
    },
    {
      title: 'RAPID TAPS',
      badge: '08',
      desc: 'Tap the button the exact number of times requested. Do not over-tap!',
      icon: '👆',
    },
    {
      title: 'ROCK PAPER SCISSORS',
      badge: '09',
      desc: 'Pick the winning move (or losing move if requested) against the opponent.',
      icon: '✂️',
    },
    {
      title: 'SHAPE MATCH',
      badge: '10',
      desc: 'Identify and tap the requested geometric shape (Triangle, Star, Diamond, etc.).',
      icon: '📐',
    },
    {
      title: 'ORDER SEQUENCE',
      badge: '11',
      desc: 'Tap scattered numbers or letters in strict ascending sequence (1 → 2 → 3).',
      icon: '🔢',
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
              11 Challenge Modes
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
