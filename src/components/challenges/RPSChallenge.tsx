import React from 'react';
import { ColorMode, RPSChoice, RPSPayload } from '../../types/game';

interface RPSChallengeProps {
  payload: RPSPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

const RPS_ICONS: Record<RPSChoice, { emoji: string; label: string }> = {
  ROCK: { emoji: '🪨', label: 'ROCK' },
  PAPER: { emoji: '📄', label: 'PAPER' },
  SCISSORS: { emoji: '✂️', label: 'SCISSORS' },
};

export const RPSChallenge: React.FC<RPSChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { opponentChoice, targetChoice, goal } = payload;
  const isLight = colorMode === 'light';

  const choices: RPSChoice[] = ['ROCK', 'PAPER', 'SCISSORS'];

  const handleChoice = (choice: RPSChoice) => {
    if (choice === targetChoice) {
      onCorrect();
    } else {
      onWrong(`Selected ${choice}! Needed ${targetChoice} to ${goal.toLowerCase()} against ${opponentChoice}.`);
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
          goal === 'LOSE'
            ? (isLight ? 'text-rose-600 font-bold' : 'text-rose-400 font-bold')
            : (isLight ? 'text-emerald-700' : 'text-emerald-400')
        }`}>
          {goal === 'LOSE' ? '⚠️ RULE: PICK THE LOSING MOVE!' : 'Quick decision reflex'}
        </p>
      </div>

      {/* Opponent's Hand */}
      <div className="w-full flex flex-col items-center justify-center my-auto">
        <div className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center border shadow-lg ${
          isLight
            ? 'bg-white border-slate-200 shadow-slate-200/50'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-5xl mb-1 filter drop-shadow select-none">
            {RPS_ICONS[opponentChoice].emoji}
          </span>
          <span className={`text-[10px] font-black tracking-widest uppercase ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {opponentChoice}
          </span>
        </div>
      </div>

      {/* Player Choice Options */}
      <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-3 px-4">
        {choices.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleChoice(c)}
            className={`h-24 rounded-2xl flex flex-col items-center justify-center border shadow-sm active:scale-90 transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:bg-slate-50 shadow-slate-200/50 text-slate-800'
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
            }`}
          >
            <span className="text-3xl mb-1 filter drop-shadow select-none">
              {RPS_ICONS[c].emoji}
            </span>
            <span className="text-[10px] font-black tracking-wider uppercase">
              {c}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Rock beats Scissors · Scissors beats Paper · Paper beats Rock
      </div>
    </div>
  );
};
