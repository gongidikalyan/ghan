import { ADMOB_CONFIG } from '../config/admob';

/**
 * AdManager handles frequency capping, eligibility criteria, and tracking
 * for post-game interstitial ads according to strict retention rules.
 */

const STORAGE_KEY = 'speed_tension_ad_metrics_v1';

interface AdMetrics {
  totalRunsCompleted: number;
  gamesSinceLastAd: number;
  eligibleRunsSinceLastAd?: number;
  lastAdTimestamp: number;
  activePlaytimeMs: number;
  sessionStartTime: number;
}

const DEFAULT_METRICS: AdMetrics = {
  totalRunsCompleted: 0,
  gamesSinceLastAd: 0,
  lastAdTimestamp: Date.now(),
  activePlaytimeMs: 0,
  sessionStartTime: Date.now(),
};

// Target frequency: 1 ad for every 2 games
const GAMES_PER_AD = 2;

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
          gamesSinceLastAd: parsed.gamesSinceLastAd ?? parsed.eligibleRunsSinceLastAd ?? 0,
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
   * Called when a game run terminates.
   * Increments total games and games counter since last ad.
   */
  public recordRunCompleted(_score: number, runDurationMs: number): void {
    this.metrics.totalRunsCompleted += 1;
    this.metrics.gamesSinceLastAd += 1;
    this.metrics.activePlaytimeMs += runDurationMs;

    this.saveMetrics();
  }

  /**
   * Evaluates if an interstitial ad should appear:
   * Triggers an ad for every 2 games played.
   */
  public shouldShowInterstitial(_runScore?: number): boolean {
    // If ads are disabled in configuration, do not display ads
    if (!ADMOB_CONFIG.isAdsEnabled) {
      return false;
    }

    // Trigger ad after every 2 completed games
    return this.metrics.gamesSinceLastAd >= GAMES_PER_AD;
  }

  /**
   * Called after an ad has been triggered/shown to reset the counter.
   */
  public recordAdShown(): void {
    this.metrics.gamesSinceLastAd = 0;
    this.metrics.activePlaytimeMs = 0;
    this.metrics.lastAdTimestamp = Date.now();
    this.saveMetrics();
  }

  /**
   * Returns how many games are remaining until the next ad placement.
   */
  public getGamesUntilNextAd(): number {
    return Math.max(0, GAMES_PER_AD - this.metrics.gamesSinceLastAd);
  }

  /**
   * Debug / inspection stats
   */
  public getMetrics(): Readonly<AdMetrics> {
    return { ...this.metrics };
  }
}

export const adManager = new AdManager();

