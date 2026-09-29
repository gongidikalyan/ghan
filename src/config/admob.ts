/**
 * Google AdMob & AdSense for Games (H5) Configuration.
 * Ads are disabled during the Closed Testing phase to prevent accidental
 * tester clicks and account policy violations.
 */

export const ADMOB_CONFIG = {
  appId: import.meta.env.VITE_ADMOB_APP_ID || '',
  interstitialAdUnitId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || '',
  publisherId: '',
  // Ads are only enabled when an Interstitial Ad Unit ID is explicitly configured
  isAdsEnabled: Boolean(import.meta.env.VITE_ADMOB_INTERSTITIAL_ID && import.meta.env.VITE_ADMOB_INTERSTITIAL_ID.trim() !== ''),
} as const;

/**
 * Triggers native or H5 Ad placement if available and enabled.
 * Returns true if native handled it, or false.
 */
export async function showPlatformAd(): Promise<boolean> {
  if (!ADMOB_CONFIG.isAdsEnabled) {
    return false;
  }

  const win = window as any;

  // 1. Google H5 Game Ad Placement API (adBreak) if configured on web
  if (typeof win.adBreak === 'function') {
    return new Promise((resolve) => {
      try {
        win.adBreak({
          type: 'next',
          name: 'interstitial_gameover',
          beforeAd: () => {},
          afterAd: () => resolve(true),
          adBreakDone: (placementInfo: any) => {
            if (placementInfo?.breakStatus === 'dismissed' || placementInfo?.breakStatus === 'viewed') {
              resolve(true);
            } else {
              resolve(false);
            }
          },
        });
      } catch {
        resolve(false);
      }
    });
  }

  // 2. Native Cordova/Capacitor AdMob plugin if wrapped in Android APK
  if (win.admob?.interstitial) {
    try {
      await win.admob.interstitial.show();
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
