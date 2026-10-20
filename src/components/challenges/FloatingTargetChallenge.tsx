import React, { useState, useRef } from 'react';
import { ColorMode, FloatingItem, FloatingTargetPayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface FloatingTargetChallengeProps {
  payload: FloatingTargetPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const FloatingTargetChallenge: React.FC<FloatingTargetChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { subType, items, requiredPops, targetDescription } = payload;
  const isLight = colorMode === 'light';
  const [poppedIds, setPoppedIds] = useState<string[]>([]);
  const poppedIdsRef = useRef<string[]>([]);
  const isResolvedRef = useRef<boolean>(false);

  const handleItemClick = (item: FloatingItem) => {
    if (isResolvedRef.current || poppedIdsRef.current.includes(item.id)) return;

    if (!item.isTarget) {
      isResolvedRef.current = true;
      onWrong(`Tapped the wrong item (${item.label || 'hazard'})!`);
      return;
    }

    soundManager.playTap();
    hapticManager.lightTap();

    poppedIdsRef.current = [...poppedIdsRef.current, item.id];
    setPoppedIds(poppedIdsRef.current);

    if (poppedIdsRef.current.length >= requiredPops) {
      isResolvedRef.current = true;
      onCorrect();
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
          isLight ? 'text-rose-600 font-bold' : 'text-rose-400 font-bold'
        }`}>
          {targetDescription} ({poppedIds.length}/{requiredPops})
        </p>
      </div>

      {/* Floating Arena */}
      <div className={`w-full max-w-sm mx-auto h-72 rounded-3xl border relative overflow-hidden my-auto shadow-inner ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        {items.map((item) => {
          const isPopped = poppedIds.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              disabled={isPopped}
              onClick={() => handleItemClick(item)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-90 ${
                isPopped ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'
              }`}
              style={{
                left: `${item.xPercent}%`,
                top: `${item.yPercent}%`,
                width: `${item.sizePx}px`,
                height: `${item.sizePx}px`,
              }}
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-md border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
              }`}>
                {item.icon}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Target precision reflex
      </div>
    </div>
  );
};
