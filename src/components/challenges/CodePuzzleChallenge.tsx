import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, Check, RefreshCw } from 'lucide-react';
import { ColorMode, CodePuzzlePayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface CodePuzzleChallengeProps {
  payload: CodePuzzlePayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const CodePuzzleChallenge: React.FC<CodePuzzleChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { subType, displayCode, flashMs, options } = payload;
  const isLight = colorMode === 'light';
  const [isRevealed, setIsRevealed] = useState<boolean>(true);
  const isAnsweredRef = useRef<boolean>(false);

  useEffect(() => {
    if (flashMs > 0) {
      const timer = setTimeout(() => {
        setIsRevealed(false);
      }, flashMs);
      return () => clearTimeout(timer);
    }
  }, [flashMs]);

  const handleSelect = (option: typeof options[0]) => {
    if (isAnsweredRef.current) return;
    isAnsweredRef.current = true;

    if (option.isCorrect) {
      soundManager.playTap();
      hapticManager.lightTap();
      onCorrect();
    } else {
      onWrong(`Incorrect choice: ${option.label}!`);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-2 select-none">
      {/* Title & Instruction */}
      <div className="text-center px-4">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide ${
          isLight ? 'text-cyan-700 font-bold' : 'text-cyan-400 font-bold'
        }`}>
          Speed logic memory
        </p>
      </div>

      {/* Code Display Monitor */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-4">
        {displayCode && (
          <div className={`w-full max-w-xs py-5 px-6 rounded-3xl border text-center shadow-lg mb-6 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <span className={`text-3xl sm:text-4xl font-black font-mono-numbers tracking-widest ${
              isRevealed ? (isLight ? 'text-slate-900' : 'text-white') : 'text-slate-400 opacity-40'
            }`}>
              {isRevealed ? displayCode : '• • • •'}
            </span>
          </div>
        )}

        {/* Options to Choose */}
        <div className={`w-full max-w-sm mx-auto grid gap-3 ${
          options.length === 2 ? 'grid-cols-2' : options.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
        }`}>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`h-16 rounded-2xl flex items-center justify-center font-black font-display text-lg tracking-wider border shadow-sm active:scale-95 transition-all cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Fast cognitive retention
      </div>
    </div>
  );
};
