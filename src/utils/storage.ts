import { GameSettings, UserStats } from '../types/game';

const STATS_KEY = 'one_life_user_stats_v1';
const SETTINGS_KEY = 'one_life_settings_v1';

export const DEFAULT_STATS: UserStats = {
  bestScore: 0,
  gamesPlayed: 0,
  totalScore: 0,
  bestCombo: 0,
  challengesCompleted: {
    color_tap: 0,
    dont_touch: 0,
    find_odd: 0,
    memory_position: 0,
    stop_target: 0,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  volume: 0.8,
  quickCountdown: false,
  colorMode: 'light',
  theme: 'crimson',
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      challengesCompleted: {
        ...DEFAULT_STATS.challengesCompleted,
        ...(parsed.challengesCompleted || {}),
      },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // LocalStorage quota or disabled
  }
}

export function updateStatsAfterRun(
  finalScore: number,
  maxRunCombo: number,
  runChallengesCompleted: Record<string, number>
): { isNewBest: boolean; updatedStats: UserStats } {
  const current = loadUserStats();
  const isNewBest = finalScore > current.bestScore;
  const newBest = Math.max(current.bestScore, finalScore);
  const newBestCombo = Math.max(current.bestCombo, maxRunCombo);

  const updatedStats: UserStats = {
    bestScore: newBest,
    gamesPlayed: current.gamesPlayed + 1,
    totalScore: current.totalScore + finalScore,
    bestCombo: newBestCombo,
    challengesCompleted: {
      color_tap: (current.challengesCompleted.color_tap || 0) + (runChallengesCompleted.color_tap || 0),
      dont_touch: (current.challengesCompleted.dont_touch || 0) + (runChallengesCompleted.dont_touch || 0),
      find_odd: (current.challengesCompleted.find_odd || 0) + (runChallengesCompleted.find_odd || 0),
      memory_position: (current.challengesCompleted.memory_position || 0) + (runChallengesCompleted.memory_position || 0),
      stop_target: (current.challengesCompleted.stop_target || 0) + (runChallengesCompleted.stop_target || 0),
    },
  };

  saveUserStats(updatedStats);
  return { isNewBest, updatedStats };
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    
    // Normalize theme if from previous version
    let theme = parsed.theme || 'crimson';
    if (theme === 'dark-crimson') theme = 'crimson';
    if (theme === 'cyber-amber') theme = 'amber';
    if (theme === 'electric-indigo') theme = 'indigo';
    if (theme === 'stealth-mono') theme = 'mono';

    return { 
      ...DEFAULT_SETTINGS, 
      ...parsed,
      theme,
      colorMode: parsed.colorMode || 'light',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // LocalStorage disabled
  }
}

export function resetAllStats(): UserStats {
  saveUserStats(DEFAULT_STATS);
  return DEFAULT_STATS;
}
