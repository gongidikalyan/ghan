import React, { useState, useRef } from 'react';
import { RotateCcw, RotateCw, Check } from 'lucide-react';
import { ColorMode, DialRotatePayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface DialRotateChallengeProps {
  payload: DialRotatePayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const DialRotateChallenge: React.FC<DialRotateChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const {
    centerIcon,
    stepsCount,
    initialStep,
    targetStep,
    stepLabels,
    targetLabel,
    hint,
  } = payload;

  const isLight = colorMode === 'light';
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const resolvedRef = useRef<boolean>(false);

  const stepAngle = 360 / stepsCount;
  const currentAngle = currentStep * stepAngle;
  const targetAngle = targetStep * stepAngle;

  const rotateBy = (delta: number) => {
    if (resolvedRef.current) return;
    soundManager.playTap();
    hapticManager.lightTap();
    setCurrentStep((prev) => (prev + delta + stepsCount) % stepsCount);
  };

  const handleLock = () => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    if (currentStep === targetStep) {
      onCorrect();
    } else {
      onWrong(`Aligned to ${stepLabels[currentStep]}, needed ${targetLabel}!`);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between py-2 select-none">
      {/* Instruction */}
      <div className="text-center px-4">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide ${
          isLight ? 'text-indigo-600' : 'text-indigo-400'
        }`}>
          {hint}
        </p>
      </div>

      {/* Interactive Circular Dial */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-4">
        <button
          type="button"
          onClick={() => rotateBy(1)}
          aria-label="Rotate dial clockwise"
          className={`relative w-52 h-52 rounded-full border-4 flex items-center justify-center shadow-xl cursor-pointer transition-colors ${
            isLight
              ? 'bg-white border-slate-200 shadow-slate-200/70'
              : 'bg-slate-900 border-slate-700 shadow-black/50'
          }`}
        >
          {/* Step Markers around the ring */}
          {stepLabels.map((lbl, idx) => {
            const rad = ((idx * stepAngle - 90) * Math.PI) / 180;
            const r = 82;
            const x = 100 + r * Math.cos(rad);
            const y = 100 + r * Math.sin(rad);
            const isTarget = idx === targetStep;
            return (
              <span
                key={idx}
                className={`absolute text-xs font-black font-display -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md ${
                  isTarget
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isLight
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                {lbl}
              </span>
            );
          })}

          {/* Target Notch Indicator */}
          <div
            className="absolute inset-4 pointer-events-none"
            style={{ transform: `rotate(${targetAngle}deg)` }}
          >
            <div className="mx-auto w-3 h-3 rounded-full bg-emerald-500/80 border-2 border-white shadow" />
          </div>

          {/* Rotating Pointer Arm */}
          <div
            className="absolute inset-6 pointer-events-none transition-transform duration-150"
            style={{ transform: `rotate(${currentAngle}deg)` }}
          >
            <div className="mx-auto w-2.5 h-14 rounded-full bg-rose-500 shadow-md relative">
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[11px] border-b-rose-500 -ml-[2px] -mt-2" />
            </div>
          </div>

          {/* Center Emblem */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 z-10 shadow-inner ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-950 border-slate-700'
          }`}>
            {centerIcon}
          </div>
        </button>

        <div className={`mt-3 text-xs font-black font-display uppercase tracking-wider ${
          currentStep === targetStep
            ? 'text-emerald-500'
            : isLight
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}>
          CURRENT: {stepLabels[currentStep]} &middot; TARGET: {targetLabel}
        </div>
      </div>

      {/* Rotate Left / Lock / Rotate Right Controls */}
      <div className="w-full max-w-xs mx-auto grid grid-cols-3 gap-2.5 px-2">
        <button
          type="button"
          onClick={() => rotateBy(-1)}
          className={`h-16 rounded-2xl border font-black font-display text-sm uppercase flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'
              : 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          <span>LEFT</span>
        </button>

        <button
          type="button"
          onClick={handleLock}
          className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black font-display text-base tracking-wider uppercase shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border border-emerald-400/40"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>LOCK</span>
        </button>

        <button
          type="button"
          onClick={() => rotateBy(1)}
          className={`h-16 rounded-2xl border font-black font-display text-sm uppercase flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'
              : 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
          }`}
        >
          <RotateCw className="w-5 h-5" />
          <span>RIGHT</span>
        </button>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Rotate dial to align pointer, then tap LOCK
      </div>
    </div>
  );
};
