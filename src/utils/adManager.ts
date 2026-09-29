import { ADMOB_CONFIG } from '../config/admob';

/**
 * AdManager handles frequency capping, eligibility criteria, and tracking
 * for post-game interstitial ads according to strict retention rules.
 */

const STORAGE_KEY = 'speed_tension_ad_metrics_v1';

interface AdMetrics {
  totalRunsCompleted: number;
  eligibleRunsSinceLastAd: number;
  lastAdTimestamp: number;
  activePlaytimeMs: number;
  sessionStartTime: number;
}

const DEFAULT_METRICS: AdMetrics = {
  totalRunsCompleted: 0,
  eligibleRunsSinceLastAd: 0,
  lastAdTimestamp: Date.now(),
  activePlaytimeMs: 0,
  sessionStartTime: Date.now(),
};

class AdManager {
  private metrics: AdMetrics;

  constructor() {
    this.metrics = this.loadMetrics();
  }

  private loadMetrics(): AdMetrics {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_METRICS,
          ...parsed,
          sessionStartTime: Date.now(),
        };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_METRICS, sessionStartTime: Date.now() };
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.metrics));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Called when a run terminates.
   * Increments completed runs and tracks run score.
   */
  public recordRunCompleted(score: number, runDurationMs: number): void {
    this.metrics.totalRunsCompleted += 1;
    this.metrics.activePlaytimeMs += runDurationMs;

    // Only count as an eligible game over if the run lasted at least 2 challenges
    if (score >= 2) {
      this.metrics.eligibleRunsSinceLastAd += 1;
    }

    this.saveMetrics();
  }

  /**
   * Evaluates all frequency rules to decide if an interstitial ad should appear:
   * 1. Never on Run 1 (total completed runs must be > 1).
   * 2. Score Threshold: Skip if the run score was < 2 (avoids punishing quick accidental mis-taps).
   * 3. Frequency: Show every 3 to 4 eligible Game Overs (>= 3).
   * 4. Or trigger after at least 2.5 minutes (150 seconds) of total active playtime.
   */
  public shouldShowInterstitial(runScore: number): boolean {
    // If ads are disabled (testing phase / no keys), never show ads
    if (!ADMOB_CONFIG.isAdsEnabled) {
      return false;
    }

    // Rule 1: Never on Run 1
    if (this.metrics.totalRunsCompleted <= 1) {
      return false;
    }

    // Rule 4: Score Threshold - Skip if run lasted less than 2 challenges
    if (runScore < 2) {
      return false;
    }

    const PLAYTIME_THRESHOLD_MS = 150 * 1000; // 2.5 minutes (150s)
    const timeSinceLastAd = Date.now() - this.metrics.lastAdTimestamp;

    // Rule 2 & 3: Every 3 to 4 Game Overs OR >= 2.5 minutes active playtime
    const isDueByRunCount = this.metrics.eligibleRunsSinceLastAd >= 3;
    const isDueByPlaytime = (
      this.metrics.activePlaytimeMs >= PLAYTIME_THRESHOLD_MS || 
      timeSinceLastAd >= (180 * 1000) // 3 minutes wall-clock time
    );

    return isDueByRunCount || isDueByPlaytime;
  }

  /**
   * Called after an ad has been shown to reset frequency timers and counters.
   */
  public recordAdShown(): void {
    this.metrics.eligibleRunsSinceLastAd = 0;
    this.metrics.activePlaytimeMs = 0;
    this.metrics.lastAdTimestamp = Date.now();
    this.saveMetrics();
  }

  /**
   * Debug / inspection stats
   */
  public getMetrics(): Readonly<AdMetrics> {
    return { ...this.metrics };
  }
}

export const adManager = new AdManager();
