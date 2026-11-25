import React, { useRef } from 'react';
import { ColorMode, WordReflexPayload } from '../../types/game';

interface WordReflexChallengeProps {
  payload: WordReflexPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const WordReflexChallenge: React.FC<WordReflexChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { badge, prompt, promptSub, options, explanation } = payload;
  const isLight = colorMode === 'light';
  const answeredRef = useRef<boolean>(false);

  const handleSelect = (opt: typeof options[0]) => {
    if (answeredRef.current) return;
    answeredRef.current = true;

    if (opt.isCorrect) {
      onCorrect();
    } else {
      onWrong(`Wrong choice (${opt.label})! ${explanation}`);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-3 select-none">
      {/* Instruction */}
      <div className="text-center px-4">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide uppercase ${
          isLight ? 'text-indigo-600' : 'text-indigo-400'
        }`}>
          {badge}
        </p>
      </div>

      {/* Prompt Card */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-4">
        <div className={`w-full max-w-xs py-6 px-5 rounded-3xl border text-center shadow-lg ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-slate-200/60'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <span className={`text-3xl sm:text-4xl font-black font-display tracking-wider uppercase block ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {prompt}
          </span>
          {promptSub && (
            <span className={`text-xs font-semibold mt-1.5 block ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {promptSub}
            </span>
          )}
        </div>
      </div>

      {/* Options Grid */}
      <div className={`w-full max-w-sm mx-auto grid gap-3 px-4 ${
        options.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSelect(opt)}
            className={`min-h-16 py-3 px-3 rounded-2xl border font-black font-display text-base sm:text-lg tracking-wide uppercase flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200/90 text-slate-900 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
            }`}
          >
            {opt.icon && <span className="text-2xl leading-none">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Quick verbal reflex — trust your instincts
      </div>
    </div>
  );
};
