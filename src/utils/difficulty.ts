/**
 * Dynamic Difficulty System for Speed n Tension
 * Continuously scales challenge time limits and speed factors as the player's score increases.
 */

export interface DifficultyInfo {
  tierName: string;
  speedMultiplier: number;
  speedLabel: string;
  badgeColor: string;
  isHighTension: boolean;
}

/**
 * Calculates the dynamic speed multiplier based on current run score.
 * Smooth non-linear curve:
 * - Score 0: 1.00x
 * - Score 5: 1.16x
 * - Score 10: 1.36x
 * - Score 20: 1.80x
 * - Score 35: 2.25x
 * - Score 50+: capped gracefully at 2.85x to preserve human twitch limits.
 */
export function getSpeedMultiplier(score: number): number {
  if (score <= 0) return 1.0;
  
  // Gentle power curve capped at 1.70x to ensure challenges remain comfortably solvable
  const baseGrowth = Math.pow(score, 0.5) * 0.07;
  const rawMultiplier = 1.0 + baseGrowth;
  return Math.min(1.70, Math.round(rawMultiplier * 100) / 100);
}

/**
 * Calculates the dynamic challenge time limit in milliseconds.
 * Applies the speed multiplier against the challenge's base time (6000ms),
 * while respecting a safety floor of 3500ms to ensure the player is never unfairly timed out.
 */
export function getDynamicDuration(
  baseDurationMs: number = 6000,
  score: number,
  absoluteFloorMs: number = 3500
): number {
  const multiplier = getSpeedMultiplier(score);
  const scaledMs = Math.round(baseDurationMs / multiplier);
  return Math.max(absoluteFloorMs, scaledMs);
}

/**
 * Returns user-facing difficulty tier information for the HUD and Game Over screen.
 */
export function getDifficultyInfo(score: number): DifficultyInfo {
  const multiplier = getSpeedMultiplier(score);
  const speedLabel = `${multiplier.toFixed(1)}x`;

  if (score >= 35) {
    return {
      tierName: 'HYPER',
      speedMultiplier: multiplier,
      speedLabel,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      isHighTension: true,
    };
  }

  if (score >= 20) {
    return {
      tierName: 'OVERDRIVE',
      speedMultiplier: multiplier,
      speedLabel,
      badgeColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
      isHighTension: true,
    };
  }

  if (score >= 10) {
    return {
      tierName: 'TURBO',
      speedMultiplier: multiplier,
      speedLabel,
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      isHighTension: false,
    };
  }

  if (score >= 5) {
    return {
      tierName: 'FAST',
      speedMultiplier: multiplier,
      speedLabel,
      badgeColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
      isHighTension: false,
    };
  }

  return {
    tierName: 'NORMAL',
    speedMultiplier: multiplier,
    speedLabel,
    badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    isHighTension: false,
  };
}
