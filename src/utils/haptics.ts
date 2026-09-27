export const hapticManager = {
  enabled: true,

  lightTap() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(25);
    } catch {
      // Ignored if device doesn't support or disallows
    }
  },

  mediumTap() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(45);
    } catch {
      // Ignored
    }
  },

  successCombo() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([20, 30, 40]);
    } catch {
      // Ignored
    }
  },

  failBuzz() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([180, 50, 180]);
    } catch {
      // Ignored
    }
  },

  newBestPattern() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([50, 40, 60, 40, 120]);
    } catch {
      // Ignored
    }
  }
};
