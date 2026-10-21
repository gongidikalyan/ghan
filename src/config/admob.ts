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
 * Triggers a multi-stage hardware repaint reflow in Android WebView to prevent
 * blank / white canvas issues when returning from native overlays or ads.
 */
export function forceRepaint(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    // A single non-disruptive offset read to flush pending DOM/style updates to the compositor
    // without triggering window resize events or layout thrashing.
    void document.body?.offsetHeight;
  } catch {
    // Ignore reflow errors
  }
}

/**
 * Triggers native or H5 Ad placement across Android WebView wrappers, Capacitor, Cordova, or H5.
 * Returns a Promise that resolves:
 * - true: native or platform ad was shown AND completed/dismissed
 * - false: no native/platform ad available or failed (caller should display in-app fallback modal)
 */
/**
 * Preloads the next interstitial ad on native Android bridge if available.
 */
export function preloadPlatformAd(): void {
  if (!ADMOB_CONFIG.isAdsEnabled) return;
  const win = window as any;
  if (typeof win.Android?.preloadInterstitial === 'function') {
    try {
      win.Android.preloadInterstitial();
    } catch {
      // Ignore
    }
  }
}

export async function showPlatformAd(): Promise<boolean> {
  if (!ADMOB_CONFIG.isAdsEnabled) {
    return false;
  }

  const win = window as any;

  // Helper to create a promise that waits for ad dismissal event
  const waitForDismissal = (triggerFn: () => boolean | void): Promise<boolean> => {
    return new Promise((resolve) => {
      let resolved = false;
      let cleanup = () => {};

      const handleDismiss = (wasHandled = true) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        forceRepaint();
        resolve(wasHandled);
      };

      // Exact handler reference for custom window events so removeEventListener matches
      const onEventDismiss = () => handleDismiss(true);

      // 1. Listen for standard window callbacks from Android Native bridge
      const prevOnNativeClosed = win.onNativeAdClosed;
      const prevOnDismiss = win.onInterstitialDismissed;
      const prevOnAdClosed = win.onAdClosed;
      const prevOnAdDismissed = win.onAdDismissed;

      win.onNativeAdClosed = (shown?: boolean) => {
        if (typeof prevOnNativeClosed === 'function') {
          try { prevOnNativeClosed(shown); } catch {}
        }
        handleDismiss(shown !== false);
      };
      win.onInterstitialDismissed = (shown?: boolean) => {
        if (typeof prevOnDismiss === 'function') {
          try { prevOnDismiss(shown); } catch {}
        }
        handleDismiss(shown !== false);
      };
      win.onAdClosed = (shown?: boolean) => {
        if (typeof prevOnAdClosed === 'function') {
          try { prevOnAdClosed(shown); } catch {}
        }
        handleDismiss(shown !== false);
      };
      win.onAdDismissed = () => {
        if (typeof prevOnAdDismissed === 'function') {
          try { prevOnAdDismissed(); } catch {}
        }
        handleDismiss(true);
      };

      // 2. Custom window events dispatched by native bridge
      const events = [
        'adDismissed',
        'onAdDismissed',
        'interstitialDismissed',
        'adClosed',
        'onAdClosed',
        'INTERSTITIAL_CLOSED',
      ];
      events.forEach((evt) => window.addEventListener(evt, onEventDismiss));

      // 3. Document Cordova listener
      const cordovaCloseHandler = () => handleDismiss(true);
      document.addEventListener('admob.interstitial.events.CLOSE', cordovaCloseHandler);

      // 4. Capacitor event listener
      let capacitorListenerHandle: any = null;
      if (win.Capacitor?.Plugins?.AdMob?.addListener) {
        try {
          win.Capacitor.Plugins.AdMob.addListener('interstitialDismissed', onEventDismiss).then((h: any) => {
            capacitorListenerHandle = h;
          }).catch(() => {});
        } catch {
          // Ignore
        }
      }

      // 5. Native blur/focus & visibility tracking:
      // When a native ad opens, the WebView loses focus and enters background (document.hidden).
      // ONLY when user actually closes the ad does the WebView return to foreground.
      let hasGoneHidden = false;
      let hiddenStartTime = 0;

      const onVisibilityChange = () => {
        if (document.hidden || document.visibilityState === 'hidden') {
          hasGoneHidden = true;
          hiddenStartTime = Date.now();
        } else if (hasGoneHidden) {
          // Native ad activity was dismissed and WebView returned to foreground.
          // Require at least 800ms of hidden state to ensure user was actually viewing
          // the ad, not a split-second window animation transition!
          const elapsed = Date.now() - hiddenStartTime;
          if (elapsed >= 800) {
            handleDismiss(true);
          }
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const onWindowFocus = () => {
        if (hasGoneHidden && (Date.now() - hiddenStartTime >= 800)) {
          handleDismiss(true);
        }
      };
      window.addEventListener('focus', onWindowFocus);
      window.addEventListener('pageshow', onWindowFocus);

      // Listen for explicit failure from native Android (e.g. ad failed to load / no fill)
      win.onInterstitialFailed = () => {
        handleDismiss(false);
      };
      win.onAdFailed = () => {
        handleDismiss(false);
      };

      // Safety timeout: 60 seconds maximum in case native ad activity stays open and never emits
      const safetyTimer = setTimeout(() => {
        handleDismiss(true);
      }, 60000);

      cleanup = () => {
        clearTimeout(safetyTimer);
        window.removeEventListener('focus', onWindowFocus);
        window.removeEventListener('pageshow', onWindowFocus);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        document.removeEventListener('admob.interstitial.events.CLOSE', cordovaCloseHandler);
        events.forEach((evt) => window.removeEventListener(evt, onEventDismiss));

        if (capacitorListenerHandle?.remove) {
          try {
            capacitorListenerHandle.remove();
          } catch {}
        }

        win.onNativeAdClosed = prevOnNativeClosed;
        win.onInterstitialDismissed = prevOnDismiss;
        win.onAdClosed = prevOnAdClosed;
        win.onAdDismissed = prevOnAdDismissed;
      };

      try {
        const triggered = triggerFn();
        if (triggered === false) {
          cleanup();
          resolve(false);
        }
      } catch {
        cleanup();
        resolve(false);
      }
    });
  };

  // 1. Android Native JavascriptInterface (standard Android Studio WebViews)
  if (typeof win.Android?.showInterstitial === 'function') {
    return waitForDismissal(() => {
      win.Android.showInterstitial();
      return true;
    });
  }

  if (typeof win.Android?.showAd === 'function') {
    return waitForDismissal(() => {
      win.Android.showAd();
      return true;
    });
  }

  if (typeof win.AndroidInterface?.showInterstitial === 'function') {
    return waitForDismissal(() => {
      win.AndroidInterface.showInterstitial();
      return true;
    });
  }

  if (typeof win.AndroidInterface?.showAd === 'function') {
    return waitForDismissal(() => {
      win.AndroidInterface.showAd();
      return true;
    });
  }

  if (typeof win.JSBridge?.showInterstitial === 'function') {
    return waitForDismissal(() => {
      win.JSBridge.showInterstitial();
      return true;
    });
  }

  if (typeof win.AdMobBridge?.showInterstitial === 'function') {
    return waitForDismissal(() => {
      win.AdMobBridge.showInterstitial();
      return true;
    });
  }

  if (typeof win.AdMob?.showInterstitial === 'function') {
    return waitForDismissal(() => {
      win.AdMob.showInterstitial();
      return true;
    });
  }

  // 2. Capacitor AdMob Plugin
  if (win.Capacitor?.Plugins?.AdMob?.showInterstitial) {
    return waitForDismissal(() => {
      win.Capacitor.Plugins.AdMob.showInterstitial().catch(() => {});
      return true;
    });
  }

  // 3. Cordova / PhoneGap AdMob plugin
  if (win.admob?.interstitial) {
    return waitForDismissal(() => {
      win.admob.interstitial.show().catch(() => {});
      return true;
    });
  }

  // 4. Custom Android bridge event listener
  if (typeof win.onCustomAdRequest === 'function') {
    return waitForDismissal(() => {
      win.onCustomAdRequest(ADMOB_CONFIG.interstitialAdUnitId);
      return true;
    });
  }

  // 5. Dispatch standard CustomEvent so custom WebView handlers can intercept
  if (typeof win.dispatchEvent === 'function') {
    try {
      win.dispatchEvent(new CustomEvent('requestAdMobInterstitial', {
        detail: {
          appId: ADMOB_CONFIG.appId,
          adUnitId: ADMOB_CONFIG.interstitialAdUnitId,
          publisherId: ADMOB_CONFIG.publisherId,
        },
      }));
    } catch {}
  }

  // 6. Google H5 Game Ad Placement API (adBreak)
  if (typeof win.adBreak === 'function') {
    return new Promise((resolve) => {
      try {
        win.adBreak({
          type: 'next',
          name: 'interstitial_gameover',
          beforeAd: () => {},
          afterAd: () => {
            forceRepaint();
            resolve(true);
          },
          adBreakDone: (placementInfo: any) => {
            forceRepaint();
            resolve(true);
          },
        });
      } catch {
        resolve(false);
      }
    });
  }

  // No native platform ad bridge available
  return false;
}

/**
 * Universal AdMob Connector for Android Studio & WebView wrappers
 */
export const admobConnector = {
  config: ADMOB_CONFIG,
  isNativeDetected: (): boolean => {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(
      win.Android?.showInterstitial ||
      win.Android?.showAd ||
      win.AndroidInterface?.showInterstitial ||
      win.AndroidInterface?.showAd ||
      win.JSBridge?.showInterstitial ||
      win.AdMobBridge?.showInterstitial ||
      win.Capacitor?.Plugins?.AdMob ||
      win.admob?.interstitial ||
      win.adBreak
    );
  },
  showAd: () => showPlatformAd(),
  preload: () => preloadPlatformAd(),
  onDismiss: (shown = true) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adDismissed', { detail: { shown } }));
    }
  },
  onFailed: (reason = '') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adFailed', { detail: { reason } }));
    }
  },
};

if (typeof window !== 'undefined') {
  (window as any).admobConnector = admobConnector;
  (window as any).AdMobConnector = admobConnector;
}
