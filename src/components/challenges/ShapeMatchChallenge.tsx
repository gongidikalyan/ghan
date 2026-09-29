import React, { useRef } from 'react';
import { ColorMode, ShapeItem, ShapeMatchPayload } from '../../types/game';

interface ShapeMatchChallengeProps {
  payload: ShapeMatchPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

const renderShapeSvg = (shapeKey: ShapeItem['shapeKey'], className = 'w-8 h-8') => {
  switch (shapeKey) {
    case 'circle':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'square':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
    case 'triangle':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2, 22 21, 2 21" />
        </svg>
      );
    case 'diamond':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2, 22 12, 12 22, 2 12" />
        </svg>
      );
    case 'star':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2, 15.09 8.26, 22 9.27, 17 14.14, 18.18 21.02, 12 17.77, 5.82 21.02, 7 14.14, 2 9.27, 8.91 8.26 12 2" />
        </svg>
      );
    case 'heart':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2, 21 7.2, 21 17.6, 12 22.8, 3 17.6, 3 7.2" />
        </svg>
      );
    case 'pentagon':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2, 22 9.5, 18.2 21.5, 5.8 21.5, 2 9.5" />
        </svg>
      );
  }
};

export const ShapeMatchChallenge: React.FC<ShapeMatchChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { targetShapeLabel, items } = payload;
  const isLight = colorMode === 'light';
  const isAnsweredRef = useRef<boolean>(false);

  const handleShapeClick = (item: ShapeItem) => {
    if (isAnsweredRef.current) return;
    isAnsweredRef.current = true;

    if (item.isCorrect) {
      onCorrect();
    } else {
      onWrong(`Tapped ${item.label} instead of ${targetShapeLabel}!`);
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
          isLight ? 'text-teal-700' : 'text-teal-400'
        }`}>
          Identify the correct shape
        </p>
      </div>

      {/* Shapes Grid */}
      <div className={`w-full max-w-sm mx-auto grid gap-3 px-4 ${gridCols}`}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleShapeClick(item)}
            className={`h-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center p-2 border shadow-sm active:scale-95 transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:bg-slate-50 shadow-slate-200/50 text-slate-800'
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
            }`}
            aria-label={`Shape ${item.label}`}
          >
            <div className="text-slate-700 dark:text-slate-200 mb-1">
              {renderShapeSvg(item.shapeKey, 'w-10 h-10')}
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        One tap required
      </div>
    </div>
  );
};
