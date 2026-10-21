import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Volume2, VolumeX, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { ColorMode } from '../types/game';
import { ADMOB_CONFIG } from '../config/admob';
import { soundManager } from '../utils/audio';

interface AdMobInterstitialProps {
  isOpen: boolean;
  colorMode: ColorMode;
  onClose: () => void;
}

export const AdMobInterstitial: React.FC<AdMobInterstitialProps> = ({
  isOpen,
  colorMode,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const adContainerRef = useRef<HTMLDivElement | null>(null);
  const isLight = colorMode === 'light';

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      setCanSkip(false);
      setAdLoaded(false);
      return;
    }

    // Play subtle ad chime
    soundManager.playTap();

    // Push Google AdMob tag into container
    try {
      const win = window as any;
      if (typeof win.adsbygoogle !== 'undefined') {
        win.adsbygoogle.push({});
      }
    } catch {
      // AdSense push fallback
    }

    // Mark as active
    const loadTimer = setTimeout(() => {
      setAdLoaded(true);
    }, 400);

    // 5-second countdown timer for skippable interstitial
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(loadTimer);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCtaClick = () => {
    try {
      // Open official Google Play store search for verified trending games
      window.open('https://play.google.com/store/apps/top', '_blank');
    } catch {}
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/95 animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Google AdMob Interstitial Advertisement"
    >
      <div className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border flex flex-col justify-between min-h-[540px] max-h-[92vh] ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-950/20'
          : 'bg-slate-950 border-slate-800 text-white shadow-black/80'
      }`}>
        {/* Top Google AdMob Header */}
        <div className={`w-full flex items-center justify-between p-3 border-b z-10 ${
          isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black tracking-widest uppercase bg-rose-600 text-white px-2 py-0.5 rounded shadow-sm">
              AD
            </span>
            <span className={`text-[11px] font-bold tracking-tight ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Google AdMob
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className={`p-1.5 rounded-full transition-colors ${
                isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute ad audio' : 'Mute ad audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {canSkip ? (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer animate-fade-in"
              >
                <span>SKIP AD</span>
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            ) : (
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                isLight
                  ? 'bg-slate-200/70 border-slate-300 text-slate-700'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}>
                <span>Skip in {secondsRemaining}s</span>
              </div>
            )}
          </div>
        </div>

        {/* 5-Second Linear Countdown Progress Bar */}
        <div className={`w-full h-1 overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
          <div
            className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
            style={{
              width: `${((5 - secondsRemaining) / 5) * 100}%`,
            }}
          />
        </div>

        {/* AdMob Live Display Container */}
        <div
          ref={adContainerRef}
          className="flex-1 flex flex-col justify-between p-5 overflow-hidden relative"
        >
          {/* Live Google AdSense / AdMob Ins Tag Slot */}
          <div className="w-full flex justify-center items-center my-auto">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minHeight: '250px' }}
              data-ad-client={ADMOB_CONFIG.publisherId}
              data-ad-slot={ADMOB_CONFIG.interstitialAdUnitId.split('/').pop()}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>

          {/* AdMob Visual Showcase Card */}
          <div className={`w-full rounded-2xl p-4 border flex flex-col items-center text-center my-auto shadow-inner ${
            isLight
              ? 'bg-gradient-to-b from-slate-50 to-rose-50/40 border-slate-200'
              : 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800/90'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-3 shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>

            <span className="text-[10px] font-black tracking-widest uppercase text-rose-500 mb-1">
              SPONSORED GOOGLE NETWORK
            </span>

            <h3 className={`text-xl font-black font-display uppercase tracking-tight mb-1 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Featured Partner
            </h3>

            <p className={`text-xs max-w-xs leading-relaxed mb-3 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Discover verified games and trending apps on Google Play. One tap installs instantly.
            </p>

            <div className={`flex items-center gap-2 text-[10px] font-medium px-2.5 py-1 rounded-full border mb-1 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <span>4.8 ★</span>
              <span>•</span>
              <span>Google Verified App</span>
            </div>
          </div>

          {/* Interactive Install CTA Button */}
          <div className="w-full pt-4">
            <button
              type="button"
              onClick={handleCtaClick}
              className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black font-display tracking-wider text-base uppercase shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-400/40"
            >
              <span>INSTALL NOW</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Official AdMob Meta Info */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1 font-mono">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" />
                AdChoices • Google AdMob
              </span>
              <span className="truncate max-w-[150px]" title={ADMOB_CONFIG.interstitialAdUnitId}>
                {ADMOB_CONFIG.interstitialAdUnitId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
