import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Skull } from 'lucide-react';
import { ColorMode, LaneActionPayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface LaneActionChallengeProps {
  payload: LaneActionPayload;
  instruction: string;
  colorMode: ColorMode;
  durationMs?: number;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const LaneActionChallenge: React.FC<LaneActionChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  durationMs = 2200,
  onCorrect,
  onWrong,
}) => {
  const {
    mode,
    playerIcon,
    targetIcon,
    hazardIcon = '💥',
    laneCount,
    initialPlayerLane,
    hazardLanes,
    targetLane,
    hint,
  } = payload;

  const isLight = colorMode === 'light';
  const [playerLane, setPlayerLane] = useState<number>(initialPlayerLane);
  const playerLaneRef = useRef<number>(initialPlayerLane);
  const [fallProgress, setFallProgress] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const resolvedRef = useRef<boolean>(false);

  // Keep playerLaneRef in sync
  useEffect(() => {
    playerLaneRef.current = playerLane;
  }, [playerLane]);

  // Fall animation scaled to dynamic challenge duration without restarting on player moves
  useEffect(() => {
    resolvedRef.current = false;
    const startTime = performance.now();
    // Fast, responsive fall duration (1.4s - 2.0s) so it resolves well within the 6.0s game timer
    const duration = Math.min(2000, Math.max(1400, Math.round(durationMs * 0.35)));

    const animate = (now: number) => {
      if (resolvedRef.current) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setFallProgress(progress);

      if (progress >= 0.88 && !resolvedRef.current) {
        resolvedRef.current = true;
        const currentLane = playerLaneRef.current;
        // Collision / resolution check
        if (mode === 'dodge') {
          // If player is in any hazard lane -> FAIL
          if (hazardLanes.includes(currentLane)) {
            onWrong(`Hit by hazard in lane ${currentLane + 1}!`);
          } else {
            onCorrect();
          }
        } else {
          // Catch mode: player must be in targetLane
          if (currentLane === targetLane) {
            onCorrect();
          } else {
            onWrong(`Missed target in lane ${targetLane + 1}!`);
          }
        }
        return;
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [durationMs, mode, hazardLanes, targetLane, onCorrect, onWrong]);

  const moveLeft = () => {
    if (playerLaneRef.current > 0) {
      soundManager.playTap();
      hapticManager.lightTap();
      const next = playerLaneRef.current - 1;
      playerLaneRef.current = next;
      setPlayerLane(next);
    }
  };

  const moveRight = () => {
    if (playerLaneRef.current < laneCount - 1) {
      soundManager.playTap();
      hapticManager.lightTap();
      const next = playerLaneRef.current + 1;
      playerLaneRef.current = next;
      setPlayerLane(next);
    }
  };

  const setLaneDirectly = (laneIdx: number) => {
    if (laneIdx >= 0 && laneIdx < laneCount) {
      soundManager.playTap();
      hapticManager.lightTap();
      playerLaneRef.current = laneIdx;
      setPlayerLane(laneIdx);
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
          mode === 'dodge' 
            ? (isLight ? 'text-rose-600 font-bold' : 'text-rose-400 font-bold') 
            : (isLight ? 'text-emerald-700' : 'text-emerald-400')
        }`}>
          {hint}
        </p>
      </div>

      {/* Dynamic Lane Stage */}
      <div className={`w-full max-w-xs mx-auto h-64 rounded-3xl border relative overflow-hidden flex flex-col justify-between p-3 my-auto shadow-inner ${
        isLight
          ? 'bg-slate-50/90 border-slate-200'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        {/* Lane dividers */}
        <div className="absolute inset-0 grid grid-cols-3 pointer-events-none divide-x divide-dashed divide-slate-300/40 dark:divide-slate-800">
          <div />
          <div />
          <div />
        </div>

        {/* Falling objects */}
        <div className="w-full relative h-44">
          {mode === 'dodge' ? (
            // Hazards falling down
            hazardLanes.map((hLane) => (
              <div
                key={`hazard_${hLane}`}
                className="absolute text-3xl transition-transform duration-75 text-center"
                style={{
                  left: `${(hLane / laneCount) * 100}%`,
                  width: `${100 / laneCount}%`,
                  top: `${fallProgress * 80}%`,
                }}
              >
                <span className="inline-block animate-bounce drop-shadow">
                  {hazardIcon}
                </span>
              </div>
            ))
          ) : (
            // Target falling down to catch
            <div
              className="absolute text-3xl transition-transform duration-75 text-center"
              style={{
                left: `${(targetLane / laneCount) * 100}%`,
                width: `${100 / laneCount}%`,
                top: `${fallProgress * 80}%`,
              }}
            >
              <span className="inline-block animate-pulse drop-shadow">
                {targetIcon}
              </span>
            </div>
          )}
        </div>

        {/* Player row at bottom */}
        <div className="w-full relative h-14 flex items-center z-10 border-t border-slate-200/50 dark:border-slate-800/80 pt-1">
          <div
            className="absolute transition-all duration-150 flex items-center justify-center text-3xl"
            style={{
              left: `${(playerLane / laneCount) * 100}%`,
              width: `${100 / laneCount}%`,
            }}
          >
            <span className="inline-block filter drop-shadow">
              {playerIcon}
            </span>
          </div>
        </div>

        {/* Tap lane triggers directly on the track for super fast control */}
        <div className="absolute inset-0 grid grid-cols-3 z-20">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLaneDirectly(idx)}
              className="w-full h-full opacity-0 active:opacity-10 bg-white/20 cursor-pointer"
              aria-label={`Move to lane ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Tactile Left / Right Navigation Buttons */}
      <div className="w-full max-w-xs mx-auto grid grid-cols-2 gap-3 px-2">
        <button
          type="button"
          onClick={moveLeft}
          disabled={playerLane === 0}
          className={`h-14 rounded-2xl flex items-center justify-center gap-2 font-black font-display border shadow-sm active:scale-95 transition-all cursor-pointer ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 disabled:opacity-30'
              : 'bg-slate-900 border-slate-800 text-white disabled:opacity-30'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>LEFT</span>
        </button>

        <button
          type="button"
          onClick={moveRight}
          disabled={playerLane === laneCount - 1}
          className={`h-14 rounded-2xl flex items-center justify-center gap-2 font-black font-display border shadow-sm active:scale-95 transition-all cursor-pointer ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 disabled:opacity-30'
              : 'bg-slate-900 border-slate-800 text-white disabled:opacity-30'
          }`}
        >
          <span>RIGHT</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
