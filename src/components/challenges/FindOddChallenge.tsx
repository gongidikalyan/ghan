import React, { useRef } from 'react';
import { ColorMode, FindOddPayload } from '../../types/game';

interface FindOddChallengeProps {
  payload: FindOddPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const FindOddChallenge: React.FC<FindOddChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { items, gridCols, oddDescription } = payload;
  const isLight = colorMode === 'light';
  const isAnsweredRef = useRef<boolean>(false);

  const handleItemClick = (item: typeof items[0]) => {
    if (isAnsweredRef.current) return;
    isAnsweredRef.current = true;

    if (item.isOdd) {
      onCorrect();
    } else {
      onWrong(`Missed the odd one! (${oddDescription})`);
    }
  };

  const getGridClass = () => {
    if (gridCols === 2) return 'grid-cols-2 max-w-xs';
    if (gridCols === 3) return 'grid-cols-3 max-w-sm';
    return 'grid-cols-4 max-w-sm';
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
          isLight ? 'text-sky-600' : 'text-sky-400'
        }`}>
          One item is subtly different
        </p>
      </div>

      {/* Grid */}
      <div className={`w-full mx-auto grid gap-2.5 px-4 ${getGridClass()}`}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            className={`aspect-square rounded-2xl flex items-center justify-center p-2 shadow-sm active:scale-90 transition-all duration-100 cursor-pointer ${
              isLight
                ? 'bg-white border border-slate-200/90 hover:bg-slate-50 shadow-slate-200/50'
                : 'bg-slate-900 border border-slate-800 hover:bg-slate-800/90'
            }`}
            aria-label="Target item"
          >
            <span className="text-3xl sm:text-4xl filter drop-shadow select-none">
              {item.content}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Spot the anomaly fast
      </div>
    </div>
  );
};
