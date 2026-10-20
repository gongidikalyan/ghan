import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { ColorMode } from '../../types/game';
import { ADMOB_CONFIG } from '../../config/admob';

interface InterstitialAdModalProps {
  isOpen: boolean;
  colorMode: ColorMode;
  onClose: () => void;
}

interface AdCampaign {
  id: string;
  brand: string;
  tagline: string;
  description: string;
  icon: string;
  rating: string;
  downloads: string;
  ctaText: string;
  badge: string;
  gradient: string;
}

const CAMPAIGNS: AdCampaign[] = [
  {
    id: 'cyber_reflex',
    brand: 'CYBER STRIKE: ZERO',
    tagline: 'ULTRA-FAST TACTICAL SHOOTER',
    description: 'Master lightning reaction times in the next-generation competitive cyber arena. 120 FPS supported.',
    icon: '⚡',
    rating: '4.8 ★',
    downloads: '10M+ Downloads',
    ctaText: 'PLAY FREE NOW',
    badge: 'FEATURED GAME',
    gradient: 'from-violet-600 via-indigo-600 to-purple-800',
  },
  {
    id: 'pulse_haptics',
    brand: 'SONIC PULSE 3D',
    tagline: 'SPATIAL AUDIO HEADPHONES',
    description: 'Hear enemy footsteps with zero latency. Engineered for competitive twitch-reflex players.',
    icon: '🎧',
    rating: '4.9 ★',
    downloads: 'Editor\'s Choice',
    ctaText: 'SHOP GEAR - 20% OFF',
    badge: 'SPONSORED TECH',
    gradient: 'from-emerald-600 via-teal-700 to-cyan-900',
  },
  {
    id: 'neuro_boost',
    brand: 'SYNAPSE IQ',
    tagline: 'COGNITIVE REFLEX TRAINING',
    description: 'Level up brain reaction speed, memory retention, and twitch agility with daily scientific micro-tests.',
    icon: '🧠',
    rating: '4.7 ★',
    downloads: '5M+ Thinkers',
    ctaText: 'START 7-DAY TRIAL',
    badge: 'BRAIN FITNESS',
    gradient: 'from-amber-500 via-rose-600 to-rose-900',
  },
];

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  isOpen,
  colorMode,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<AdCampaign>(CAMPAIGNS[0]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Pick a random campaign
    const randomPick = CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)];
    setCampaign(randomPick);
    setSecondsRemaining(5);
    setCanSkip(false);

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

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Sponsored Advertisement"
    >
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-950 text-white flex flex-col justify-between min-h-[520px]">
        {/* Top Ad Navigation Bar */}
        <div className="w-full flex items-center justify-between p-3.5 bg-black/40 border-b border-white/10 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded text-slate-200">
              AD
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {campaign.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(prev => !prev)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {canSkip ? (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 bg-white text-slate-900 hover:bg-slate-200 font-black text-xs px-3 py-1.5 rounded-full transition-transform active:scale-95 cursor-pointer shadow-lg"
              >
                <span>SKIP AD</span>
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono-numbers font-bold bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                <span>Skip in {secondsRemaining}s</span>
              </div>
            )}
          </div>
        </div>

        {/* 5-Second Linear Progress Bar */}
        <div className="w-full h-1 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all duration-1000 ease-linear"
            style={{
              width: `${((5 - secondsRemaining) / 5) * 100}%`,
            }}
          />
        </div>

        {/* Dynamic Ad Creative Body */}
        <div className={`flex-1 p-6 flex flex-col justify-between bg-gradient-to-b ${campaign.gradient}`}>
          {/* Hero Ad Icon / Visual */}
          <div className="flex flex-col items-center justify-center my-auto text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/20 border border-white/30 flex items-center justify-center text-5xl mb-4 shadow-2xl animate-pulse">
              {campaign.icon}
            </div>

            <h3 className="text-2xl font-black font-display tracking-tight text-white mb-1 uppercase drop-shadow-md">
              {campaign.brand}
            </h3>

            <p className="text-xs font-bold tracking-wider text-amber-300 uppercase mb-3">
              {campaign.tagline}
            </p>

            <div className="flex items-center gap-3 text-xs text-white/80 font-medium mb-4">
              <span className="bg-black/30 px-2 py-0.5 rounded-full border border-white/10">
                {campaign.rating}
              </span>
              <span>•</span>
              <span>{campaign.downloads}</span>
            </div>

            <p className="text-xs text-slate-200/90 leading-relaxed max-w-xs font-medium">
              {campaign.description}
            </p>
          </div>

          {/* Interactive CTA Button */}
          <div className="w-full pt-4">
            <button
              type="button"
              onClick={() => {
                // In production, this opens the sponsor link or app store page
                onClose();
              }}
              className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black font-display tracking-wider text-base uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white"
            >
              <span>{campaign.ctaText}</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div className="flex items-center justify-between text-[10px] text-white/50 mt-2 px-1 font-mono">
              <span>Google AdMob • Interstitial</span>
              <span className="truncate max-w-[170px]">
                {ADMOB_CONFIG.interstitialAdUnitId ? ADMOB_CONFIG.interstitialAdUnitId.split('/').pop() : 'Sponsored'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
