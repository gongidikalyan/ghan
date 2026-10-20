/**
 * Procedural Web Audio API sound synthesis.
 * Zero-dependency, offline-ready, 0ms latency.
 * Fully error-guarded for mobile WebViews & APK environments.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export const soundManager = {
  enabled: true,
  volume: 0.8,

  init() {
    try {
      getAudioContext();
    } catch {
      // Ignore
    }
  },

  playTap() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Guard against AudioContext state changes
    }
  },

  playCorrect() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Two rapid harmonious tones (E5 -> A5)
      [
        { freq: 659.25, time: 0, dur: 0.08 },
        { freq: 880.0, time: 0.07, dur: 0.12 },
      ].forEach(({ freq, time, dur }) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);
          gain.gain.setValueAtTime(0.25 * this.volume, now + time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur);
        } catch {
          // Ignore individual tone error
        }
      });
    } catch {
      // Ignore
    }
  },

  playCombo(combo: number) {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const baseFreq = 523.25; // C5
      const pitchOffset = Math.min(combo * 60, 400);

      const freqs = [baseFreq + pitchOffset, (baseFreq + pitchOffset) * 1.25, (baseFreq + pitchOffset) * 1.5];
      freqs.forEach((freq, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const delay = idx * 0.04;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.2 * this.volume, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.15);
        } catch {
          // Ignore
        }
      });
    } catch {
      // Ignore
    }
  },

  playWrong() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Harsh low sawtooth buzzer
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.linearRampToValueAtTime(70, now + 0.35);

      osc2.frequency.setValueAtTime(145, now);
      osc2.frequency.linearRampToValueAtTime(65, now + 0.35);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Ignore
    }
  },

  playCountdownTick() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  },

  playCountdownGo() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio power

      chord.forEach((freq, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const delay = idx * 0.03;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.25 * this.volume, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.3);
        } catch {
          // Ignore
        }
      });
    } catch {
      // Ignore
    }
  },

  playNewBest() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0, dur: 0.12 },
        { freq: 659.25, time: 0.12, dur: 0.12 },
        { freq: 783.99, time: 0.24, dur: 0.15 },
        { freq: 1046.5, time: 0.39, dur: 0.45 },
      ];

      notes.forEach(({ freq, time, dur }) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);
          gain.gain.setValueAtTime(0.3 * this.volume, now + time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur);
        } catch {
          // Ignore
        }
      });
    } catch {
      // Ignore
    }
  },

  playStopTargetLocked() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  },
};
