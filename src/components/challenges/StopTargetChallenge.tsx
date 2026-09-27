import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Target } from 'lucide-react';
import { ColorMode, StopTargetPayload } from '../../types/game';

interface StopTargetChallengeProps {
  payload: StopTargetPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const StopTargetChallenge: React.FC<StopTargetChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { targetZoneStartPercent, targetZoneWidthPercent, speedMs } = payload;
  const isLight = colorMode === 'light';
  const [sliderPosPercent, setSliderPosPercent] = useState<number>(0);
  const [hasStopped, setHasStopped] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const currentPosRef = useRef<number>(0);

  const updateSlider = useCallback(() => {
    if (hasStopped) return;
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    
    const progress = (elapsed % speedMs) / speedMs;
    const triangle = progress <= 0.5 ? progress * 2 : 2 - progress * 2;
    const percent = triangle * 100;
    
    currentPosRef.current = percent;
    setSliderPosPercent(percent);

    animFrameRef.current = requestAnimationFrame(updateSlider);
  }, [hasStopped, speedMs]);

  useEffect(() => {
    startTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(updateSlider);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [updateSlider]);

  const handleStopAction = () => {
    if (hasStopped) return;
    setHasStopped(true);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const current = currentPosRef.current;
    const zoneEnd = targetZoneStartPercent + targetZoneWidthPercent;

    // Forgiving tolerance (±3.5%) to account for pin width and human reaction
    const isInside = current >= (targetZoneStartPercent - 3.5) && current <= (zoneEnd + 3.5);

    if (isInside) {
      onCorrect();
    } else {
      const diff = current < targetZoneStartPercent 
        ? `${Math.round(targetZoneStartPercent - current)}% too early` 
        : `${Math.round(current - zoneEnd)}% too late`;
      onWrong(`Stopped outside target zone! (${diff})`);
    }
  };

  return (
    <div 
      className="flex-1 w-full flex flex-col justify-between py-4 cursor-pointer select-none"
      onClick={handleStopAction}
    >
      {/* Challenge Instruction */}
      <div className="text-center px-4 mb-2">
        <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-tight mb-1 uppercase ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {instruction}
        </h2>
        <p className={`text-xs font-semibold tracking-wide ${
          isLight ? 'text-emerald-700' : 'text-emerald-400'
        }`}>
          Tap when the runner is inside the green zone
        </p>
      </div>

      {/* Interactive Timing Track */}
      <div className="w-full max-w-sm mx-auto px-4 flex flex-col gap-6 items-center">
        {/* The Track Container */}
        <div className={`w-full relative h-16 rounded-2xl overflow-hidden flex items-center shadow-inner ${
          isLight 
            ? 'bg-slate-200/90 border-2 border-slate-300 shadow-slate-300/40' 
            : 'bg-slate-900 border-2 border-slate-800'
        }`}>
          {/* Target Zone Highlight */}
          <div
            className={`absolute top-0 bottom-0 transition-all flex items-center justify-center ${
              isLight
                ? 'bg-emerald-500/30 border-x-2 border-emerald-600'
                : 'bg-emerald-500/25 border-x-2 border-emerald-400'
            }`}
            style={{
              left: `${targetZoneStartPercent}%`,
              width: `${targetZoneWidthPercent}%`,
            }}
          >
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              isLight ? 'text-emerald-800' : 'text-emerald-300'
            }`}>
              ZONE
            </span>
          </div>

          {/* Moving Runner / Target Pin */}
          <div
            className="absolute top-1 bottom-1 w-5 -ml-2.5 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center z-10 pointer-events-none"
            style={{
              left: `${sliderPosPercent}%`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Tactile Big Thumb Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStopAction();
          }}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-black font-display text-xl tracking-wider uppercase shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-400/40"
        >
          <Target className="w-6 h-6 animate-pulse" />
          STOP!
        </button>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Tap the button or screen
      </div>
    </div>
  );
};
