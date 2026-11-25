import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint } from 'lucide-react';
import { ColorMode, HoldReleasePayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface HoldReleaseChallengeProps {
  payload: HoldReleasePayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const HoldReleaseChallenge: React.FC<HoldReleaseChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const {
    centerIcon,
    actionLabel,
    targetStartPercent,
    targetWidthPercent,
    fillDurationMs,
    hint,
  } = payload;

  const isLight = colorMode === 'light';
  const [chargePercent, setChargePercent] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  const chargeRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const resolvedRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  const zoneEnd = targetStartPercent + targetWidthPercent;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startHolding = (e: React.PointerEvent) => {
    e.preventDefault();
    if (resolvedRef.current || isHoldingRef.current) return;

    isHoldingRef.current = true;
    setIsHolding(true);
    soundManager.playTap();
    hapticManager.lightTap();
    lastFrameRef.current = performance.now();

    const step = (now: number) => {
      if (!isHoldingRef.current || resolvedRef.current) return;
      const delta = Math.min(now - lastFrameRef.current, 100);
      lastFrameRef.current = now;

      const nextCharge = chargeRef.current + (delta / fillDurationMs) * 100;
      if (nextCharge >= 100) {
        chargeRef.current = 100;
        setChargePercent(100);
        isHoldingRef.current = false;
        setIsHolding(false);
        resolvedRef.current = true;
        onWrong('Held too long — overcharged past 100%!');
        return;
      }

      chargeRef.current = nextCharge;
      setChargePercent(nextCharge);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const releaseHold = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isHoldingRef.current || resolvedRef.current) return;

    isHoldingRef.current = false;
    setIsHolding(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    resolvedRef.current = true;
    const finalCharge = chargeRef.current;
    const tolerance = 3.5;

    if (finalCharge >= targetStartPercent - tolerance && finalCharge <= zoneEnd + tolerance) {
      onCorrect();
    } else if (finalCharge < targetStartPercent - tolerance) {
      onWrong(`Released too early (${Math.round(finalCharge)}%). Target: ${targetStartPercent}–${zoneEnd}%.`);
    } else {
      onWrong(`Held too long (${Math.round(finalCharge)}%). Target: ${targetStartPercent}–${zoneEnd}%.`);
    }
  };

  const isInsideZone = chargePercent >= targetStartPercent && chargePercent <= zoneEnd;
  const iconScale = 0.85 + (chargePercent / 100) * 0.5;

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
          isLight ? 'text-rose-600' : 'text-rose-400'
        }`}>
          {hint}
        </p>
      </div>

      {/* Central Dynamic Visual + Fill Meter */}
      <div className="w-full flex flex-col items-center justify-center my-auto px-5 gap-6">
        <div
          className="text-6xl select-none transition-transform duration-75"
          style={{ transform: `scale(${iconScale.toFixed(2)})` }}
        >
          {centerIcon}
        </div>

        <div className="w-full max-w-xs flex flex-col gap-1.5">
          <div className={`w-full h-9 rounded-full relative overflow-hidden border shadow-inner ${
            isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-700'
          }`}>
            {/* Green Target Release Band */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/35 border-x-2 border-emerald-500 z-10 pointer-events-none"
              style={{
                left: `${targetStartPercent}%`,
                width: `${targetWidthPercent}%`,
              }}
            />

            {/* Rising Fill Bar */}
            <div
              className={`h-full transition-colors duration-75 ${
                isInsideZone
                  ? 'bg-emerald-500'
                  : chargePercent > zoneEnd
                  ? 'bg-rose-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, chargePercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              {Math.round(chargePercent)}%
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              RELEASE: {targetStartPercent}%–{zoneEnd}%
            </span>
            <span className="text-rose-500">MAX</span>
          </div>
        </div>
      </div>

      {/* Tactile Press-and-Hold Pad */}
      <div className="w-full max-w-xs mx-auto px-2">
        <button
          type="button"
          onPointerDown={startHolding}
          onPointerUp={releaseHold}
          onPointerCancel={releaseHold}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-full h-20 rounded-2xl font-black font-display text-xl tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer touch-none border ${
            isHolding
              ? isInsideZone
                ? 'bg-emerald-600 text-white border-emerald-300 scale-95 shadow-emerald-600/40'
                : 'bg-indigo-600 text-white border-indigo-300 scale-95 shadow-indigo-600/40'
              : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white border-rose-400/40 shadow-rose-600/30'
          }`}
        >
          <Fingerprint className="w-7 h-7" />
          <span>{isHolding ? (isInsideZone ? 'RELEASE NOW!' : 'HOLDING...') : actionLabel}</span>
        </button>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Press &amp; hold, then release inside the green zone
      </div>
    </div>
  );
};
