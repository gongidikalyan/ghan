/**
 * Google AdMob & AdSense for Games (H5) Configuration.
 * Connected for production Google Play release.
 */

export const ADMOB_CONFIG = {
  appId: import.meta.env.VITE_ADMOB_APP_ID || 'ca-app-pub-5776267944392683~3263090526',
  interstitialAdUnitId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-5776267944392683/8620193138',
  publisherId: 'pub-5776267944392683',
  isAdsEnabled: true,
} as const;

/**
 * Triggers native or H5 Ad placement across Android WebView wrappers, Capacitor, Cordova, or H5.
 * Returns true if native handled it, or false.
 */
export async function showPlatformAd(): Promise<boolean> {
  if (!ADMOB_CONFIG.isAdsEnabled) {
    return false;
  }

  const win = window as any;

  // 1. Android Native JavascriptInterface (common in Android Studio WebViews)
  if (typeof win.Android?.showInterstitial === 'function') {
    try {
      win.Android.showInterstitial();
      return true;
    } catch {
      // Fallback
    }
  }

  if (typeof win.AndroidInterface?.showInterstitial === 'function') {
    try {
      win.AndroidInterface.showInterstitial();
      return true;
    } catch {
      // Fallback
    }
  }

  // 2. Capacitor AdMob Plugin
  if (win.Capacitor?.Plugins?.AdMob?.showInterstitial) {
    try {
      await win.Capacitor.Plugins.AdMob.showInterstitial();
      return true;
    } catch {
      // Fallback
    }
  }

  // 3. Cordova / PhoneGap AdMob plugin
  if (win.admob?.interstitial) {
    try {
      await win.admob.interstitial.show();
      return true;
    } catch {
      // Fallback
    }
  }

  // 4. Dispatch a custom window event for any custom Android bridge listener
  try {
    const event = new CustomEvent('SHOW_INTERSTITIAL_AD', {
      detail: { adUnitId: ADMOB_CONFIG.interstitialAdUnitId },
    });
    window.dispatchEvent(event);
  } catch {
    // Ignore
  }

  // 5. Google H5 Game Ad Placement API (adBreak) if running in H5 web container
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

  return false;
}
