import React from 'react';
import { ColorMode, QuickMathPayload } from '../../types/game';

interface QuickMathChallengeProps {
  payload: QuickMathPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const QuickMathChallenge: React.FC<QuickMathChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { question, options, explanation } = payload;
  const isLight = colorMode === 'light';

  const handleOptionClick = (option: typeof options[0]) => {
    if (option.isCorrect) {
      onCorrect();
    } else {
      onWrong(`Wrong answer: ${option.label}! (${explanation})`);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-4 select-none">
      {/* Challenge Instruction */}
      <div className="text-center px-4 mb-2">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide ${
          isLight ? 'text-indigo-600' : 'text-indigo-400'
        }`}>
          Lightning calculation
        </p>
      </div>

      {/* Prominent Question Banner */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-4">
        <div className={`w-full max-w-xs py-5 px-6 rounded-3xl border text-center shadow-lg ${
          isLight 
            ? 'bg-white border-slate-200/90 shadow-slate-200/50' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <span className={`text-3xl sm:text-4xl font-black font-display tracking-wide font-mono-numbers ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {question}
          </span>
        </div>
      </div>

      {/* Touch Options */}
      <div className={`w-full max-w-sm mx-auto grid gap-3 px-4 ${
        options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleOptionClick(opt)}
            className={`h-16 rounded-2xl flex items-center justify-center font-black font-display text-xl tracking-wider uppercase border shadow-sm active:scale-95 transition-all cursor-pointer font-mono-numbers ${
              isLight
                ? 'bg-white border-slate-200/90 text-slate-800 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Speed mental math
      </div>
    </div>
  );
};
