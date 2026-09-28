import React, { useEffect, useState, useMemo } from 'react';
import { ColorMode } from '../types/game';
import { soundManager } from '../utils/audio';

interface CountdownScreenProps {
  onComplete: () => void;
  quickCountdown: boolean;
  colorMode: ColorMode;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  onComplete,
  quickCountdown,
  colorMode,
}) => {
  const steps = useMemo(
    () => (quickCountdown ? ['READY?', 'GO!'] : ['3', '2', '1', 'GO!']),
    [quickCountdown]
  );
  const [index, setIndex] = useState<number>(0);
  const isLight = colorMode === 'light';

  useEffect(() => {
    if (index >= steps.length) {
      onComplete();
      return;
    }

    if (steps[index] === 'GO!') {
      soundManager.playCountdownGo();
    } else {
      soundManager.playCountdownTick();
    }

    const stepDuration = quickCountdown ? 450 : 550;
    const timer = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [index, steps, quickCountdown, onComplete]);

  const currentText = steps[index] || 'GO!';
  const isGo = currentText === 'GO!';

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center z-10">
      <div
        key={currentText}
        className={`text-7xl sm:text-9xl font-black font-display tracking-tight uppercase select-none transition-transform animate-scale-up ${
          isGo 
            ? 'text-emerald-500 drop-shadow-[0_0_35px_rgba(16,185,129,0.5)]' 
            : isLight
            ? 'text-slate-900 drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]'
            : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]'
        }`}
      >
        {currentText}
      </div>
      <p className={`mt-6 text-xs uppercase tracking-widest font-semibold ${
        isLight ? 'text-slate-500' : 'text-slate-500'
      }`}>
        Stay Focused
      </p>
    </div>
  );
};
