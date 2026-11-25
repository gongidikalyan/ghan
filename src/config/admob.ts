/**
 * Google AdMob & AdSense for Games (H5) Configuration.
 * Connected for production Google Play release.
 */

export const ADMOB_CONFIG = {
  appId: import.meta.env.VITE_ADMOB_APP_ID || 'ca-app-pub-5776267944392683~3263090526',
  interstitialAdUnitId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-5776267944392683/8620193138',
  rewardedAdUnitId: import.meta.env.VITE_ADMOB_REWARDED_ID || 'ca-app-pub-5776267944392683/7428238224',
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

/**
 * Preloads the next rewarded ad on native Android / Capacitor / Cordova bridge if available.
 */
export function preloadRewardedAd(): void {
  if (!ADMOB_CONFIG.isAdsEnabled || typeof window === 'undefined') return;
  const win = window as any;
  const preloaders = [
    () => win.Android?.preloadRewardedAd?.(),
    () => win.Android?.preloadRewarded?.(),
    () => win.AndroidInterface?.preloadRewardedAd?.(),
    () => win.JSBridge?.preloadRewardedAd?.(),
    () => win.AdMobBridge?.preloadRewardedAd?.(),
    () => win.AdMob?.preloadRewardedAd?.(),
  ];
  for (const fn of preloaders) {
    try {
      fn();
    } catch {
      // Ignore bridge preload errors
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
      let settled = false;
      const done = (shown: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        forceRepaint();
        resolve(shown);
      };

      const timeout = setTimeout(() => done(false), 5000);

      try {
        win.adBreak({
          type: 'next',
          name: 'interstitial_gameover',
          beforeAd: () => {
            clearTimeout(timeout);
          },
          afterAd: () => {
            done(true);
          },
          adBreakDone: () => {
            done(true);
          },
        });
      } catch {
        done(false);
      }
    });
  }

  // No native platform ad bridge available
  return false;
}

export interface RewardedAdResult {
  rewarded: boolean;
  unavailable?: boolean;
}

/**
 * Triggers a real Rewarded Ad placement to protect/preserve player lives.
 * Supports Android WebView JS bridges, Capacitor, Cordova, and Google H5 Games Ad Placement API.
 * Falls back to a native interstitial bridge ONLY if the wrapper exposes interstitial without a separate rewarded method.
 * Never displays mock or predefined ads.
 */
