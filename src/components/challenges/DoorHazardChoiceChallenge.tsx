import React, { useRef } from 'react';
import { ColorMode, ChoiceHazardPayload, ChoiceOption } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface DoorHazardChoiceChallengeProps {
  payload: ChoiceHazardPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const DoorHazardChoiceChallenge: React.FC<DoorHazardChoiceChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { question, options, clue } = payload;
  const isLight = colorMode === 'light';
  const isAnsweredRef = useRef<boolean>(false);

  const handleSelect = (option: ChoiceOption) => {
    if (isAnsweredRef.current) return;
    isAnsweredRef.current = true;

    if (option.isCorrect) {
      soundManager.playTap();
      hapticManager.lightTap();
      onCorrect();
    } else {
      onWrong(`Wrong choice: ${option.title}!`);
    }
  };

  const gridCols = options.length <= 2 ? 'grid-cols-2' : options.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3';

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-2 select-none">
      {/* Title & Instruction */}
      <div className="text-center px-4">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        {clue && (
          <p className={`text-xs font-semibold tracking-wide ${
            isLight ? 'text-indigo-600 font-bold' : 'text-indigo-400 font-bold'
          }`}>
            CLUE: {clue}
          </p>
        )}
      </div>

      {/* Prominent Question / Clue banner if needed */}
      <div className="w-full text-center my-auto px-4">
        <div className={`p-4 rounded-3xl border shadow-sm max-w-xs mx-auto mb-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-xl sm:text-2xl font-black font-display">
            {question}
          </span>
        </div>

        {/* Dynamic Choice Buttons */}
        <div className={`w-full max-w-sm mx-auto grid gap-3 ${gridCols}`}>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`h-28 rounded-2xl flex flex-col items-center justify-center p-2 border shadow-sm active:scale-95 transition-all cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
              }`}
            >
              <span className="text-4xl mb-1 filter drop-shadow">
                {opt.icon}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {opt.title}
              </span>
              {opt.subLabel && (
                <span className="text-[9px] text-slate-400">
                  {opt.subLabel}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        One decision determines survival
      </div>
    </div>
  );
};
