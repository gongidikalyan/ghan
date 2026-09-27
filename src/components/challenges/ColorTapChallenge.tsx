import React from 'react';
import { ColorMode, ColorTapPayload } from '../../types/game';

interface ColorTapChallengeProps {
  payload: ColorTapPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const ColorTapChallenge: React.FC<ColorTapChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { items, targetColorName, isStroop } = payload;
  const isLight = colorMode === 'light';

  const handleItemClick = (item: typeof items[0]) => {
    if (item.isCorrect) {
      onCorrect();
    } else {
      onWrong(`Tapped ${item.label || item.colorName} instead of ${targetColorName}`);
    }
  };

  const getGridColsClass = () => {
    if (items.length <= 3) return 'grid-cols-1 sm:grid-cols-3';
    if (items.length === 4) return 'grid-cols-2';
    return 'grid-cols-2 sm:grid-cols-3';
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
        {isStroop && (
          <p className={`text-xs font-semibold tracking-wide ${
            isLight ? 'text-amber-600' : 'text-amber-400'
          }`}>
            Match the text color!
          </p>
        )}
      </div>

      {/* Touch Options Grid */}
      <div className={`w-full max-w-sm mx-auto grid gap-3 px-4 ${getGridColsClass()}`}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            className="group relative h-24 sm:h-28 rounded-2xl flex items-center justify-center p-3 shadow-md active:scale-95 transition-all duration-100 cursor-pointer overflow-hidden border border-black/10 dark:border-white/10 hover:brightness-105 active:brightness-95"
            style={{ backgroundColor: item.hex }}
            aria-label={`Select ${item.colorName}`}
          >
            {item.label && (
              <span className="text-xl sm:text-2xl font-black font-display tracking-wide text-white drop-shadow-md uppercase">
                {item.label}
              </span>
            )}
            {/* Gloss shimmer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20 pointer-events-none" />
          </button>
        ))}
      </div>

      <div className={`text-center text-xs font-medium ${
        isLight ? 'text-slate-500' : 'text-slate-500'
      }`}>
        One tap required
      </div>
    </div>
  );
};
