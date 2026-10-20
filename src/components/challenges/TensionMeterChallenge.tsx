import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, Flame, Compass } from 'lucide-react';
import { ColorMode, TensionMeterPayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface TensionMeterChallengeProps {
  payload: TensionMeterPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const TensionMeterChallenge: React.FC<TensionMeterChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const {
    meterType,
    subType,
    centerIcon,
    targetZoneStartPercent,
    targetZoneWidthPercent,
    speedMs,
    mashTargetTaps = 5,
    label,
  } = payload;

  const isLight = colorMode === 'light';
  const [gaugePercent, setGaugePercent] = useState<number>(0);
  const [mashCount, setMashCount] = useState<number>(0);
  const [hasStopped, setHasStopped] = useState<boolean>(false);
  const hasStoppedRef = useRef<boolean>(false);
  const animRef = useRef<number | null>(null);
  const positionRef = useRef<number>(0);

  // Meter oscillation loop (for timing_stop and balance_hold)
  useEffect(() => {
    if (meterType === 'rapid_mash') return;

    let startTime = performance.now();

    const tick = (now: number) => {
      if (hasStoppedRef.current) return;
      const elapsed = (now - startTime) % speedMs;

      // Triangle wave back and forth
      const cycle = Math.sin((elapsed / speedMs) * Math.PI * 2);
      const pos = (cycle + 1) / 2 * 100; // 0 to 100%

      positionRef.current = pos;
      setGaugePercent(pos);

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [meterType, speedMs]);

  // Handle tap for timing stop or rapid mash
  const handleStopTap = () => {
    if (hasStoppedRef.current) return;

    if (meterType === 'rapid_mash') {
      const next = mashCount + 1;
      setMashCount(next);
      soundManager.playTap();
      hapticManager.lightTap();

      if (next >= mashTargetTaps) {
        hasStoppedRef.current = true;
        setHasStopped(true);
        onCorrect();
      }
    } else {
      hasStoppedRef.current = true;
      setHasStopped(true);
      if (animRef.current) cancelAnimationFrame(animRef.current);

      const currentPos = positionRef.current;
      const zoneStart = targetZoneStartPercent;
      const zoneEnd = targetZoneStartPercent + targetZoneWidthPercent;
      // Forgiving visual tolerance to account for needle thickness & human reaction
      const isInside = currentPos >= (zoneStart - 3.5) && currentPos <= (zoneEnd + 3.5);

      if (isInside) {
        onCorrect();
      } else {
        onWrong(`Missed the green zone! Stopped at ${Math.round(currentPos)}% (Target: ${zoneStart}-${zoneEnd}%)`);
      }
    }
  };

  return (
    <div 
      className="flex-1 w-full flex flex-col justify-between py-2 select-none cursor-pointer"
      onClick={handleStopTap}
    >
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
          {meterType === 'rapid_mash' ? `MASH TO WIN (${mashCount}/${mashTargetTaps})` : label}
        </p>
      </div>

      {/* Main Gauge / Visual Display */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-4">
        {/* Central Themed Emblem */}
        <div className="text-6xl mb-6 filter drop-shadow animate-pulse">
          {centerIcon}
        </div>

        {/* Dynamic Horizontal Meter */}
        {meterType !== 'rapid_mash' ? (
          <div className="w-full max-w-xs relative flex flex-col items-center">
            {/* The Track */}
            <div className={`w-full h-8 rounded-full relative overflow-hidden border shadow-inner ${
              isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}>
              {/* Target Sweet Spot Zone */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/80 shadow-md shadow-emerald-500/50"
                style={{
                  left: `${targetZoneStartPercent}%`,
                  width: `${targetZoneWidthPercent}%`,
                }}
              />

              {/* Moving Indicator Needle / Runner */}
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-rose-500 border border-white rounded-full shadow-lg -ml-1 pointer-events-none"
                style={{
                  left: `${gaugePercent}%`,
                }}
              />
            </div>

            <div className="w-full flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase">
              <span>0%</span>
              <span className="text-emerald-500 font-black">TARGET ZONE</span>
              <span>100%</span>
            </div>
          </div>
        ) : (
          /* Tug of War Tug-O-Meter */
          <div className="w-full max-w-xs relative flex flex-col items-center">
            <div className={`w-full h-8 rounded-full relative overflow-hidden border shadow-inner ${
              isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-100"
                style={{
                  width: `${(mashCount / mashTargetTaps) * 100}%`,
                }}
              />
            </div>
            <div className="w-full flex justify-between text-[10px] font-bold text-slate-400 mt-1">
              <span>START</span>
              <span className="text-rose-500 font-black">PULL TO REACH GOAL!</span>
              <span>WIN</span>
            </div>
          </div>
        )}
      </div>

      {/* Massive Tactile Action Trigger */}
      <div className="w-full max-w-xs mx-auto px-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStopTap();
          }}
          className="w-full h-18 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black font-display text-2xl tracking-wider uppercase shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-400/40"
        >
          <Zap className="w-6 h-6 fill-white" />
          {meterType === 'rapid_mash' ? 'PULL!' : 'STOP NOW!'}
        </button>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        {meterType === 'rapid_mash' ? 'Mash button or screen' : 'Tap button or screen to stop'}
      </div>
    </div>
  );
};
