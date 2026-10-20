/**
 * ONE LIFE: Fast-paced mobile reaction & attention game.
 * One life per run. One mistake ends the game.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Challenge, ChallengeType, ColorMode, GameScreen, GameSettings, UserStats } from './types/game';
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
import { HomeScreen } from './components/HomeScreen';
import { CountdownScreen } from './components/CountdownScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';
import { InterstitialAdModal } from './components/ads/InterstitialAdModal';
import { adManager } from './utils/adManager';
import { showPlatformAd } from './config/admob';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('HOME');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxRunCombo, setMaxRunCombo] = useState<number>(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isInterim, setIsInterim] = useState<boolean>(false);
  const [interimSuccess, setInterimSuccess] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [isNewBest, setIsNewBest] = useState<boolean>(false);

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
  });

  const timerRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(performance.now());
  const isResolvedRef = useRef<boolean>(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const [inputLocked, setInputLocked] = useState<boolean>(false);
  const runStartTimeRef = useRef<number>(performance.now());
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const pendingPostGameOverActionRef = useRef<'RETRY' | 'HOME' | null>(null);

  const isLight = settings.colorMode === 'light';

  // Initialize sound settings
  useEffect(() => {
    soundManager.enabled = settings.soundEnabled;
    soundManager.volume = settings.volume;
    hapticManager.enabled = settings.hapticsEnabled;
  }, [settings]);

  // Handle wrong answer / game over
  const triggerGameOver = useCallback((reason: string) => {
    if (isResolvedRef.current || isInterim) return;
    isResolvedRef.current = true;
    setInputLocked(true);

    const runDurationMs = performance.now() - runStartTimeRef.current;
    adManager.recordRunCompleted(score, runDurationMs);

    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    soundManager.playWrong();
    hapticManager.failBuzz();

    setScreenShake(true);
    setGameOverReason(reason);

    const { isNewBest: newBestAchieved, updatedStats } = updateStatsAfterRun(
      score,
      maxRunCombo,
      runChallengesCountRef.current
    );

    setIsNewBest(newBestAchieved);
    setStats(updatedStats);

    setTimeout(() => {
      setScreenShake(false);
      setScreen('GAME_OVER');
    }, 400);
  }, [score, maxRunCombo, isInterim]);

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

    transitionTimeoutRef.current = window.setTimeout(() => {
      setInterimSuccess(false);
      const nextChal = generateNextChallenge(nextScore, currentChallenge.type);
      setCurrentChallenge(nextChal);
      setTimeRemaining(nextChal.durationMs);
      setIsInterim(false);
      lastTickTimeRef.current = performance.now();

      // Generous grace period so previous touch release never triggers new challenge buttons
      window.setTimeout(() => {
        isResolvedRef.current = false;
        setInputLocked(false);
      }, 90);
    }, 240);
  }, [isInterim, currentChallenge, score, combo, maxRunCombo]);

  // Timer loop when PLAYING
  useEffect(() => {
    if (screen !== 'PLAYING' || isInterim || !currentChallenge) {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    lastTickTimeRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      setTimeRemaining((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          triggerGameOver("Time's up!");
          return 0;
        }
        return next;
      });

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [screen, isInterim, currentChallenge, triggerGameOver]);

  // Start new run
  const startNewRun = () => {
    soundManager.init();
    runStartTimeRef.current = performance.now();
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    isResolvedRef.current = false;
    setInputLocked(false);
    setIsInterim(false);
    setScore(0);
    setCombo(0);
    setMaxRunCombo(0);
    setIsNewBest(false);
    setGameOverReason('');
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
    };

    setScreen('COUNTDOWN');
  };

  // Post-Game Over navigation hooks with frequency-capped interstitial ads
  const handleGameOverRetry = async () => {
    if (adManager.shouldShowInterstitial(score)) {
      adManager.recordAdShown();
      const nativeHandled = await showPlatformAd();
      if (!nativeHandled) {
        pendingPostGameOverActionRef.current = 'RETRY';
        setIsAdOpen(true);
      } else {
        startNewRun();
      }
    } else {
      startNewRun();
    }
  };

  const handleGameOverHome = async () => {
    if (adManager.shouldShowInterstitial(score)) {
      adManager.recordAdShown();
      const nativeHandled = await showPlatformAd();
      if (!nativeHandled) {
        pendingPostGameOverActionRef.current = 'HOME';
        setIsAdOpen(true);
      } else {
        setScreen('HOME');
      }
    } else {
      setScreen('HOME');
    }
  };

  const handleAdClosed = () => {
    setIsAdOpen(false);
    const pendingAction = pendingPostGameOverActionRef.current;
    pendingPostGameOverActionRef.current = null;

    if (pendingAction === 'RETRY') {
      startNewRun();
    } else if (pendingAction === 'HOME') {
      setScreen('HOME');
    }
  };

  // Called when countdown finishes
  const handleCountdownComplete = () => {
    const firstChallenge = generateNextChallenge(0);
    setCurrentChallenge(firstChallenge);
    setTimeRemaining(firstChallenge.durationMs);
    isResolvedRef.current = false;
    setIsInterim(false);
    setScreen('PLAYING');
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveGameSettings(newSettings);
  };

  const handleToggleColorMode = () => {
    const nextMode: ColorMode = isLight ? 'dark' : 'light';
    const updated = { ...settings, colorMode: nextMode };
    setSettings(updated);
    saveGameSettings(updated);
    soundManager.playTap();
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
      style={{ transform: 'translate3d(0, 0, 0)' }}
    >
      {/* Background ambient lighting */}
      <div className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-300 ${
        isLight ? 'opacity-25' : 'opacity-30'
      }`}>
        <div className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl ${
          isLight ? 'bg-rose-400/30' : 'bg-rose-600/20'
        }`} />
        <div className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl ${
          isLight ? 'bg-indigo-400/20' : 'bg-indigo-600/20'
        }`} />
      </div>

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
            onToggleColorMode={handleToggleColorMode}
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
          <div className="w-full h-full flex flex-col justify-between py-2">
            {/* Top HUD */}
            <HeaderHUD
              score={score}
              combo={combo}
              timeRemainingPercent={timePercent}
              isInterim={isInterim}
              totalTimeMs={currentChallenge.durationMs}
              colorMode={settings.colorMode}
            />

            {/* Active Challenge Screen */}
            <div className={`flex-1 w-full flex flex-col justify-center items-center ${(isInterim || inputLocked) ? 'pointer-events-none' : ''}`}>
              {currentChallenge.type === 'color_tap' && (
                <ColorTapChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'dont_touch' && (
                <DontTouchChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'find_odd' && (
                <FindOddChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'memory_position' && (
                <MemoryPositionChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'stop_target' && (
                <StopTargetChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'swipe_direction' && (
                <SwipeDirectionChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'quick_math' && (
                <QuickMathChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'tap_count' && (
                <TapCountChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'rock_paper_scissors' && (
                <RPSChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'shape_match' && (
                <ShapeMatchChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'order_sequence' && (
                <OrderSequenceChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
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
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'tension_meter' && (
                <TensionMeterChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'floating_target' && (
                <FloatingTargetChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'choice_hazard' && (
                <DoorHazardChoiceChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'wire_switch' && (
                <WireSwitchChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
                />
              )}

              {currentChallenge.type === 'code_puzzle' && (
                <CodePuzzleChallenge
                  key={currentChallenge.id}
                  payload={currentChallenge.payload.data as any}
                  instruction={currentChallenge.instruction}
                  colorMode={settings.colorMode}
                  onCorrect={handleCorrect}
                  onWrong={triggerGameOver}
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

      {/* Post-Game Over Interstitial Ad */}
      <InterstitialAdModal
        isOpen={isAdOpen}
        colorMode={settings.colorMode}
        onClose={handleAdClosed}
      />
    </div>
  );
}