export async function showRewardedAd(): Promise<RewardedAdResult> {
  if (!ADMOB_CONFIG.isAdsEnabled || typeof window === 'undefined') {
    return { rewarded: false, unavailable: true };
  }

  const win = window as any;

  const waitForReward = (triggerFn: () => boolean | void): Promise<RewardedAdResult> => {
    return new Promise((resolve) => {
      let resolved = false;
      let earnedReward = false;
      let cleanup = () => {};

      const finish = (result: RewardedAdResult) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        forceRepaint();
        resolve(result);
      };

      const onRewardEarned = () => {
        earnedReward = true;
        finish({ rewarded: true });
      };

      const onDismissed = (rewardedFlag?: boolean) => {
        if (rewardedFlag === true || earnedReward) {
          finish({ rewarded: true });
        } else {
          finish({ rewarded: false });
        }
      };

      const onFailed = () => {
        finish({ rewarded: false, unavailable: true });
      };

      // 1. Standard window callbacks from native Android bridge
      const prevOnRewardedCompleted = win.onRewardedAdCompleted;
      const prevOnUserEarnedReward = win.onUserEarnedReward;
      const prevOnRewardEarned = win.onRewardEarned;
      const prevOnRewardedDismissed = win.onRewardedAdDismissed;
      const prevOnRewardedFailed = win.onRewardedAdFailed;

      win.onRewardedAdCompleted = (rewarded?: boolean) => {
        if (typeof prevOnRewardedCompleted === 'function') {
          try { prevOnRewardedCompleted(rewarded); } catch {}
        }
        finish({ rewarded: rewarded !== false });
      };
      win.onUserEarnedReward = () => {
        if (typeof prevOnUserEarnedReward === 'function') {
          try { prevOnUserEarnedReward(); } catch {}
        }
        onRewardEarned();
      };
      win.onRewardEarned = () => {
        if (typeof prevOnRewardEarned === 'function') {
          try { prevOnRewardEarned(); } catch {}
        }
        onRewardEarned();
      };
      win.onRewardedAdDismissed = (rewarded?: boolean) => {
        if (typeof prevOnRewardedDismissed === 'function') {
          try { prevOnRewardedDismissed(rewarded); } catch {}
        }
        onDismissed(rewarded);
      };
      win.onRewardedAdFailed = () => {
        if (typeof prevOnRewardedFailed === 'function') {
          try { prevOnRewardedFailed(); } catch {}
        }
        onFailed();
      };

      // 2. Custom window events
      const rewardEvents = ['rewardedAdCompleted', 'userEarnedReward', 'rewardEarned', 'REWARDED_AD_COMPLETED'];
      const dismissEvents = ['rewardedAdDismissed', 'onRewardedAdDismissed', 'REWARDED_AD_DISMISSED'];
      const failEvents = ['rewardedAdFailed', 'onRewardedAdFailed', 'REWARDED_AD_FAILED'];

      const handleDismissEvent = (evt: Event) => {
        const detail = (evt as CustomEvent)?.detail;
        onDismissed(detail?.rewarded === true);
      };

      rewardEvents.forEach((evt) => window.addEventListener(evt, onRewardEarned));
      dismissEvents.forEach((evt) => window.addEventListener(evt, handleDismissEvent));
      failEvents.forEach((evt) => window.addEventListener(evt, onFailed));

      // 3. Cordova rewarded listeners
      document.addEventListener('admob.rewarded.events.REWARD', onRewardEarned);
      document.addEventListener('admob.rewarded.events.CLOSE', handleDismissEvent);
      document.addEventListener('admob.rewarded.events.LOAD_FAIL', onFailed);

      // 4. Capacitor rewarded listeners
      const capHandles: any[] = [];
      if (win.Capacitor?.Plugins?.AdMob?.addListener) {
        try {
          win.Capacitor.Plugins.AdMob.addListener('onRewardedVideoAdReward', onRewardEarned)
            .then((h: any) => capHandles.push(h))
            .catch(() => {});
          win.Capacitor.Plugins.AdMob.addListener('onRewardedVideoAdDismissed', () => onDismissed(earnedReward))
            .then((h: any) => capHandles.push(h))
            .catch(() => {});
          win.Capacitor.Plugins.AdMob.addListener('onRewardedVideoAdFailedToShow', onFailed)
            .then((h: any) => capHandles.push(h))
            .catch(() => {});
        } catch {
          // Ignore
        }
      }

      // 5. WebView visibility fallback: give the native bridge 1500ms after returning to foreground
      // so explicit onRewardedAdDismissed(earned) / onRewardedAdFailed callbacks always take precedence.
      let hasGoneHidden = false;
      let hiddenStartTime = 0;
      let visibilityFallbackTimer: ReturnType<typeof setTimeout> | null = null;

      const onVisibilityChange = () => {
        if (document.hidden || document.visibilityState === 'hidden') {
          hasGoneHidden = true;
          hiddenStartTime = Date.now();
          if (visibilityFallbackTimer) {
            clearTimeout(visibilityFallbackTimer);
            visibilityFallbackTimer = null;
          }
        } else if (hasGoneHidden) {
          const elapsed = Date.now() - hiddenStartTime;
          if (visibilityFallbackTimer) {
            clearTimeout(visibilityFallbackTimer);
          }
          visibilityFallbackTimer = setTimeout(() => {
            if (resolved) return;
            if (earnedReward) {
              finish({ rewarded: true });
            } else if (elapsed >= 2000) {
              finish({ rewarded: false });
            } else {
              finish({ rewarded: false, unavailable: true });
            }
          }, 1500);
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const safetyTimer = setTimeout(() => {
        finish({ rewarded: earnedReward, unavailable: !earnedReward });
      }, 65000);

      cleanup = () => {
        clearTimeout(safetyTimer);
        if (visibilityFallbackTimer) {
          clearTimeout(visibilityFallbackTimer);
          visibilityFallbackTimer = null;
        }
        document.removeEventListener('visibilitychange', onVisibilityChange);
        document.removeEventListener('admob.rewarded.events.REWARD', onRewardEarned);
        document.removeEventListener('admob.rewarded.events.CLOSE', handleDismissEvent);
        document.removeEventListener('admob.rewarded.events.LOAD_FAIL', onFailed);
        rewardEvents.forEach((evt) => window.removeEventListener(evt, onRewardEarned));
        dismissEvents.forEach((evt) => window.removeEventListener(evt, handleDismissEvent));
        failEvents.forEach((evt) => window.removeEventListener(evt, onFailed));

        capHandles.forEach((h) => {
          try { h?.remove?.(); } catch {}
        });

        win.onRewardedAdCompleted = prevOnRewardedCompleted;
        win.onUserEarnedReward = prevOnUserEarnedReward;
        win.onRewardEarned = prevOnRewardEarned;
        win.onRewardedAdDismissed = prevOnRewardedDismissed;
        win.onRewardedAdFailed = prevOnRewardedFailed;
      };

      try {
        const triggered = triggerFn();
        if (triggered === false) {
          finish({ rewarded: false, unavailable: true });
        }
      } catch {
        finish({ rewarded: false, unavailable: true });
      }
    });
  };

  // 1. Dedicated native Android Rewarded Ad bridges
  if (typeof win.Android?.showRewardedAd === 'function') {
    return waitForReward(() => {
      win.Android.showRewardedAd();
      return true;
    });
  }
  if (typeof win.Android?.showRewarded === 'function') {
    return waitForReward(() => {
      win.Android.showRewarded();
      return true;
    });
  }
  if (typeof win.AndroidInterface?.showRewardedAd === 'function') {
    return waitForReward(() => {
      win.AndroidInterface.showRewardedAd();
      return true;
    });
  }
  if (typeof win.AndroidInterface?.showRewarded === 'function') {
    return waitForReward(() => {
      win.AndroidInterface.showRewarded();
      return true;
    });
  }
  if (typeof win.JSBridge?.showRewardedAd === 'function') {
    return waitForReward(() => {
      win.JSBridge.showRewardedAd();
      return true;
    });
  }
  if (typeof win.AdMobBridge?.showRewardedAd === 'function') {
    return waitForReward(() => {
      win.AdMobBridge.showRewardedAd();
      return true;
    });
  }
  if (typeof win.AdMob?.showRewardedAd === 'function') {
    return waitForReward(() => {
      win.AdMob.showRewardedAd();
      return true;
    });
  }

  // 2. Capacitor AdMob Rewarded Video plugin
  if (win.Capacitor?.Plugins?.AdMob?.showRewardVideoAd) {
    return waitForReward(() => {
      win.Capacitor.Plugins.AdMob.showRewardVideoAd().catch(() => {});
      return true;
    });
  }

  // 3. Cordova AdMob Rewarded plugin
  if (win.admob?.rewarded?.show) {
    return waitForReward(() => {
      win.admob.rewarded.show().catch(() => {});
      return true;
    });
  }

  // 4. Custom rewarded ad callback
  if (typeof win.onCustomRewardedAdRequest === 'function') {
    return waitForReward(() => {
      win.onCustomRewardedAdRequest(ADMOB_CONFIG.rewardedAdUnitId || ADMOB_CONFIG.interstitialAdUnitId);
      return true;
    });
  }

  // 5. Fallback to existing native Android interstitial bridge if APK doesn't expose a separate rewarded method yet
  const hasNativeInterstitialBridge = !!(
    win.Android?.showInterstitial ||
    win.Android?.showAd ||
    win.AndroidInterface?.showInterstitial ||
    win.AndroidInterface?.showAd ||
    win.JSBridge?.showInterstitial ||
    win.AdMobBridge?.showInterstitial ||
    win.AdMob?.showInterstitial ||
    win.Capacitor?.Plugins?.AdMob?.showInterstitial ||
    win.admob?.interstitial ||
    win.onCustomAdRequest
  );

  if (hasNativeInterstitialBridge) {
    const shown = await showPlatformAd();
    return shown ? { rewarded: true } : { rewarded: false, unavailable: true };
  }

  // 6. Dispatch custom event for WebView interceptors
  if (typeof win.dispatchEvent === 'function') {
    try {
      win.dispatchEvent(new CustomEvent('requestAdMobRewarded', {
        detail: {
          appId: ADMOB_CONFIG.appId,
          adUnitId: ADMOB_CONFIG.rewardedAdUnitId || ADMOB_CONFIG.interstitialAdUnitId,
          publisherId: ADMOB_CONFIG.publisherId,
        },
      }));
    } catch {}
  }

  // 7. Google H5 Games Ad Placement API (Rewarded placement)
  if (typeof win.adBreak === 'function') {
    return new Promise((resolve) => {
      let settled = false;
      const done = (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        forceRepaint();
        resolve(result);
      };

      const timeout = setTimeout(() => {
        done({ rewarded: false, unavailable: true });
      }, 10000);

      try {
        win.adBreak({
          type: 'reward',
          name: 'protect_life',
          beforeAd: () => {
            clearTimeout(timeout);
          },
          afterAd: () => {
            forceRepaint();
          },
          beforeReward: (showAdFn: () => void) => {
            clearTimeout(timeout);
            try {
              showAdFn();
            } catch {
              done({ rewarded: false, unavailable: true });
            }
          },
          adDismissed: () => {
            done({ rewarded: false });
          },
          adViewed: () => {
            done({ rewarded: true });
          },
          adBreakDone: (placementInfo: any) => {
            if (placementInfo?.breakStatus === 'viewed') {
              done({ rewarded: true });
            } else if (placementInfo?.breakStatus === 'dismissed') {
              done({ rewarded: false });
            } else {
              done({ rewarded: false, unavailable: true });
            }
          },
        });
      } catch {
        done({ rewarded: false, unavailable: true });
      }
    });
  }

  return { rewarded: false, unavailable: true };
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
      win.Android?.showRewardedAd ||
      win.Android?.showRewarded ||
      win.Android?.showInterstitial ||
      win.Android?.showAd ||
      win.AndroidInterface?.showRewardedAd ||
      win.AndroidInterface?.showInterstitial ||
      win.AndroidInterface?.showAd ||
      win.JSBridge?.showRewardedAd ||
      win.JSBridge?.showInterstitial ||
      win.AdMobBridge?.showRewardedAd ||
      win.AdMobBridge?.showInterstitial ||
      win.Capacitor?.Plugins?.AdMob ||
      win.admob?.rewarded ||
      win.admob?.interstitial ||
      win.adBreak
    );
  },
  showAd: () => showPlatformAd(),
  showRewardedAd: () => showRewardedAd(),
  preload: () => preloadPlatformAd(),
  preloadRewarded: () => preloadRewardedAd(),
  onDismiss: (shown = true) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adDismissed', { detail: { shown } }));
    }
  },
  onRewardEarned: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rewardedAdCompleted', { detail: { rewarded: true } }));
    }
  },
  onRewardDismissed: (rewarded = false) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rewardedAdDismissed', { detail: { rewarded } }));
    }
  },
  onFailed: (reason = '') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adFailed', { detail: { reason } }));
      window.dispatchEvent(new CustomEvent('rewardedAdFailed', { detail: { reason } }));
    }
  },
};

if (typeof window !== 'undefined') {
  (window as any).admobConnector = admobConnector;
  (window as any).AdMobConnector = admobConnector;
}
