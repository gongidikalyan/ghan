/**
 * Google AdMob & AdSense for Games (H5) Configuration.
 */

export const ADMOB_CONFIG = {
  appId: import.meta.env.VITE_ADMOB_APP_ID || 'ca-app-pub-5776267944392683~3263090526',
  interstitialAdUnitId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-5776267944392683/8620193138',
  publisherId: 'ca-app-pub-5776267944392683',
} as const;

/**
 * Triggers native or H5 Ad placement if available in environment,
 * returns true if native handled it, or false to use in-app interstitial player.
 */
export async function showPlatformAd(): Promise<boolean> {
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

  // Default: Return false so App.tsx displays the high-fidelity in-app interstitial modal
  return false;
}
