package com.speedntension.game;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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

    private RewardedAd mRewardedAd;
    private boolean mIsLoadingRewardedAd = false;
    private boolean mShowRewardedWhenLoaded = false;
    private boolean mUserEarnedReward = false;

    private final Handler mHandler = new Handler(Looper.getMainLooper());

    private boolean mInterfaceAttached = false;

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

        // 1. Initialize MobileAds on main UI thread as required by AdMob SDK
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
        applyLightBackgrounds();
        if (mInterstitialAd == null && !mIsLoadingAd) {
            loadInterstitialAd();
        }
        if (mRewardedAd == null && !mIsLoadingRewardedAd) {
            loadRewardedAd();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyLightBackgrounds();
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
                            mInterstitialAd = null;
                            loadInterstitialAd();
                            notifyAdResult(true);
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                            Log.e(TAG, "Interstitial Ad failed to show: " + adError.getMessage());
                            mInterstitialAd = null;
                            loadInterstitialAd();
                            notifyAdResult(false);
                        }
                    });

                    // If show was requested while ad was loading, show it immediately
                    if (mShowWhenLoaded) {
                        mShowWhenLoaded = false;
                        runOnUiThread(() -> mInterstitialAd.show(MainActivity.this));
                    }
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    mIsLoadingAd = false;
                    mInterstitialAd = null;
                    Log.w(TAG, "Live interstitial ad failed to load: Code " + loadAdError.getCode() + " (" + loadAdError.getMessage() + ")");

                    if (mShowWhenLoaded) {
                        mShowWhenLoaded = false;
                        notifyAdResult(false);
                    }

                    // Retry preloading after 15 seconds if idle
                    mHandler.postDelayed(() -> {
                        if (mInterstitialAd == null && !mIsLoadingAd) {
                            loadInterstitialAd();
                        }
                    }, 15000);
                }
            }
        );
    }

    @JavascriptInterface
    public void preloadInterstitial() {
        runOnUiThread(() -> {
            if (mInterstitialAd == null && !mIsLoadingAd) {
                Log.d(TAG, "Preload requested by game bridge");
                loadInterstitialAd();
            }
        });
    }

    @JavascriptInterface
    public void showInterstitial() {
        runOnUiThread(() -> {
            Log.d(TAG, "Displaying Interstitial Ad requested by game");

            if (mInterstitialAd != null) {
                Log.d(TAG, "Displaying ready Interstitial Ad");
                mInterstitialAd.show(MainActivity.this);
            } else {
                Log.d(TAG, "Interstitial Ad not ready yet; requesting load...");
                mShowWhenLoaded = true;
                loadInterstitialAd();

                // Allow up to 3.5 seconds for ad to finish loading before graceful fallback
                mHandler.postDelayed(() -> {
                    if (mShowWhenLoaded) {
                        Log.w(TAG, "Ad load timeout reached; proceeding without ad");
                        mShowWhenLoaded = false;
                        notifyAdResult(false);
                    }
                }, 3500);
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
        });
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
                            mUserEarnedReward = false;
                        }

                        @Override
                        public void onAdDismissedFullScreenContent() {
                            final boolean earned = mUserEarnedReward;
                            Log.d(TAG, "Rewarded Ad dismissed by player (earned=" + earned + ")");
                            mRewardedAd = null;
                            mUserEarnedReward = false;
                            loadRewardedAd();
                            notifyRewardedAdDismissed(earned);
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                            Log.e(TAG, "Rewarded Ad failed to show: " + adError.getMessage());
                            mRewardedAd = null;
                            mUserEarnedReward = false;
                            loadRewardedAd();
                            notifyRewardedAdFailed();
                        }
                    });

                    if (mShowRewardedWhenLoaded) {
                        mShowRewardedWhenLoaded = false;
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
                        notifyRewardedAdFailed();
                    }

                    // Retry preloading after 15 seconds if idle
                    mHandler.postDelayed(() -> {
                        if (mRewardedAd == null && !mIsLoadingRewardedAd) {
                            loadRewardedAd();
                        }
                    }, 15000);
                }
            }
        );
    }

    private void displayLoadedRewardedAd() {
        if (mRewardedAd == null) {
            notifyRewardedAdFailed();
            return;
        }

        mUserEarnedReward = false;
        mRewardedAd.show(MainActivity.this, new OnUserEarnedRewardListener() {
            @Override
            public void onUserEarnedReward(@NonNull RewardItem rewardItem) {
                int rewardAmount = rewardItem.getAmount();
                String rewardType = rewardItem.getType();
                Log.d(TAG, "User earned reward: " + rewardAmount + " " + rewardType);
                mUserEarnedReward = true;
            }
        });
    }

    @JavascriptInterface
    public void preloadRewardedAd() {
        runOnUiThread(() -> {
            if (mRewardedAd == null && !mIsLoadingRewardedAd) {
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
            Log.d(TAG, "Displaying Rewarded Ad requested by game");

            if (mRewardedAd != null) {
                Log.d(TAG, "Displaying ready Rewarded Ad");
                displayLoadedRewardedAd();
            } else {
                Log.d(TAG, "Rewarded Ad not ready yet; requesting load...");
                mShowRewardedWhenLoaded = true;
                loadRewardedAd();

                // Allow up to 6 seconds for rewarded ad to finish loading before graceful fallback
                mHandler.postDelayed(() -> {
                    if (mShowRewardedWhenLoaded) {
                        Log.w(TAG, "Rewarded Ad load timeout reached");
                        mShowRewardedWhenLoaded = false;
                        notifyRewardedAdFailed();
                    }
                }, 6000);
            }
        });
    }

    @JavascriptInterface
    public void showRewarded() {
        showRewardedAd();
    }

    private void notifyRewardedAdDismissed(final boolean rewarded) {
        runOnUiThread(() -> {
            applyLightBackgrounds();
            if (bridge != null && bridge.getWebView() != null) {
                String js = rewarded
                    ? "if (typeof window.onRewardedAdDismissed === 'function') { window.onRewardedAdDismissed(true); } " +
                      "if (typeof window.onRewardedAdCompleted === 'function') { window.onRewardedAdCompleted(true); } " +
                      "window.dispatchEvent(new CustomEvent('rewardedAdDismissed', { detail: { rewarded: true } }));"
                    : "if (typeof window.onRewardedAdDismissed === 'function') { window.onRewardedAdDismissed(false); } " +
                      "window.dispatchEvent(new CustomEvent('rewardedAdDismissed', { detail: { rewarded: false } }));";
                bridge.getWebView().evaluateJavascript(js, null);
            }
        });
    }

    private void notifyRewardedAdFailed() {
        runOnUiThread(() -> {
            applyLightBackgrounds();
            if (bridge != null && bridge.getWebView() != null) {
                String js =
                    "if (typeof window.onRewardedAdFailed === 'function') { window.onRewardedAdFailed(); } " +
                    "window.dispatchEvent(new CustomEvent('rewardedAdFailed', { detail: { reason: 'unavailable' } }));";
                bridge.getWebView().evaluateJavascript(js, null);
            }
        });
    }
}
