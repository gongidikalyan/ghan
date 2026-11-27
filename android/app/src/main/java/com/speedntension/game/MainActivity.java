package com.speedntension.game;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import android.view.View;
import android.webkit.JavascriptInterface;
import androidx.annotation.NonNull;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.OnUserEarnedRewardListener;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SpeedNTensionAds";

    // Live production AdMob unit IDs
    private static final String LIVE_AD_UNIT_ID = "ca-app-pub-5776267944392683/8620193138";
    private static final String LIVE_REWARDED_AD_UNIT_ID = "ca-app-pub-5776267944392683/7428238224";

    private static final int LIGHT_BG_COLOR = Color.parseColor("#f8fafc");

    private InterstitialAd mInterstitialAd;
    private boolean mIsLoadingAd = false;
    private boolean mShowWhenLoaded = false;
    private boolean mIsShowingInterstitial = false;
    private Runnable mInterstitialTimeoutRunnable;

    private RewardedAd mRewardedAd;
    private boolean mIsLoadingRewardedAd = false;
    private boolean mShowRewardedWhenLoaded = false;
    private boolean mIsShowingRewarded = false;
    private boolean mUserEarnedReward = false;
    private Runnable mRewardedTimeoutRunnable;

    // Track Activity foreground state so JS callbacks never fire into a paused WebView
    private boolean mIsActivityResumed = false;
    private Boolean mPendingRewardedDismissed = null;
    private boolean mPendingRewardedFailed = false;
    private Boolean mPendingInterstitialResult = null;

    private final Handler mHandler = new Handler(Looper.getMainLooper());
    private boolean mInterfaceAttached = false;
    private long mLastAdDismissedAtMs = 0L;
    private static final long AD_COOLDOWN_MS = 2000L;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Enforce hardware acceleration and light background before activity initialization
        getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
        getWindow().setBackgroundDrawable(new ColorDrawable(LIGHT_BG_COLOR));

        super.onCreate(savedInstanceState);

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            android.webkit.WebView.setWebContentsDebuggingEnabled(true);
        }

        applyLightBackgrounds();

        // Initialize MobileAds on main UI thread as required by AdMob SDK
        try {
            MobileAds.initialize(this, initializationStatus -> {
                Log.d(TAG, "MobileAds initialized successfully");
                loadInterstitialAd();
                loadRewardedAd();
            });
        } catch (Exception e) {
            Log.e(TAG, "Error initializing MobileAds", e);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        mIsActivityResumed = true;
        applyLightBackgrounds();

        // Flush any ad completion callbacks that arrived right before Activity resumed
        flushPendingAdCallbacks();

        if (mInterstitialAd == null && !mIsLoadingAd && !mIsShowingInterstitial) {
            loadInterstitialAd();
        }
        if (mRewardedAd == null && !mIsLoadingRewardedAd && !mIsShowingRewarded) {
            loadRewardedAd();
        }
    }

    @Override
    public void onPause() {
        mIsActivityResumed = false;
        super.onPause();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyLightBackgrounds();
            flushPendingAdCallbacks();
        }
    }

    private void applyLightBackgrounds() {
        getWindow().setBackgroundDrawable(new ColorDrawable(LIGHT_BG_COLOR));
        if (getWindow().getDecorView() != null) {
            getWindow().getDecorView().setBackgroundColor(LIGHT_BG_COLOR);
        }

        View content = findViewById(android.R.id.content);
        if (content != null) {
            content.setBackgroundColor(LIGHT_BG_COLOR);
        }

        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().setBackgroundColor(LIGHT_BG_COLOR);
            bridge.getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
            bridge.getWebView().setVerticalScrollBarEnabled(false);
            bridge.getWebView().setHorizontalScrollBarEnabled(false);
            if (bridge.getWebView().getParent() instanceof View) {
                ((View) bridge.getWebView().getParent()).setBackgroundColor(LIGHT_BG_COLOR);
            }
            if (!mInterfaceAttached) {
                mInterfaceAttached = true;
                bridge.getWebView().addJavascriptInterface(this, "Android");
                bridge.getWebView().addJavascriptInterface(this, "AndroidInterface");
                bridge.getWebView().addJavascriptInterface(this, "AdMobBridge");
            }
        }
    }

    private void cancelInterstitialTimeout() {
        if (mInterstitialTimeoutRunnable != null) {
            mHandler.removeCallbacks(mInterstitialTimeoutRunnable);
            mInterstitialTimeoutRunnable = null;
        }
    }

    private void cancelRewardedTimeout() {
        if (mRewardedTimeoutRunnable != null) {
            mHandler.removeCallbacks(mRewardedTimeoutRunnable);
            mRewardedTimeoutRunnable = null;
        }
    }

    private void flushPendingAdCallbacks() {
        if (mPendingRewardedDismissed != null) {
            final boolean earned = mPendingRewardedDismissed;
            mPendingRewardedDismissed = null;
            dispatchRewardedDismissedJs(earned);
        }
        if (mPendingRewardedFailed) {
            mPendingRewardedFailed = false;
            dispatchRewardedFailedJs();
        }
        if (mPendingInterstitialResult != null) {
            final boolean shown = mPendingInterstitialResult;
            mPendingInterstitialResult = null;
            dispatchInterstitialResultJs(shown);
        }
    }

    private void loadInterstitialAd() {
        if (mIsLoadingAd || mInterstitialAd != null) {
            return;
        }

        mIsLoadingAd = true;
        Log.d(TAG, "Loading live interstitial ad: " + LIVE_AD_UNIT_ID);

        AdRequest adRequest = new AdRequest.Builder().build();
        InterstitialAd.load(
            this,
            LIVE_AD_UNIT_ID,
            adRequest,
            new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
                    mInterstitialAd = interstitialAd;
                    mIsLoadingAd = false;
                    Log.d(TAG, "Live interstitial ad loaded successfully and ready");

                    mInterstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdDismissedFullScreenContent() {
                            Log.d(TAG, "Interstitial Ad dismissed by player");
                            mIsShowingInterstitial = false;
                            mShowWhenLoaded = false;
                            mLastAdDismissedAtMs = SystemClock.elapsedRealtime();
                            cancelInterstitialTimeout();
                            mInterstitialAd = null;
                            notifyAdResult(true);
                            mHandler.postDelayed(() -> loadInterstitialAd(), 1500);
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                            Log.e(TAG, "Interstitial Ad failed to show: " + adError.getMessage());
                            mIsShowingInterstitial = false;
                            mShowWhenLoaded = false;
                            cancelInterstitialTimeout();
                            mInterstitialAd = null;
                            notifyAdResult(false);
                            mHandler.postDelayed(() -> loadInterstitialAd(), 1500);
                        }
                    });

                    // Only show if explicitly waiting and no ad is currently showing
                    if (mShowWhenLoaded && !mIsShowingInterstitial && !mIsShowingRewarded) {
                        mShowWhenLoaded = false;
                        cancelInterstitialTimeout();
                        runOnUiThread(() -> displayLoadedInterstitialAd());
                    }
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    mIsLoadingAd = false;
                    mInterstitialAd = null;
                    Log.w(TAG, "Live interstitial ad failed to load: Code " + loadAdError.getCode() + " (" + loadAdError.getMessage() + ")");

                    if (mShowWhenLoaded) {
                        mShowWhenLoaded = false;
                        cancelInterstitialTimeout();
                        notifyAdResult(false);
                    }

                    // Retry preloading after 15 seconds if idle
                    mHandler.postDelayed(() -> {
                        if (mInterstitialAd == null && !mIsLoadingAd && !mIsShowingInterstitial) {
                            loadInterstitialAd();
                        }
                    }, 15000);
                }
            }
        );
    }

    private void displayLoadedInterstitialAd() {
        if (mIsShowingInterstitial || mIsShowingRewarded) {
            Log.d(TAG, "Skipping interstitial show: another fullscreen ad is already active");
            return;
        }
        if (mInterstitialAd == null) {
            notifyAdResult(false);
            return;
        }

        final InterstitialAd adToShow = mInterstitialAd;
        mInterstitialAd = null;
        mShowWhenLoaded = false;
        cancelInterstitialTimeout();
        mIsShowingInterstitial = true;

        try {
            adToShow.show(MainActivity.this);
        } catch (Exception e) {
            Log.e(TAG, "Exception while showing interstitial ad", e);
            mIsShowingInterstitial = false;
            notifyAdResult(false);
            mHandler.postDelayed(() -> loadInterstitialAd(), 1500);
        }
    }

    @JavascriptInterface
    public void preloadInterstitial() {
        runOnUiThread(() -> {
            if (mInterstitialAd == null && !mIsLoadingAd && !mIsShowingInterstitial) {
                Log.d(TAG, "Preload requested by game bridge");
                loadInterstitialAd();
            }
        });
    }

    @JavascriptInterface
    public void showInterstitial() {
        runOnUiThread(() -> {
            if (mIsShowingInterstitial || mIsShowingRewarded) {
                Log.d(TAG, "Ignoring showInterstitial: an ad is already showing");
                return;
            }
            if (SystemClock.elapsedRealtime() - mLastAdDismissedAtMs < AD_COOLDOWN_MS) {
                Log.d(TAG, "Ignoring showInterstitial: post-ad cooldown active");
                notifyAdResult(false);
                return;
            }
            Log.d(TAG, "Displaying Interstitial Ad requested by game");

            if (mInterstitialAd != null) {
                Log.d(TAG, "Displaying ready Interstitial Ad");
                displayLoadedInterstitialAd();
            } else {
                Log.d(TAG, "Interstitial Ad not ready yet; requesting load...");
                mShowWhenLoaded = true;
                loadInterstitialAd();

                cancelInterstitialTimeout();
                mInterstitialTimeoutRunnable = () -> {
                    if (mShowWhenLoaded) {
                        Log.w(TAG, "Ad load timeout reached; proceeding without ad");
                        mShowWhenLoaded = false;
                        mInterstitialTimeoutRunnable = null;
                        notifyAdResult(false);
                    }
                };
                mHandler.postDelayed(mInterstitialTimeoutRunnable, 3500);
            }
        });
    }

    @JavascriptInterface
    public void showAd() {
        showInterstitial();
    }

    @JavascriptInterface
    public boolean isAdLoaded() {
        return mInterstitialAd != null;
    }

    private void notifyAdResult(final boolean shown) {
        runOnUiThread(() -> {
            if (mIsActivityResumed) {
                dispatchInterstitialResultJs(shown);
            } else {
                mPendingInterstitialResult = shown;
                mHandler.postDelayed(this::flushPendingAdCallbacks, 250);
            }
        });
    }

    private void dispatchInterstitialResultJs(final boolean shown) {
        applyLightBackgrounds();
        if (bridge != null && bridge.getWebView() != null) {
            String js = shown
                ? "if (typeof window.onNativeAdClosed === 'function') { window.onNativeAdClosed(true); } " +
                  "if (typeof window.onAdClosed === 'function') { window.onAdClosed(true); } " +
                  "if (typeof window.onInterstitialDismissed === 'function') { window.onInterstitialDismissed(true); } " +
                  "window.dispatchEvent(new CustomEvent('adClosed', { detail: { shown: true } }));"
                : "if (typeof window.onNativeAdClosed === 'function') { window.onNativeAdClosed(false); } " +
                  "if (typeof window.onAdClosed === 'function') { window.onAdClosed(false); } " +
                  "if (typeof window.onAdFailed === 'function') { window.onAdFailed(); } " +
                  "if (typeof window.onInterstitialFailed === 'function') { window.onInterstitialFailed(); } " +
                  "window.dispatchEvent(new CustomEvent('adClosed', { detail: { shown: false } }));";
            bridge.getWebView().evaluateJavascript(js, null);
        }
    }

    private void loadRewardedAd() {
        if (mIsLoadingRewardedAd || mRewardedAd != null) {
            return;
        }

        mIsLoadingRewardedAd = true;
        Log.d(TAG, "Loading live rewarded ad: " + LIVE_REWARDED_AD_UNIT_ID);

        AdRequest adRequest = new AdRequest.Builder().build();
        RewardedAd.load(
            this,
            LIVE_REWARDED_AD_UNIT_ID,
            adRequest,
            new RewardedAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull RewardedAd rewardedAd) {
                    mRewardedAd = rewardedAd;
                    mIsLoadingRewardedAd = false;
                    Log.d(TAG, "Live rewarded ad loaded successfully and ready");

                    mRewardedAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdShowedFullScreenContent() {
                            Log.d(TAG, "Rewarded Ad showed fullscreen content");
                        }

                        @Override
                        public void onAdDismissedFullScreenContent() {
                            final boolean earned = mUserEarnedReward;
                            Log.d(TAG, "Rewarded Ad dismissed by player (earned=" + earned + ")");
                            mIsShowingRewarded = false;
                            mShowRewardedWhenLoaded = false;
                            mLastAdDismissedAtMs = SystemClock.elapsedRealtime();
                            cancelRewardedTimeout();
                            mRewardedAd = null;
                            mUserEarnedReward = false;
                            notifyRewardedAdDismissed(earned);
                            // Delay next preload slightly so it never interferes with resuming gameplay
                            mHandler.postDelayed(() -> loadRewardedAd(), 1500);
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                            Log.e(TAG, "Rewarded Ad failed to show: " + adError.getMessage());
                            mIsShowingRewarded = false;
                            mShowRewardedWhenLoaded = false;
                            cancelRewardedTimeout();
                            mRewardedAd = null;
                            mUserEarnedReward = false;
                            notifyRewardedAdFailed();
                            mHandler.postDelayed(() -> loadRewardedAd(), 1500);
                        }
                    });

                    // Only auto-display if player is actively waiting AND no ad is already showing
                    if (mShowRewardedWhenLoaded && !mIsShowingRewarded && !mIsShowingInterstitial) {
                        mShowRewardedWhenLoaded = false;
                        cancelRewardedTimeout();
                        runOnUiThread(() -> displayLoadedRewardedAd());
                    }
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    mIsLoadingRewardedAd = false;
                    mRewardedAd = null;
                    Log.w(TAG, "Live rewarded ad failed to load: Code " + loadAdError.getCode() + " (" + loadAdError.getMessage() + ")");

                    if (mShowRewardedWhenLoaded) {
                        mShowRewardedWhenLoaded = false;
                        cancelRewardedTimeout();
                        notifyRewardedAdFailed();
                    }

                    // Retry preloading after 15 seconds if idle
                    mHandler.postDelayed(() -> {
                        if (mRewardedAd == null && !mIsLoadingRewardedAd && !mIsShowingRewarded) {
                            loadRewardedAd();
                        }
                    }, 15000);
                }
            }
        );
    }

    private void displayLoadedRewardedAd() {
        if (mIsShowingRewarded || mIsShowingInterstitial) {
            Log.d(TAG, "Skipping rewarded show: another fullscreen ad is already active");
            return;
        }
        if (mRewardedAd == null) {
            notifyRewardedAdFailed();
            return;
        }

        // Clear reference BEFORE showing so the same ad object can never be shown twice
        final RewardedAd adToShow = mRewardedAd;
        mRewardedAd = null;
        mShowRewardedWhenLoaded = false;
        cancelRewardedTimeout();
        mIsShowingRewarded = true;
        mUserEarnedReward = false;

        try {
            adToShow.show(MainActivity.this, new OnUserEarnedRewardListener() {
                @Override
                public void onUserEarnedReward(@NonNull RewardItem rewardItem) {
                    int rewardAmount = rewardItem.getAmount();
                    String rewardType = rewardItem.getType();
                    Log.d(TAG, "User earned reward: " + rewardAmount + " " + rewardType);
                    mUserEarnedReward = true;
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Exception while showing rewarded ad", e);
            mIsShowingRewarded = false;
            mUserEarnedReward = false;
            notifyRewardedAdFailed();
            mHandler.postDelayed(() -> loadRewardedAd(), 1500);
        }
    }

    @JavascriptInterface
    public void preloadRewardedAd() {
        runOnUiThread(() -> {
            if (mRewardedAd == null && !mIsLoadingRewardedAd && !mIsShowingRewarded) {
                Log.d(TAG, "Rewarded preload requested by game bridge");
                loadRewardedAd();
            }
        });
    }

    @JavascriptInterface
    public void preloadRewarded() {
        preloadRewardedAd();
    }

    @JavascriptInterface
    public void showRewardedAd() {
        runOnUiThread(() -> {
            if (mIsShowingRewarded || mIsShowingInterstitial) {
                Log.d(TAG, "Ignoring showRewardedAd: an ad is already showing");
                return;
            }
            if (SystemClock.elapsedRealtime() - mLastAdDismissedAtMs < AD_COOLDOWN_MS) {
                Log.d(TAG, "Ignoring showRewardedAd: post-ad cooldown active");
                notifyRewardedAdFailed();
                return;
            }
            Log.d(TAG, "Displaying Rewarded Ad requested by game");

            if (mRewardedAd != null) {
                Log.d(TAG, "Displaying ready Rewarded Ad");
                displayLoadedRewardedAd();
            } else {
                Log.d(TAG, "Rewarded Ad not ready yet; requesting load...");
                mShowRewardedWhenLoaded = true;
                loadRewardedAd();

                // Cancel any prior timeout before setting a fresh 8-second wait
                cancelRewardedTimeout();
                mRewardedTimeoutRunnable = () -> {
                    if (mShowRewardedWhenLoaded) {
                        Log.w(TAG, "Rewarded Ad load timeout reached");
                        mShowRewardedWhenLoaded = false;
                        mRewardedTimeoutRunnable = null;
                        notifyRewardedAdFailed();
                    }
                };
                mHandler.postDelayed(mRewardedTimeoutRunnable, 8000);
            }
        });
    }

    @JavascriptInterface
    public void showRewarded() {
        showRewardedAd();
    }

    @JavascriptInterface
    public boolean isRewardedAdLoaded() {
        return mRewardedAd != null;
    }

    private void notifyRewardedAdDismissed(final boolean rewarded) {
        runOnUiThread(() -> {
            if (mIsActivityResumed) {
                dispatchRewardedDismissedJs(rewarded);
            } else {
                mPendingRewardedDismissed = rewarded;
                mHandler.postDelayed(this::flushPendingAdCallbacks, 250);
            }
        });
    }

    private void dispatchRewardedDismissedJs(final boolean rewarded) {
        applyLightBackgrounds();
        if (bridge != null && bridge.getWebView() != null) {
            String js = rewarded
                ? "if (typeof window.onRewardedAdDismissed === 'function') { window.onRewardedAdDismissed(true); } " +
                  "else if (typeof window.onRewardedAdCompleted === 'function') { window.onRewardedAdCompleted(true); } " +
                  "window.dispatchEvent(new CustomEvent('rewardedAdDismissed', { detail: { rewarded: true } }));"
                : "if (typeof window.onRewardedAdDismissed === 'function') { window.onRewardedAdDismissed(false); } " +
                  "window.dispatchEvent(new CustomEvent('rewardedAdDismissed', { detail: { rewarded: false } }));";
            bridge.getWebView().evaluateJavascript(js, null);
        }
    }

    private void notifyRewardedAdFailed() {
        runOnUiThread(() -> {
            if (mIsActivityResumed) {
                dispatchRewardedFailedJs();
            } else {
                mPendingRewardedFailed = true;
                mHandler.postDelayed(this::flushPendingAdCallbacks, 250);
            }
        });
    }

    private void dispatchRewardedFailedJs() {
        applyLightBackgrounds();
        if (bridge != null && bridge.getWebView() != null) {
            String js =
                "if (typeof window.onRewardedAdFailed === 'function') { window.onRewardedAdFailed(); } " +
                "window.dispatchEvent(new CustomEvent('rewardedAdFailed', { detail: { reason: 'unavailable' } }));";
            bridge.getWebView().evaluateJavascript(js, null);
        }
    }
}
