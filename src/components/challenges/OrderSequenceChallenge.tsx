import React, { useState, useRef } from 'react';
import { ColorMode, OrderItem, OrderSequencePayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface OrderSequenceChallengeProps {
  payload: OrderSequencePayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const OrderSequenceChallenge: React.FC<OrderSequenceChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { items, totalSteps } = payload;
  const isLight = colorMode === 'light';
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const currentStepRef = useRef<number>(1);
  const clearedIdsRef = useRef<string[]>([]);
  const isFinishedRef = useRef<boolean>(false);

  const handleItemClick = (item: OrderItem) => {
    if (isFinishedRef.current || clearedIdsRef.current.includes(item.id)) return;

    if (item.stepNumber === currentStepRef.current) {
      soundManager.playTap();
      hapticManager.lightTap();

      currentStepRef.current += 1;
      clearedIdsRef.current = [...clearedIdsRef.current, item.id];
      
      setCurrentStep(currentStepRef.current);
      setClearedIds(clearedIdsRef.current);

      if (clearedIdsRef.current.length === totalSteps) {
        isFinishedRef.current = true;
        onCorrect();
      }
    } else {
      isFinishedRef.current = true;
      onWrong(`Out of order! Tapped ${item.label} instead of next in sequence.`);
    }
  };

  const gridCols = items.length <= 4 ? 'grid-cols-2' : 'grid-cols-3';

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
          isLight ? 'text-cyan-700' : 'text-cyan-400'
        }`}>
          Next target: Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Scattered Sequence Grid */}
      <div className={`w-full max-w-sm mx-auto grid gap-3 px-4 ${gridCols} my-auto`}>
        {items.map((item) => {
          const isCleared = clearedIds.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              disabled={isCleared}
              onClick={() => handleItemClick(item)}
              className={`h-24 sm:h-28 rounded-2xl flex items-center justify-center font-black font-display text-3xl border shadow-sm transition-all duration-100 ${
                isCleared
                  ? isLight
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-700 opacity-40 scale-95'
                    : 'bg-emerald-950/40 border-emerald-600 text-emerald-400 opacity-40 scale-95'
                  : isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-50 shadow-slate-200/50 text-slate-900 active:scale-90 cursor-pointer'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white active:scale-90 cursor-pointer'
              }`}
            >
              {isCleared ? '✓' : item.label}
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Ascending order speed sequence
      </div>
    </div>
  );
};
