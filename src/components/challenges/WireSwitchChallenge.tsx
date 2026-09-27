import React, { useState } from 'react';
import { ColorMode, WireSwitchItem, WireSwitchPayload } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { hapticManager } from '../../utils/haptics';

interface WireSwitchChallengeProps {
  payload: WireSwitchPayload;
  instruction: string;
  colorMode: ColorMode;
  onCorrect: () => void;
  onWrong: (reason: string) => void;
}

export const WireSwitchChallenge: React.FC<WireSwitchChallengeProps> = ({
  payload,
  instruction,
  colorMode,
  onCorrect,
  onWrong,
}) => {
  const { subType, prompt, items } = payload;
  const isLight = colorMode === 'light';
  const [activeItems, setActiveItems] = useState<WireSwitchItem[]>(items);

  const handleAction = (item: WireSwitchItem) => {
    if (item.isTargetAction) {
      soundManager.playTap();
      hapticManager.lightTap();
      onCorrect();
    } else {
      onWrong(`Triggered wrong switch: ${item.label}!`);
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
          {prompt}
        </p>
      </div>

      {/* Main Switchboard / Circuit Box */}
      <div className={`w-full max-w-sm mx-auto p-4 rounded-3xl border shadow-lg my-auto flex flex-col items-center gap-3 ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="w-full flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>CIRCUIT RELAY</span>
          <span className="text-rose-500 font-black animate-pulse">ARMED</span>
        </div>

        {/* Wires / Switches */}
        <div className="w-full flex flex-col gap-2.5">
          {activeItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAction(item)}
              className={`w-full h-14 rounded-2xl border flex items-center justify-between px-4 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm ${
                isLight
                  ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-black font-display uppercase tracking-wider">
                  {item.label}
                </span>
              </div>

              {/* Wire line or toggle switch indicator */}
              <div
                className="w-12 h-3 rounded-full border shadow-inner"
                style={{
                  backgroundColor: item.colorHex || '#f43f5e',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 font-medium">
        Precision circuit action
      </div>
    </div>
  );
};
