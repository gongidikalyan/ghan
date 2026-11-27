/**
 * SPEED N TENSION: Fast-paced mobile reaction & attention game.
 * 3 lives per run. Survive as many micro-challenges as you can.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ShieldCheck } from 'lucide-react';
import { Challenge, ChallengeType, GameScreen, GameSettings, UserStats } from './types/game';
import { soundManager } from './utils/audio';
import { hapticManager } from './utils/haptics';
import {
  loadGameSettings,
  loadUserStats,
  resetAllStats,
  saveGameSettings,
  updateStatsAfterRun,
} from './utils/storage';
import { generateNextChallenge } from './utils/challengeGenerator';
import { HeaderHUD } from './components/HeaderHUD';
import { ColorTapChallenge } from './components/challenges/ColorTapChallenge';
import { DontTouchChallenge } from './components/challenges/DontTouchChallenge';
import { FindOddChallenge } from './components/challenges/FindOddChallenge';
import { MemoryPositionChallenge } from './components/challenges/MemoryPositionChallenge';
import { StopTargetChallenge } from './components/challenges/StopTargetChallenge';
import { SwipeDirectionChallenge } from './components/challenges/SwipeDirectionChallenge';
import { QuickMathChallenge } from './components/challenges/QuickMathChallenge';
import { TapCountChallenge } from './components/challenges/TapCountChallenge';
import { RPSChallenge } from './components/challenges/RPSChallenge';
import { ShapeMatchChallenge } from './components/challenges/ShapeMatchChallenge';
import { OrderSequenceChallenge } from './components/challenges/OrderSequenceChallenge';
import { LaneActionChallenge } from './components/challenges/LaneActionChallenge';
import { TensionMeterChallenge } from './components/challenges/TensionMeterChallenge';
import { FloatingTargetChallenge } from './components/challenges/FloatingTargetChallenge';
import { DoorHazardChoiceChallenge } from './components/challenges/DoorHazardChoiceChallenge';
import { WireSwitchChallenge } from './components/challenges/WireSwitchChallenge';
import { CodePuzzleChallenge } from './components/challenges/CodePuzzleChallenge';
import { HoldReleaseChallenge } from './components/challenges/HoldReleaseChallenge';
import { DialRotateChallenge } from './components/challenges/DialRotateChallenge';
import { PatternGridChallenge } from './components/challenges/PatternGridChallenge';
import { SliderMatchChallenge } from './components/challenges/SliderMatchChallenge';
import { WordReflexChallenge } from './components/challenges/WordReflexChallenge';
import { DualReflexChallenge } from './components/challenges/DualReflexChallenge';
import { HomeScreen } from './components/HomeScreen';
import { CountdownScreen } from './components/CountdownScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';
import { ContinueChoiceModal } from './components/ContinueChoiceModal';
import { adManager } from './utils/adManager';
import {
  ADMOB_CONFIG,
  showPlatformAd,
  preloadPlatformAd,
  showRewardedAd,
  preloadRewardedAd,
  forceRepaint,
} from './config/admob';

const MAX_LIVES = 3;
const MAX_REWARDED_ADS_PER_RUN = ADMOB_CONFIG.maxRewardedAdsPerRun;

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('HOME');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxRunCombo, setMaxRunCombo] = useState<number>(0);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [lifeStatusBanner, setLifeStatusBanner] = useState<{ savedByAd: boolean; remaining: number } | null>(null);
  const [pendingMistake, setPendingMistake] = useState<{ reason: string } | null>(null);
  const [rewardedAdsUsed, setRewardedAdsUsed] = useState<number>(0);
  const [isRewardedAdLoading, setIsRewardedAdLoading] = useState<boolean>(false);
  const [rewardedAdError, setRewardedAdError] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isInterim, setIsInterim] = useState<boolean>(false);
  const [interimSuccess, setInterimSuccess] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const [isPlatformAdLoading, setIsPlatformAdLoading] = useState<boolean>(false);

  // Stored stats & settings
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [settings, setSettings] = useState<GameSettings>(loadGameSettings);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Run tracking across all 11 challenge types
  const runChallengesCountRef = useRef<Record<ChallengeType, number>>({
    color_tap: 0,
    dont_touch: 0,
    find_odd: 0,
    memory_position: 0,
    stop_target: 0,
    swipe_direction: 0,
    quick_math: 0,
    tap_count: 0,
    rock_paper_scissors: 0,
    shape_match: 0,
    order_sequence: 0,
    lane_action: 0,
    tension_meter: 0,
    floating_target: 0,
    choice_hazard: 0,
    wire_switch: 0,
    code_puzzle: 0,
    hold_release: 0,
    dial_rotate: 0,
    pattern_grid: 0,
    slider_match: 0,
    word_reflex: 0,
    dual_reflex: 0,
  });

  const timerRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(performance.now());
  const isResolvedRef = useRef<boolean>(false);
  const livesRef = useRef<number>(MAX_LIVES);
  const rewardedAdsUsedRef = useRef<number>(0);
  const rewardedAdInFlightRef = useRef<boolean>(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const inputUnlockTimeoutRef = useRef<number | null>(null);
  const [inputLocked, setInputLocked] = useState<boolean>(false);
  const runStartTimeRef = useRef<number>(performance.now());

  const isLight = settings.colorMode === 'light';

  // Initialize sound settings
  useEffect(() => {
    soundManager.enabled = settings.soundEnabled;
    soundManager.volume = settings.volume;
    hapticManager.enabled = settings.hapticsEnabled;
  }, [settings]);

  // Safety watchdog: Prevent the ad loading overlay from ever getting stuck on screen
  useEffect(() => {
    if (!isPlatformAdLoading) return;
    const timeout = setTimeout(() => {
      setIsPlatformAdLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isPlatformAdLoading]);

  // Synchronize light class, background styles, and browser theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
    root.style.backgroundColor = '#f8fafc';
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#0f172a';
    if (metaTheme) metaTheme.setAttribute('content', '#f8fafc');
    if (metaColorScheme) metaColorScheme.setAttribute('content', 'light');
  }, []);

  // Ensure Android WebView re-awakens audio when returning from native ads or app background
  useEffect(() => {
    const handleResume = () => {
      soundManager.init();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && document.visibilityState === 'visible') {
        handleResume();
      }
    };

    window.addEventListener('focus', handleResume);
    window.addEventListener('pageshow', handleResume);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('pageshow', handleResume);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle wrong answer or timeout: pause cleanly BEFORE deducting a life so the player
  // can optionally watch a rewarded ad to protect remaining lives, use a life, or end the run.
  const handleMistake = useCallback((reason: string) => {
    if (isResolvedRef.current || isInterim) return;
    isResolvedRef.current = true;
    setInputLocked(true);
    setIsInterim(true);

    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (inputUnlockTimeoutRef.current) {
      clearTimeout(inputUnlockTimeoutRef.current);
      inputUnlockTimeoutRef.current = null;
    }

    soundManager.playLifeLost();
    hapticManager.lifeLostBuzz();
    if (rewardedAdsUsedRef.current < MAX_REWARDED_ADS_PER_RUN) {
      preloadRewardedAd();
    }

    setScreenShake(true);
    setRewardedAdError(null);
    setPendingMistake({ reason });

    transitionTimeoutRef.current = window.setTimeout(() => {
      setScreenShake(false);
    }, 260);
  }, [isInterim]);

  // Resume the exact same game session after protecting a life via ad or using 1 life.
  // Immediately closes the modal and mounts the next challenge; the timer loop's own
  // visibility guard safely pauses countdown if Android WebView is still finishing resume.
  const resumeSameSession = useCallback((savedByAd: boolean, remainingLives: number) => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (inputUnlockTimeoutRef.current) {
      clearTimeout(inputUnlockTimeoutRef.current);
      inputUnlockTimeoutRef.current = null;
    }

    setPendingMistake(null);
    setRewardedAdError(null);
    setCombo(0);
    setLifeStatusBanner({ savedByAd, remaining: remainingLives });

    const nextChal = generateNextChallenge(score, currentChallenge?.type);
    setCurrentChallenge(nextChal);
    setTimeRemaining(nextChal.durationMs);
    setIsInterim(false);
    setScreen('PLAYING');
    lastTickTimeRef.current = performance.now();

    inputUnlockTimeoutRef.current = window.setTimeout(() => {
      isResolvedRef.current = false;
      setInputLocked(false);
      lastTickTimeRef.current = performance.now();
    }, 120);

    transitionTimeoutRef.current = window.setTimeout(() => {
      setLifeStatusBanner(null);
    }, 1100);
  }, [score, currentChallenge]);

  // Optional rewarded ad flow: preserves current lives untouched and continues the same session
  const handleWatchAdProtectLife = async () => {
    if (
      rewardedAdInFlightRef.current ||
      isRewardedAdLoading ||
      !pendingMistake ||
      rewardedAdsUsedRef.current >= MAX_REWARDED_ADS_PER_RUN
    ) {
      return;
    }
    rewardedAdInFlightRef.current = true;
    setIsRewardedAdLoading(true);
    setRewardedAdError(null);

    try {
      const result = await showRewardedAd();
      forceRepaint();
      soundManager.init();

      if (result.rewarded) {
        rewardedAdsUsedRef.current += 1;
        setRewardedAdsUsed(rewardedAdsUsedRef.current);
        soundManager.playLifeSaved();
        hapticManager.successCombo();
        resumeSameSession(true, livesRef.current);
      } else {
        setRewardedAdError(
          result.unavailable
            ? 'Ad is unavailable right now. You can retry, use a life, or end the run.'
            : 'Watch the full ad to protect your remaining lives.'
        );
      }
    } catch {
      setRewardedAdError('Ad could not load right now. You can retry, use a life, or end the run.');
    } finally {
      rewardedAdInFlightRef.current = false;
      setIsRewardedAdLoading(false);
    }
  };

  // Optional non-ad continue flow: consumes 1 life and continues the same session
  const handleUseLifeToContinue = () => {
    if (isRewardedAdLoading || !pendingMistake || livesRef.current <= 1) return;
    const remainingLives = Math.max(1, livesRef.current - 1);
    livesRef.current = remainingLives;
    setLives(remainingLives);

    soundManager.playTap();
    hapticManager.lightTap();
    resumeSameSession(false, remainingLives);
  };

  // End the current run from the mistake prompt (either view Game Over or Try Again freshly)
  const finalizeRunFromMistake = async (startFreshImmediately: boolean) => {
    if (isRewardedAdLoading) return;
    const reason = pendingMistake?.reason || 'Run ended.';

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (inputUnlockTimeoutRef.current) {
      clearTimeout(inputUnlockTimeoutRef.current);
      inputUnlockTimeoutRef.current = null;
    }

    livesRef.current = 0;
    setLives(0);
    setPendingMistake(null);
    setRewardedAdError(null);
    setLifeStatusBanner(null);
    setScreenShake(false);

    const runDurationMs = performance.now() - runStartTimeRef.current;
    adManager.recordRunCompleted(score, runDurationMs);
    preloadPlatformAd();

    const { isNewBest: newBestAchieved, updatedStats } = updateStatsAfterRun(
      score,
      maxRunCombo,
      runChallengesCountRef.current
    );

    setIsNewBest(newBestAchieved);
    setStats(updatedStats);
    setGameOverReason(reason);

    if (startFreshImmediately) {
      if (adManager.shouldShowInterstitial(score)) {
        setIsPlatformAdLoading(true);
        try {
          const shown = await showPlatformAd();
          if (shown) {
            adManager.recordAdShown();
          }
        } catch (err) {
          console.warn('Ad error during retry:', err);
        } finally {
          setIsPlatformAdLoading(false);
          forceRepaint();
        }
      }
      startNewRun();
      return;
    }

    soundManager.playWrong();
    hapticManager.failBuzz();
    setScreen('GAME_OVER');
  };

  // Handle correct answer
  const handleCorrect = useCallback(() => {
    if (isInterim || isResolvedRef.current || !currentChallenge) return;
    isResolvedRef.current = true;
    setInputLocked(true);

    const nextScore = score + 1;
    const nextCombo = combo + 1;
    setScore(nextScore);
    setCombo(nextCombo);
    if (nextCombo > maxRunCombo) {
      setMaxRunCombo(nextCombo);
    }

    // Record challenge completion count
    runChallengesCountRef.current[currentChallenge.type] = 
      (runChallengesCountRef.current[currentChallenge.type] || 0) + 1;

    // Sound & tactile feedback
    if (nextCombo >= 5 && nextCombo % 5 === 0) {
      soundManager.playCombo(Math.min(nextCombo / 5, 5));
      hapticManager.successCombo();
    } else {
      soundManager.playCorrect();
      hapticManager.lightTap();
    }

    // Snappy interim flash
    setIsInterim(true);
    setInterimSuccess(true);

    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (inputUnlockTimeoutRef.current) {
      clearTimeout(inputUnlockTimeoutRef.current);
      inputUnlockTimeoutRef.current = null;
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      setInterimSuccess(false);
      const nextChal = generateNextChallenge(nextScore, currentChallenge.type);
      setCurrentChallenge(nextChal);
      setTimeRemaining(nextChal.durationMs);
      setIsInterim(false);
      lastTickTimeRef.current = performance.now();

      // Generous grace period so previous touch release never triggers new challenge buttons
      inputUnlockTimeoutRef.current = window.setTimeout(() => {
        isResolvedRef.current = false;
        setInputLocked(false);
      }, 90);
    }, 240);
  }, [isInterim, currentChallenge, score, combo, maxRunCombo]);

  // Timer loop when PLAYING (guaranteed 10s countdown for every challenge)
  useEffect(() => {
    if (screen !== 'PLAYING' || isInterim || !currentChallenge || pendingMistake) {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    let remainingMs = currentChallenge.durationMs;
    let expired = false;
    setTimeRemaining(remainingMs);
    lastTickTimeRef.current = performance.now();

    const tick = () => {
      if (expired) return;

      const now = performance.now();
      const delta = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      // Keep RAF loop alive during brief touch-unlock grace period or backgrounding without subtracting time
      if (
        isResolvedRef.current ||
        document.hidden ||
        document.visibilityState === 'hidden' ||
        delta > 350
      ) {
        timerRef.current = requestAnimationFrame(tick);
        return;
      }

      remainingMs = Math.max(0, remainingMs - delta);
      setTimeRemaining(remainingMs);

      if (remainingMs <= 0) {
        expired = true;
        timerRef.current = null;
        handleMistake("Time's up!");
        return;
      }

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      expired = true;
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [screen, isInterim, currentChallenge, pendingMistake, handleMistake]);

  // Start new run
  const startNewRun = () => {
    rewardedAdInFlightRef.current = false;
    soundManager.init();
    runStartTimeRef.current = performance.now();
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (inputUnlockTimeoutRef.current) {
      clearTimeout(inputUnlockTimeoutRef.current);
      inputUnlockTimeoutRef.current = null;
    }
    isResolvedRef.current = false;
    livesRef.current = MAX_LIVES;
    setLives(MAX_LIVES);
    rewardedAdsUsedRef.current = 0;
    setRewardedAdsUsed(0);
    setLifeStatusBanner(null);
    setPendingMistake(null);
    setRewardedAdError(null);
    setIsRewardedAdLoading(false);
    setScreenShake(false);
    setInterimSuccess(false);
    setInputLocked(false);
    setIsInterim(false);
    setScore(0);
    setCombo(0);
    setMaxRunCombo(0);
    setIsNewBest(false);
    setGameOverReason('');
    preloadRewardedAd();
    runChallengesCountRef.current = {
      color_tap: 0,
      dont_touch: 0,
      find_odd: 0,
      memory_position: 0,
      stop_target: 0,
      swipe_direction: 0,
      quick_math: 0,
      tap_count: 0,
      rock_paper_scissors: 0,
      shape_match: 0,
      order_sequence: 0,
      lane_action: 0,
      tension_meter: 0,
      floating_target: 0,
      choice_hazard: 0,
      wire_switch: 0,
      code_puzzle: 0,
      hold_release: 0,
      dial_rotate: 0,
      pattern_grid: 0,
      slider_match: 0,
      word_reflex: 0,
      dual_reflex: 0,
    };

    // Pre-generate the first challenge during countdown so it's loaded in memory with 0ms delay
    const firstChallenge = generateNextChallenge(0);
    setCurrentChallenge(firstChallenge);
    setTimeRemaining(firstChallenge.durationMs);

    setScreen('COUNTDOWN');
  };

  // Post-Game Over navigation hooks with real Google AdMob interstitial ads
  const handleGameOverRetry = async () => {
    if (adManager.shouldShowInterstitial(score)) {
      setIsPlatformAdLoading(true);
      try {
        const shown = await showPlatformAd();
        if (shown) {
          adManager.recordAdShown();
        }
      } catch (err) {
        console.warn('Ad error during retry:', err);
      } finally {
        setIsPlatformAdLoading(false);
        forceRepaint();
      }
    }
    startNewRun();
  };

  const handleGameOverHome = async () => {
    if (adManager.shouldShowInterstitial(score)) {
      setIsPlatformAdLoading(true);
      try {
        const shown = await showPlatformAd();
        if (shown) {
          adManager.recordAdShown();
        }
      } catch (err) {
        console.warn('Ad error during home transition:', err);
      } finally {
        setIsPlatformAdLoading(false);
        forceRepaint();
      }
    }
    setScreen('HOME');
  };

  // Called when countdown finishes
  const handleCountdownComplete = () => {
    if (!currentChallenge) {
      const firstChallenge = generateNextChallenge(0);
      setCurrentChallenge(firstChallenge);
      setTimeRemaining(firstChallenge.durationMs);
    }
    isResolvedRef.current = false;
    setIsInterim(false);
    setScreen('PLAYING');
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveGameSettings(newSettings);
  };

  const handleResetStats = () => {
    const emptyStats = resetAllStats();
    setStats(emptyStats);
  };

  // Theme styling
  const getThemeWrapperClass = () => {
    if (isLight) {
      switch (settings.theme) {
        case 'amber':
          return 'bg-amber-50/50';
        case 'indigo':
          return 'bg-indigo-50/50';
        case 'emerald':
          return 'bg-emerald-50/50';
        case 'mono':
          return 'bg-slate-100';
        default:
          return 'bg-rose-50/40';
      }
    } else {
      switch (settings.theme) {
        case 'amber':
          return 'bg-amber-950/20';
        case 'indigo':
          return 'bg-indigo-950/20';
        case 'emerald':
          return 'bg-emerald-950/20';
        case 'mono':
          return 'bg-black';
        default:
          return 'bg-rose-950/10';
      }
    }
  };

  const timePercent = currentChallenge 
    ? (timeRemaining / currentChallenge.durationMs) * 100 
    : 100;

  return (
    <div
      className={`fixed inset-0 w-full h-full flex flex-col items-center justify-between overflow-hidden select-none font-sans ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      } ${getThemeWrapperClass()}`}
      style={{ backgroundColor: isLight ? '#f8fafc' : '#020617' }}
    >
      {/* Background ambient lighting (Zero-overhead radial gradients, eliminates WebView blur flicker) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(circle at 10% 10%, rgba(244, 63, 94, 0.08) 0%, transparent 45%), radial-gradient(circle at 90% 90%, rgba(99, 102, 241, 0.07) 0%, transparent 45%)'
            : 'radial-gradient(circle at 10% 10%, rgba(244, 63, 94, 0.14) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)',
        }}
      />

      {/* Interim success flash overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none z-40 transition-opacity duration-150 ${
          interimSuccess ? 'opacity-100 flash-green-overlay' : 'opacity-0'
        }`} 
      />

      {/* Screen shake / fail flash */}
      <div 
        className={`absolute inset-0 pointer-events-none z-40 transition-opacity duration-150 ${
          screenShake ? 'opacity-100 flash-red-overlay' : 'opacity-0'
        }`} 
      />

      {/* Core Mobile-First Container (max 420px width) */}
      <div className={`relative w-full max-w-md h-full flex flex-col justify-between items-center z-10 ${screenShake ? 'animate-shake' : ''}`}>
        {/* Screen 1: HOME */}
        {screen === 'HOME' && (
          <HomeScreen
            stats={stats}
            colorMode={settings.colorMode}
            onPlay={startNewRun}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
          />
        )}

        {/* Screen 2: COUNTDOWN */}
        {screen === 'COUNTDOWN' && (
          <CountdownScreen
            onComplete={handleCountdownComplete}
            quickCountdown={settings.quickCountdown}
            colorMode={settings.colorMode}
          />
        )}

        {/* Screen 3: PLAYING */}
        {screen === 'PLAYING' && currentChallenge && (
          <div className="relative w-full h-full flex flex-col justify-between py-2">
            {/* Top HUD */}
            <HeaderHUD
              score={score}
              combo={combo}
              lives={lives}
              maxLives={MAX_LIVES}
              timeRemainingPercent={timePercent}
              isInterim={isInterim}
              totalTimeMs={currentChallenge.durationMs}
              colorMode={settings.colorMode}
            />

            {/* Non-blocking Life Protected / Used Toast */}
            {lifeStatusBanner && (
              <div className="pointer-events-none absolute top-16 left-0 right-0 z-30 flex justify-center px-4 animate-fade-in">
                <div
                  className={`px-4 py-2 rounded-xl border shadow-md flex items-center gap-2 text-xs font-bold ${
                    lifeStatusBanner.savedByAd
                      ? isLight
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                      : isLight
                      ? 'bg-white border-rose-200 text-rose-700'
                      : 'bg-slate-900 border-rose-800 text-rose-300'
                  }`}
                >
                  {lifeStatusBanner.savedByAd ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
                  )}
                  <span>
                    {lifeStatusBanner.savedByAd
                      ? `Life Protected · ${lifeStatusBanner.remaining} of ${MAX_LIVES} Lives Intact`
                      : `Continued · ${lifeStatusBanner.remaining} of ${MAX_LIVES} ${
                          lifeStatusBanner.remaining === 1 ? 'Life' : 'Lives'
                        } Left`}
                  </span>
                </div>
              </div>
            )}

            {/* Active Challenge Screen */}
            <div className={`flex-1 w-full flex flex-col justify-center items-center ${(isInterim || inputLocked) ? 'pointer-events-none' : ''}`}>
              {currentChallenge.type === 'color_tap' && (
                <ColorTapChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'dont_touch' && (
                <DontTouchChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'find_odd' && (
                <FindOddChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'memory_position' && (
                <MemoryPositionChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'stop_target' && (
                <StopTargetChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'swipe_direction' && (
                <SwipeDirectionChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'quick_math' && (
                <QuickMathChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'tap_count' && (
                <TapCountChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'rock_paper_scissors' && (
                <RPSChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'shape_match' && (
                <ShapeMatchChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'order_sequence' && (
                <OrderSequenceChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'lane_action' && (
                <LaneActionChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  durationMs={currentChallenge.durationMs}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'tension_meter' && (
                <TensionMeterChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'floating_target' && (
                <FloatingTargetChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'choice_hazard' && (
                <DoorHazardChoiceChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'wire_switch' && (
                <WireSwitchChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'code_puzzle' && (
                <CodePuzzleChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'hold_release' && (
                <HoldReleaseChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'dial_rotate' && (
                <DialRotateChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'pattern_grid' && (
                <PatternGridChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'slider_match' && (
                <SliderMatchChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'word_reflex' && (
                <WordReflexChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}

              {currentChallenge.type === 'dual_reflex' && (
                <DualReflexChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={handleMistake}
                />
              )}
            </div>
          </div>
        )}

        {/* Screen 4: GAME OVER */}
        {screen === 'GAME_OVER' && (
          <GameOverScreen
            score={score}
            bestScore={stats.bestScore}
            isNewBest={isNewBest}
            maxCombo={maxRunCombo}
            reason={gameOverReason}
            colorMode={settings.colorMode}
            onRetry={handleGameOverRetry}
            onHome={handleGameOverHome}
          />
        )}
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onResetStats={handleResetStats}
      />

      <StatsModal
        isOpen={isStatsOpen}
        stats={stats}
        colorMode={settings.colorMode}
        onClose={() => setIsStatsOpen(false)}
      />

      <RulesModal
        isOpen={isRulesOpen}
        colorMode={settings.colorMode}
        onClose={() => setIsRulesOpen(false)}
      />

      <ContinueChoiceModal
        isOpen={screen === 'PLAYING' && Boolean(pendingMistake)}
        reason={pendingMistake?.reason || ''}
        lives={lives}
        maxLives={MAX_LIVES}
        remainingRewardedAds={Math.max(0, MAX_REWARDED_ADS_PER_RUN - rewardedAdsUsed)}
        maxRewardedAds={MAX_REWARDED_ADS_PER_RUN}
        score={score}
        colorMode={settings.colorMode}
        isAdLoading={isRewardedAdLoading}
        adError={rewardedAdError}
        onWatchAdProtectLife={handleWatchAdProtectLife}
        onUseLifeContinue={handleUseLifeToContinue}
        onTryAgain={() => finalizeRunFromMistake(true)}
        onEndRun={() => finalizeRunFromMistake(false)}
      />

      {/* Seamless overlay while native platform ad bridges */}
      {isPlatformAdLoading && (
        <div 
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none animate-fade-in ${
            isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'
          }`}
          style={{ backgroundColor: isLight ? '#f8fafc' : '#020617' }}
          role="status"
          aria-live="polite"
        >
          <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin mb-4" />
          <p className={`text-xs font-black font-display tracking-widest uppercase ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Resuming...
          </p>
        </div>
      )}
    </div>
  );
}
