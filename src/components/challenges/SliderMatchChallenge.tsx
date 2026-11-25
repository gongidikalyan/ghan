import React, { useState, useRef } from 'react';
import { Check } from 'lucide-react';
import { ColorMode, SliderMatchPayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface SliderMatchChallengeProps {
  payload: SliderMatchPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const SliderMatchChallenge: React.FC<SliderMatchChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const {
    centerIcon,
    unit,
    minVal,
    maxVal,
    initialVal,
    targetMin,
    targetMax,
    targetLabel,
    isFocusMode,
    confirmLabel,
    hint,
  } = payload;

  const isLight = colorMode === 'light';
  const [value, setValue] = useState<number>(initialVal);
  const resolvedRef = useRef<boolean>(false);

  const range = maxVal - minVal;
  const percent = ((value - minVal) / range) * 100;
  const zoneStartPercent = ((targetMin - minVal) / range) * 100;
  const zoneWidthPercent = ((targetMax - targetMin) / range) * 100;

  const targetCenter = (targetMin + targetMax) / 2;
  const distFromCenter = Math.abs(value - targetCenter);
  const halfBand = (targetMax - targetMin) / 2;
  const blurPx = isFocusMode
    ? Math.max(0, Math.min(7, ((distFromCenter - halfBand * 0.6) / (range * 0.45)) * 7))
    : 0;

  const isInside = value >= targetMin - 2 && value <= targetMax + 2;

  const handleConfirm = () => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    soundManager.playTap();
    hapticManager.lightTap();

    if (isInside) {
      onCorrect();
    } else {
      onWrong(`Set to ${value}${unit}, needed ${targetLabel}!`);
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

      {/* Central Visual Display & Readout */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-5 gap-5">
        <div className={`w-28 h-28 rounded-3xl border flex items-center justify-center shadow-lg ${
          isLight
            ? 'bg-white border-slate-200 shadow-slate-200/70'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <span
            className="text-6xl select-none"
            style={isFocusMode ? { filter: `blur(${blurPx.toFixed(1)}px)` } : undefined}
          >
            {centerIcon}
          </span>
        </div>

        {/* Numeric Digital Readout */}
        <div className="flex flex-col items-center">
          <span className={`text-3xl font-black font-display font-mono-numbers ${
            isInside
              ? 'text-emerald-500'
              : isLight
              ? 'text-slate-900'
              : 'text-white'
          }`}>
            {isFocusMode ? (blurPx < 0.7 ? 'SHARP ✓' : 'BLURRY') : `${value}${unit}`}
          </span>
          {!isFocusMode && (
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              TARGET: {targetLabel}
            </span>
          )}
        </div>

        {/* Visual Gauge + Touch Range Slider */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className={`w-full h-5 rounded-full relative overflow-hidden border ${
            isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-700'
          }`}>
            {!isFocusMode && (
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/45 border-x-2 border-emerald-500"
                style={{
                  left: `${zoneStartPercent}%`,
                  width: `${zoneWidthPercent}%`,
                }}
              />
            )}
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-rose-500 rounded-full -ml-1 pointer-events-none"
              style={{ left: `${percent}%` }}
            />
          </div>

          <input
            type="range"
            min={minVal}
            max={maxVal}
            step={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label="Tuning slider"
            className="w-full h-10 accent-rose-600 cursor-pointer touch-pan-x"
          />
        </div>
      </div>

      {/* Confirm CTA */}
      <div className="w-full max-w-xs mx-auto px-2">
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black font-display text-xl tracking-wider uppercase shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-400/40"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>{confirmLabel}</span>
        </button>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Drag slider into target range, then lock it in
      </div>
    </div>
  );
};
