import React from 'react';
import { ColorMode, DontTouchPayload } from '../../types/game';

interface DontTouchChallengeProps {
  payload: DontTouchPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const DontTouchChallenge: React.FC<DontTouchChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { items, forbiddenLabel, forbiddenIconName } = payload;
  const isLight = colorMode === 'light';

  const handleItemClick = (item: typeof items[0]) => {
    if (item.isForbidden) {
      onWrong(`You touched the forbidden ${forbiddenIconName} ${forbiddenLabel}!`);
    } else {
      onCorrect();
    }
  };

  const getGridCols = () => {
    if (items.length <= 4) return 'grid-cols-2';
    if (items.length <= 6) return 'grid-cols-3';
    return 'grid-cols-3 sm:grid-cols-4';
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-4">
      {/* Challenge Instruction */}
      <div className="text-center px-4 mb-2">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide ${
          isLight ? 'text-rose-600' : 'text-rose-400'
        }`}>
          Tap ANY safe object to survive
        </p>
      </div>

      {/* Touch Options Grid */}
      <div className={`w-full max-w-sm mx-auto grid gap-3 px-4 ${getGridCols()}`}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            className={`group relative h-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center p-2 shadow-sm active:scale-95 transition-all duration-100 cursor-pointer ${
              isLight
                ? 'bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800'
                : 'bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-300'
            }`}
            aria-label={`Select ${item.label}`}
          >
            <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow select-none">
              {item.iconName}
            </span>
            <span className={`text-[11px] font-bold tracking-wider uppercase ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Avoid the danger symbol
      </div>
    </div>
  );
};
