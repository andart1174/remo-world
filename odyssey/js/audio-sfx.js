/* ═══════════════════════════════════════════════════════════════════════════
   REMO WORLD: 4D Compass Odyssey — Procedural WebAudio SFX & Synthwave Engine
   Dynamic Elemental Tempo · Zero External Audio Files · 100% Offline Ready
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const ELEMENT_SCALES = {
    neon:    { bass: [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 98],    arp: [440, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 493.88] },
    void:    { bass: [98, 98, 116.54, 130.81, 146.83, 130.81, 116.54, 87.31],   arp: [392, 466.16, 587.33, 698.46, 587.33, 466.16, 523.25, 440] },
    cyber:   { bass: [130.81, 130.81, 146.83, 164.81, 196, 164.81, 146.83, 110], arp: [523.25, 587.33, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33] },
    crystal: { bass: [146.83, 146.83, 164.81, 196, 220, 196, 164.81, 130.81],   arp: [587.33, 659.25, 783.99, 880, 1046.5, 880, 783.99, 659.25] },
    plasma:  { bass: [123.47, 123.47, 146.83, 164.81, 185, 164.81, 146.83, 110], arp: [493.88, 587.33, 659.25, 739.99, 987.77, 739.99, 659.25, 587.33] }
  };

  const AudioSFX = {
    ctx: null,
    muted: false,
    musicEnabled: true,
    _musicTimer: null,
    _beatStep: 0,
    _lastBeatAt: 0,
    _lastModeKey: '',

    _ensureCtx() {
      if (this.muted) return null;
      if (!this.ctx) {
        const AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    },

    unlock() {
      this._ensureCtx();
    },

    setMuted(m) {
      this.muted = Boolean(m);
      if (this.muted) this.stopPulse();
    },

    _tone(freqStart, freqEnd, duration, type = 'sine', vol = 0.14, delay = 0) {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      try {
        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(30, freqStart), t);
        if (freqEnd !== freqStart) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd), t + duration);
        }
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duration + 0.02);
      } catch (e) {}
    },

    jump(isDouble = false) {
      if (isDouble) {
        this._tone(340, 780, 0.16, 'triangle', 0.14);
        this._tone(510, 1020, 0.13, 'sine', 0.09, 0.03);
      } else {
        this._tone(220, 520, 0.14, 'triangle', 0.13);
      }
    },

    dash() {
      this._tone(680, 180, 0.18, 'sawtooth', 0.09);
      this._tone(960, 320, 0.14, 'sine', 0.08, 0.02);
    },

    blink() {
      this._tone(1240, 420, 0.14, 'sine', 0.13);
      this._tone(620, 1580, 0.18, 'triangle', 0.11, 0.03);
    },

    blast(isCrit = false) {
      if (isCrit) {
        this._tone(1180, 310, 0.18, 'sawtooth', 0.12);
        this._tone(1760, 660, 0.16, 'triangle', 0.11, 0.02);
      } else {
        this._tone(920, 240, 0.15, 'sawtooth', 0.10);
        this._tone(1480, 520, 0.12, 'triangle', 0.09, 0.015);
      }
    },

    ascended() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => {
        this._tone(f, f * 1.08, 0.22, 'triangle', 0.11, i * 0.045);
      });
    },

    shopBuy() {
      this._tone(587.33, 880, 0.12, 'triangle', 0.12);
      this._tone(880, 1174.66, 0.16, 'sine', 0.12, 0.06);
    },

    chest() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        this._tone(f, f * 1.04, 0.18, 'triangle', 0.11, i * 0.05);
      });
    },

    perfectLock() {
      this._tone(440, 880, 0.16, 'sine', 0.14);
      this._tone(659.25, 1318.5, 0.22, 'triangle', 0.13, 0.05);
    },

    coin(combo = 1) {
      const pitchBoost = Math.min(400, (combo - 1) * 32);
      this._tone(740 + pitchBoost, 1180 + pitchBoost, 0.09, 'sine', 0.12);
      this._tone(1120 + pitchBoost, 1540 + pitchBoost, 0.12, 'triangle', 0.09, 0.04);
    },

    crystal() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => {
        this._tone(n, n * 1.03, 0.16, 'triangle', 0.11, i * 0.045);
      });
    },

    ring(mult = 2) {
      const base = 440 + Math.min(6, mult) * 70;
      this._tone(base, base * 1.5, 0.16, 'sine', 0.14);
      this._tone(base * 1.25, base * 2, 0.18, 'triangle', 0.09, 0.04);
    },

    nova() {
      [220, 330, 440, 660, 880, 1320].forEach((f, i) => {
        this._tone(f, f * 0.75, 0.28, 'sawtooth', 0.06, i * 0.025);
      });
      this._tone(110, 45, 0.42, 'sine', 0.22);
    },

    portalWarp() {
      const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
      chord.forEach((f, i) => {
        this._tone(f * 0.85, f * 1.25, 0.34, 'triangle', 0.11, i * 0.04);
      });
    },

    landCity() {
      this._tone(160, 55, 0.22, 'sine', 0.18);
      this._tone(523.25, 523.25, 0.16, 'triangle', 0.12, 0.04);
      this._tone(659.25, 659.25, 0.16, 'triangle', 0.11, 0.11);
      this._tone(783.99, 1046.5, 0.28, 'sine', 0.14, 0.18);
    },

    hit(shielded = false) {
      if (shielded) {
        this._tone(420, 160, 0.22, 'sawtooth', 0.11);
        this._tone(720, 360, 0.18, 'sine', 0.10, 0.04);
      } else {
        this._tone(190, 52, 0.32, 'sawtooth', 0.16);
        this._tone(130, 40, 0.35, 'square', 0.09, 0.02);
      }
    },

    gameOver() {
      [392, 349.23, 311.13, 261.63].forEach((f, i) => {
        this._tone(f, f * 0.94, 0.26, 'triangle', 0.13, i * 0.13);
      });
    },

    getBeatPulse() {
      if (!this._lastBeatAt) return 0;
      const age = Date.now() - this._lastBeatAt;
      return Math.max(0, 1 - age / 220);
    },

    startPulse(getInfoFn) {
      if (this._musicTimer || this.muted || !this.musicEnabled) return;
      this._musicTimer = setInterval(() => {
        if (this.muted || !this.musicEnabled) return;
        const raw = typeof getInfoFn === 'function' ? getInfoFn() : { phase: 'run' };
        const info = typeof raw === 'string' ? { phase: raw } : (raw || {});
        const mode = info.phase;
        if (!mode || (mode !== 'run' && mode !== 'fly' && mode !== 'landing')) return;

        // Throttle beat rate dynamically: faster in fever / fly mode!
        const fast = Boolean(info.fever || mode === 'fly' || info.ascended);
        if (!fast && this._beatStep % 5 === 4) {
          this._beatStep++;
          return;
        }

        const elKey = ELEMENT_SCALES[info.element] ? info.element : 'neon';
        const sc = ELEMENT_SCALES[elKey];
        const idx = this._beatStep % sc.bass.length;
        const shift = info.chrono ? 0.89 : (mode === 'fly' ? 1.25 : 1.0);
        const bassF = sc.bass[idx] * shift;
        this._tone(bassF, bassF * 0.98, 0.15, 'triangle', 0.036);

        if (this._beatStep % 2 === 0 || mode === 'fly' || info.fever) {
          const arpF = sc.arp[idx] * shift;
          this._tone(arpF, arpF, 0.10, 'sine', 0.025, 0.02);
        }
        this._lastBeatAt = Date.now();
        this._beatStep++;
      }, 175);
    },

    stopPulse() {
      if (this._musicTimer) {
        clearInterval(this._musicTimer);
        this._musicTimer = null;
      }
    }
  };

  global.REMO_SFX = AudioSFX;
})(window);
