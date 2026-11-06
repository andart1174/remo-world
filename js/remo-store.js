/* ════════════════════════════════════════════════════════════════════
   ⚡ REMO — Unified Store, Real-Time Live Bus, Auth, Economy & Audio FX
   Works 100% Immediately Offline/Local + Plug-and-Play Firebase Cloud
   Instant Live Sync between Admin Office (admin.html) & REMO (index.html)
   ════════════════════════════════════════════════════════════════════ */

const REMO_LIVE_BUS = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('remo_live_bus') : null;

/* ── 1. Web Audio API Synthesizer (Zero External MP3 Dependencies) ── */
const RemoAudio = {
  ctx: null,
  radioPlaying: false,
  radioNodes: [],
  radioTimer: null,

  ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  play(type = 'click') {
    try {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'coin') {
        [987.77, 1318.51].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.08);
          g.gain.setValueAtTime(0.18, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.3);
        });
      } else if (type === 'goldchime') {
        [1760, 2637.02, 3520].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.04);
          g.gain.setValueAtTime(0.24, now + i * 0.04);
          g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 1.25);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.04); o.stop(now + i * 0.04 + 1.3);
        });
      } else if (type === 'crystalchime') {
        // High-order sapphire platinum crystalline chime
        [2093, 3135.96, 4186, 5274].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.03);
          g.gain.setValueAtTime(0.18, now + i * 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + 1.4);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.03); o.stop(now + i * 0.03 + 1.45);
        });
      } else if (type === 'cybersound') {
        // Cyber obsidian emerald laser pulse
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(880, now);
        o.frequency.exponentialRampToValueAtTime(220, now + 0.35);
        g.gain.setValueAtTime(0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.36);
      } else if (type === 'brassclink') {
        // Resonant heavy antique brass & steel clink
        [587.33, 880, 1174.66].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.02);
          g.gain.setValueAtTime(0.25, now + i * 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.65);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.02); o.stop(now + i * 0.02 + 0.7);
        });
      } else if (type === 'pack' || type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.09);
          g.gain.setValueAtTime(0.2, now + i * 0.09);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.09); o.stop(now + i * 0.09 + 0.46);
        });
      } else if (type === 'roger') {
        [1567.98, 1174.66].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'square';
          o.frequency.setValueAtTime(freq, now + i * 0.065);
          g.gain.setValueAtTime(0.09, now + i * 0.065);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.07);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.065); o.stop(now + i * 0.065 + 0.08);
        });
      } else if (type === 'splash') {
        [440, 587.33, 880].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.07);
          g.gain.setValueAtTime(0.14, now + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.07); o.stop(now + i * 0.07 + 0.26);
        });
      } else if (type === 'hit') {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(220, now);
        o.frequency.exponentialRampToValueAtTime(55, now + 0.22);
        g.gain.setValueAtTime(0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.25);
      } else {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(660, now);
        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.08);
      }
    } catch (e) {}
  },

  haptic(ms = 18) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  },

  // Generates a real playable PCM WAV data URL fallback when testing voice features on a PC without a mic
  createSynthVoiceWavDataUrl(seconds = 2.4) {
    const sampleRate = 8000;
    const numSamples = Math.floor(sampleRate * seconds);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    const notes = [523.25, 659.25, 783.99, 659.25, 880, 1046.5];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const idx = Math.min(notes.length - 1, Math.floor((t / seconds) * notes.length));
      const env = Math.sin(Math.PI * ((t * notes.length) % 1));
      const sample = Math.sin(2 * Math.PI * notes[idx] * t) * 0.28 * env;
      view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return 'data:audio/wav;base64,' + btoa(binary);
  },

  toggleCyberLofiRadio() {
    if (this.radioPlaying) {
      this.stopRadio();
      return false;
    }
    const ctx = this.ensureCtx();
    if (!ctx) return false;
    this.radioPlaying = true;
    const chords = [
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 349.23], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
      [164.81, 196.0, 246.94, 329.63]  // Em7
    ];
    let step = 0;
    const playChord = () => {
      if (!this.radioPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = chords[step % chords.length];
      step++;
      notes.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.032, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 3.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 3.7);
      });
    };
    playChord();
    this.radioTimer = setInterval(playChord, 3600);
    return true;
  },

  stopRadio() {
    this.radioPlaying = false;
    if (this.radioTimer) {
      clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
  },

  /* ── 💿 v60: 8 Copyright-Free Procedural Photo Soundtracks & 4x8 Beat-Pad Synth ── */
  soundtrackTimer: null,
  activeSoundtrackId: '',
  activeSoundtrackPostId: '',
  beatTimer: null,
  activeBeatTargetId: '',
  activeBeatStep: -1,
  _noiseBuf: null,

  _getNoiseBuffer(ctx) {
    if (this._noiseBuf) return this._noiseBuf;
    const len = Math.floor(ctx.sampleRate * 0.18);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.045));
    }
    this._noiseBuf = buf;
    return buf;
  },

  _notifyExternalAudioState() {
    const anyActive = Boolean(this.soundtrackTimer || this.beatTimer);
    if (window.REMO_RADIO && typeof window.REMO_RADIO.setExternalSynthActive === 'function') {
      window.REMO_RADIO.setExternalSynthActive(anyActive);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('remo:postaudiochange', {
        detail: {
          soundtrackPostId: this.activeSoundtrackPostId,
          soundtrackId: this.activeSoundtrackId,
          beatTargetId: this.activeBeatTargetId
        }
      }));
    }
  },

  getSoundtrackPresets() {
    return {
      lofi_rain: {
        bpm: 78, wave: 'triangle', hat: true, kickEvery: 4,
        chords: [[293.66, 349.23, 440, 523.25], [196, 246.94, 349.23, 440], [261.63, 329.63, 392, 493.88], [220, 261.63, 329.63, 392]]
      },
      french_cafe: {
        bpm: 88, wave: 'sine', hat: true, kickEvery: 0,
        chords: [[174.61, 220, 261.63, 329.63], [164.81, 196, 246.94, 293.66], [146.83, 220, 261.63, 349.23], [130.81, 196, 246.94, 329.63]]
      },
      shibuya_neon: {
        bpm: 112, wave: 'sawtooth', arp: true, hat: true, kickEvery: 2,
        chords: [[220, 261.63, 329.63, 440], [174.61, 220, 261.63, 349.23], [261.63, 329.63, 392, 523.25], [196, 246.94, 293.66, 392]]
      },
      sunset_house: {
        bpm: 120, wave: 'triangle', hat: true, kickEvery: 2,
        chords: [[220, 261.63, 329.63, 392], [196, 246.94, 293.66, 392], [174.61, 220, 261.63, 349.23], [164.81, 196, 246.94, 329.63]]
      },
      afro_groove: {
        bpm: 104, wave: 'sine', arp: true, hat: true, kickEvery: 3,
        chords: [[196, 293.66, 392, 493.88], [220, 329.63, 440, 523.25], [174.61, 261.63, 349.23, 440], [196, 293.66, 392, 440]]
      },
      velvet_jazz: {
        bpm: 72, wave: 'sine', hat: true, kickEvery: 0,
        chords: [[261.63, 311.13, 392, 466.16], [233.08, 293.66, 349.23, 440], [207.65, 261.63, 311.13, 392], [196, 246.94, 293.66, 349.23]]
      },
      cyber_pulse: {
        bpm: 126, wave: 'sawtooth', arp: true, hat: true, kickEvery: 2,
        chords: [[146.83, 220, 293.66, 349.23], [130.81, 196, 261.63, 329.63], [116.54, 174.61, 233.08, 293.66], [130.81, 196, 261.63, 392]]
      },
      acoustic_breeze: {
        bpm: 94, wave: 'triangle', arp: true, hat: false, kickEvery: 4,
        chords: [[261.63, 329.63, 392, 523.25], [196, 293.66, 392, 493.88], [220, 329.63, 440, 523.25], [174.61, 261.63, 349.23, 440]]
      }
    };
  },

  playSoundtrackLoop(loopId, postId = '') {
    this.stopBeatPattern(true);
    if (this.soundtrackTimer && this.activeSoundtrackId === loopId && this.activeSoundtrackPostId === postId) {
      this.stopSoundtrackLoop();
      return false;
    }
    this.stopSoundtrackLoop(true);
    const presets = this.getSoundtrackPresets();
    const cfg = presets[loopId] || presets.lofi_rain;
    const ctx = this.ensureCtx();
    if (!ctx) return false;

    this.activeSoundtrackId = loopId;
    this.activeSoundtrackPostId = postId || 'studio_preview';

    let tick = 0;
    const stepMs = Math.round((60 / cfg.bpm / 2) * 1000);
    const runTick = () => {
      if (!this.activeSoundtrackId || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const chord = cfg.chords[Math.floor(tick / 8) % cfg.chords.length];
        if (tick % 8 === 0) {
          chord.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const flt = this.ctx.createBiquadFilter();
            const g = this.ctx.createGain();
            osc.type = cfg.wave;
            osc.frequency.setValueAtTime(freq, now);
            flt.type = 'lowpass';
            flt.frequency.setValueAtTime(cfg.wave === 'sawtooth' ? 950 : 1800, now);
            g.gain.setValueAtTime(0.001, now);
            g.gain.linearRampToValueAtTime(cfg.wave === 'sawtooth' ? 0.025 : 0.042, now + 0.12);
            g.gain.exponentialRampToValueAtTime(0.0008, now + (stepMs * 7.6) / 1000);
            osc.connect(flt);
            flt.connect(g);
            g.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + (stepMs * 7.8) / 1000);
          });
        }
        if (cfg.arp) {
          const arpNote = chord[tick % chord.length] * (tick % 4 === 3 ? 2 : 1);
          const ao = this.ctx.createOscillator();
          const ag = this.ctx.createGain();
          ao.type = 'triangle';
          ao.frequency.setValueAtTime(arpNote, now);
          ag.gain.setValueAtTime(0.032, now);
          ag.gain.exponentialRampToValueAtTime(0.0008, now + 0.22);
          ao.connect(ag);
          ag.connect(this.ctx.destination);
          ao.start(now);
          ao.stop(now + 0.24);
        }
        if (cfg.kickEvery && tick % cfg.kickEvery === 0) {
          this.playSingleDrumPad(0, tick % 8, 'chill', 0.55);
        }
        if (cfg.hat && tick % 2 === 1) {
          const src = this.ctx.createBufferSource();
          src.buffer = this._getNoiseBuffer(this.ctx);
          const hp = this.ctx.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.setValueAtTime(5200, now);
          const hg = this.ctx.createGain();
          hg.gain.setValueAtTime(0.025, now);
          hg.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
          src.connect(hp);
          hp.connect(hg);
          hg.connect(this.ctx.destination);
          src.start(now);
          src.stop(now + 0.06);
        }
        tick++;
      } catch (e) {}
    };

    runTick();
    this.soundtrackTimer = setInterval(runTick, stepMs);
    this._notifyExternalAudioState();
    return true;
  },

  stopSoundtrackLoop(silentNotify = false) {
    if (this.soundtrackTimer) {
      clearInterval(this.soundtrackTimer);
      this.soundtrackTimer = null;
    }
    this.activeSoundtrackId = '';
    this.activeSoundtrackPostId = '';
    if (!silentNotify) this._notifyExternalAudioState();
  },

  playSingleDrumPad(rowIdx, stepIdx = 0, scaleId = 'cyber', gainMul = 1) {
    try {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const scales = {
        cyber: { bass: [55, 55, 65.41, 73.42, 55, 65.41, 82.41, 73.42], lead: [440, 523.25, 659.25, 587.33, 440, 783.99, 659.25, 523.25] },
        chill: { bass: [73.42, 73.42, 65.41, 55, 65.41, 73.42, 82.41, 65.41], lead: [293.66, 349.23, 440, 523.25, 392, 349.23, 329.63, 293.66] },
        house: { bass: [55, 65.41, 73.42, 82.41, 55, 65.41, 98, 82.41], lead: [329.63, 392, 440, 493.88, 587.33, 523.25, 440, 392] },
        tokyo: { bass: [65.41, 65.41, 82.41, 98, 73.42, 82.41, 110, 98], lead: [523.25, 659.25, 783.99, 987.77, 880, 783.99, 659.25, 587.33] }
      };
      const sc = scales[scaleId] || scales.cyber;

      if (rowIdx === 0) {
        // 🥁 Punchy 808/909 Kick
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(152, now);
        o.frequency.exponentialRampToValueAtTime(38, now + 0.18);
        g.gain.setValueAtTime(0.34 * gainMul, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.23);
      } else if (rowIdx === 1) {
        // 👏 Crisp Studio Clap / Snare
        const src = ctx.createBufferSource();
        src.buffer = this._getNoiseBuffer(ctx);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1450, now);
        bp.Q.setValueAtTime(1.2, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.24 * gainMul, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        src.connect(bp);
        bp.connect(g);
        g.connect(ctx.destination);
        src.start(now);
        src.stop(now + 0.15);
      } else if (rowIdx === 2) {
        // 🎸 Warm Sub-Bass
        const freq = sc.bass[stepIdx % sc.bass.length];
        const o = ctx.createOscillator();
        const flt = ctx.createBiquadFilter();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq, now);
        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(360, now);
        g.gain.setValueAtTime(0.22 * gainMul, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        o.connect(flt);
        flt.connect(g);
        g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.25);
      } else if (rowIdx === 3) {
        // 🎹 Neon Lead Synth
        const freq = sc.lead[stepIdx % sc.lead.length];
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = scaleId === 'chill' ? 'sine' : 'triangle';
        o.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.16 * gainMul, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.27);
      }
    } catch (e) {}
  },

  playBeatPattern(pattern, targetId = 'studio', onStepCb = null) {
    this.stopSoundtrackLoop(true);
    if (this.beatTimer && this.activeBeatTargetId === targetId) {
      this.stopBeatPattern();
      return false;
    }
    this.stopBeatPattern(true);
    if (!pattern || !Array.isArray(pattern.rows)) return false;
    const ctx = this.ensureCtx();
    if (!ctx) return false;

    const bpm = Math.max(70, Math.min(160, Number(pattern.bpm) || 118));
    const scale = pattern.scale || 'cyber';
    const stepMs = Math.round((60 / bpm / 2) * 1000);
    this.activeBeatTargetId = targetId;
    this.activeBeatStep = 0;

    const runStep = () => {
      if (!this.activeBeatTargetId) return;
      const s = this.activeBeatStep % 8;
      for (let r = 0; r < 4; r++) {
        if (pattern.rows[r] && pattern.rows[r][s]) {
          this.playSingleDrumPad(r, s, scale, 1);
        }
      }
      if (typeof onStepCb === 'function') {
        try { onStepCb(s); } catch (e) {}
      }
      this.activeBeatStep = (s + 1) % 8;
    };

    runStep();
    this.beatTimer = setInterval(runStep, stepMs);
    this._notifyExternalAudioState();
    return true;
  },

  stopBeatPattern(silentNotify = false) {
    if (this.beatTimer) {
      clearInterval(this.beatTimer);
      this.beatTimer = null;
    }
    this.activeBeatTargetId = '';
    this.activeBeatStep = -1;
    if (!silentNotify) this._notifyExternalAudioState();
  }
};

/* ── 2. Procedural Post Visual Poster Generator (Offline Taint-Free) ── */
function generateCityPostVisualDataUrl(cityId, headline, subline) {
  try {
    const cv = document.createElement('canvas');
    cv.width = 720; cv.height = 900;
    const ctx = cv.getContext('2d');
    const city = getCityById(cityId);
    const col = city.themeColor || '#6366f1';

    const bg = ctx.createLinearGradient(0, 0, 720, 900);
    bg.addColorStop(0, '#050816');
    bg.addColorStop(0.55, col + '38');
    bg.addColorStop(1, '#060919');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 720, 900);

    // Subtle cyber grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 720; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 900); ctx.stroke(); }
    for (let y = 0; y < 900; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(720, y); ctx.stroke(); }

    drawCityLandmark(ctx, city.id, col, 360, 410, 230);

    ctx.font = '900 42px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = col;
    ctx.shadowBlur = 22;
    ctx.fillText(`${city.flag} ${headline || city.name_en.toUpperCase()}`, 360, 115);
    ctx.shadowBlur = 0;

    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(subline || city.tagline_en, 360, 775);

    ctx.font = '700 16px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`🌐 REMO LIVE · ${city.name_en.toUpperCase()} · 4D CITY`, 360, 825);

    return cv.toDataURL('image/jpeg', 0.86);
  } catch (e) {
    return '';
  }
}

/* ── 2B. IndexedDB Binary Vault for 60s HD Videos, High-Res Photos & Audio ── */
const RemoMediaDB = {
  DB_NAME: 'remo_media_vault_v1',
  STORE_NAME: 'blobs',
  dbPromise: null,
  urlCache: {},

  open() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onupgradeneeded = (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
      req.onsuccess = (ev) => resolve(ev.target.result);
      req.onerror = (ev) => reject(ev.target.error);
    });
    return this.dbPromise;
  },

  async saveBlob(blob, prefix = 'media') {
    const key = `idb://${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    try {
      this.urlCache[key] = URL.createObjectURL(blob);
      const db = await this.open();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).put(blob, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e);
      });
      return key;
    } catch (err) {
      // Fallback to dataURL only for tiny files if IDB is blocked
      return new Promise((resolve) => {
        const rd = new FileReader();
        rd.onload = (e) => resolve(e.target.result || '');
        rd.onerror = () => resolve('');
        rd.readAsDataURL(blob);
      });
    }
  },

  async getObjectUrl(keyOrUrl) {
    if (!keyOrUrl || !String(keyOrUrl).startsWith('idb://')) return keyOrUrl || '';
    if (this.urlCache[keyOrUrl]) return this.urlCache[keyOrUrl];
    try {
      const db = await this.open();
      const blob = await new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const req = tx.objectStore(this.STORE_NAME).get(keyOrUrl);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e);
      });
      if (blob) {
        const objUrl = URL.createObjectURL(blob);
        this.urlCache[keyOrUrl] = objUrl;
        return objUrl;
      }
    } catch (e) {}
    return '';
  },

  resolveSyncOrPlaceholder(keyOrUrl) {
    if (!keyOrUrl) return '';
    if (!String(keyOrUrl).startsWith('idb://')) return keyOrUrl;
    return this.urlCache[keyOrUrl] || '';
  },

  hydrateDom(root = document) {
    root.querySelectorAll('[data-idb-src]').forEach(async (el) => {
      const key = el.getAttribute('data-idb-src');
      if (!key || !key.startsWith('idb://')) return;
      const url = await this.getObjectUrl(key);
      if (url && el.getAttribute('src') !== url) {
        el.src = url;
      }
    });
  }
};

/* ── 2B-2. High-Performance Mobile Client Image Compressor & Cloud Uploader ── */
async function compressImageFileToDataUrl(fileOrBlob, maxDim = 1080, quality = 0.76) {
  return new Promise((resolve) => {
    if (!fileOrBlob) return resolve('');
    if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('data:image')) {
      return resolve(fileOrBlob);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(ev.target.result || '');
      img.src = ev.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(fileOrBlob);
  });
}

async function uploadMediaToCloudOrDataUrl(blobOrFile, folder = 'posts') {
  if (!blobOrFile) return '';
  const isImage = (blobOrFile.type && blobOrFile.type.startsWith('image/')) || (typeof blobOrFile === 'string' && blobOrFile.startsWith('data:image'));
  
  if (isImage) {
    // 1. Downscale & compress to high-res mobile-optimized JPEG dataUrl (~60-90KB)
    const dataUrl = await compressImageFileToDataUrl(blobOrFile, 1080, 0.76);
    
    // 2. Upload to Firebase Storage if available
    if (typeof firebase !== 'undefined' && firebase.storage) {
      try {
        const storage = firebase.storage();
        const ref = storage.ref().child(`remo_${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`);
        const res = await fetch(dataUrl);
        const b = await res.blob();
        const snap = await ref.put(b, { contentType: 'image/jpeg' });
        const downloadUrl = await snap.ref.getDownloadURL();
        if (downloadUrl) return downloadUrl;
      } catch (err) {
        console.log('Firebase storage upload notice (using optimized dataUrl):', err.message);
      }
    }
    return dataUrl;
  }

  // Videos or audio
  if (typeof firebase !== 'undefined' && firebase.storage) {
    try {
      const storage = firebase.storage();
      const isMp4 = blobOrFile.type && blobOrFile.type.includes('mp4');
      const ext = isMp4 ? 'mp4' : 'webm';
      const mime = blobOrFile.type || (isMp4 ? 'video/mp4' : 'video/webm');
      const ref = storage.ref().child(`remo_${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`);
      const snap = await ref.put(blobOrFile, { contentType: mime });
      const downloadUrl = await snap.ref.getDownloadURL();
      if (downloadUrl) return downloadUrl;
    } catch (e) {
      console.warn('Firebase storage video upload notice:', e);
    }
  }

  // If storage is unavailable and video is compact (< 1.2MB), convert to base64 Data URL so all users can see it
  if (blobOrFile.size && blobOrFile.size < 1200000) {
    try {
      const dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onloadend = () => res(r.result || '');
        r.onerror = () => res('');
        r.readAsDataURL(blobOrFile);
      });
      if (dataUrl) return dataUrl;
    } catch (e) {}
  }

  // Fallback to local IndexedDB for large offline videos
  return RemoMediaDB.saveBlob(blobOrFile, folder);
}

window.compressImageFileToDataUrl = compressImageFileToDataUrl;
window.uploadMediaToCloudOrDataUrl = uploadMediaToCloudOrDataUrl;

/* ── 2C. Starter Templates for Live Interactive HTML / 3D Mini-App Posts ── */
const REMO_HTML_TEMPLATES = {
  fireworks: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#040714;font-family:system-ui,sans-serif;user-select:none;touch-action:none;}
  canvas{display:block;width:100%;height:100%;cursor:crosshair;}
  .hud{position:fixed;top:40px;left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none;color:#fff;font-weight:800;font-size:12px;text-shadow:0 2px 8px #000;}
  .pill{background:rgba(15,23,42,0.78);border:1px solid rgba(56,189,248,0.5);padding:5px 12px;border-radius:99px;}
</style>
</head>
<body>
<div class="hud">
  <span class="pill">🎆 TAP SKY: CYBER FIREWORKS SYNTH</span>
  <span class="pill" id="sc">COMBO: 0 ✨</span>
</div>
<canvas id="c"></canvas>
<script>
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let w,h,pts=[],combo=0,ac=null;
function resize(){w=cv.width=innerWidth;h=cv.height=innerHeight;}
addEventListener('resize',resize);resize();
const cols=['#38bdf8','#ec4899','#fbbf24','#a855f7','#10b981','#f43f5e'];
function chime(yRatio){
  try{
    if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();
    if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain(),now=ac.currentTime;
    const scale=[261.6,329.6,392,523.2,659.2,784,1046.5];
    o.type='triangle';
    o.frequency.setValueAtTime(scale[Math.floor((1-yRatio)*scale.length)]||523.2,now);
    g.gain.setValueAtTime(0.14,now);
    g.gain.exponentialRampToValueAtTime(0.001,now+0.45);
    o.connect(g);g.connect(ac.destination);o.start(now);o.stop(now+0.46);
  }catch(e){}
}
function boom(x,y,auto){
  if(!auto){combo++;document.getElementById('sc').textContent='COMBO: '+combo+' ✨';chime(Math.max(0,Math.min(0.99,y/h)));}
  const col=cols[Math.floor(Math.random()*cols.length)];
  for(let i=0;i<44;i++){
    const a=(Math.PI*2*i)/44+Math.random()*0.15,sp=1.5+Math.random()*5.2;
    pts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,col,r:2+Math.random()*2.5});
  }
}
cv.addEventListener('pointerdown',e=>boom(e.clientX,e.clientY,false));
setInterval(()=>boom(w*(0.2+Math.random()*0.6),h*(0.18+Math.random()*0.42),true),1400);
function loop(){
  ctx.fillStyle='rgba(4,7,20,0.22)';ctx.fillRect(0,0,w,h);
  // Neon Skyline
  ctx.fillStyle='#0b132b';
  for(let i=0;i<16;i++){
    const bw=w/15,bh=36+((i*37)%68);
    ctx.fillRect(i*bw,h-bh,bw-3,bh);
  }
  for(let i=pts.length-1;i>=0;i--){
    const p=pts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.06;p.life-=0.018;
    if(p.life<=0){pts.splice(i,1);continue;}
    ctx.globalAlpha=p.life;ctx.fillStyle=p.col;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;requestAnimationFrame(loop);
}
boom(w/2,h*0.35,true);loop();
<\/script>
</body>
</html>`,

  racer: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#050816;font-family:system-ui,sans-serif;user-select:none;touch-action:none;}
  canvas{display:block;width:100%;height:100%;}
  .hud{position:fixed;top:40px;left:12px;right:12px;display:flex;justify-content:space-between;color:#fbbf24;font-weight:900;font-size:12px;pointer-events:none;}
  .tag{background:rgba(10,15,32,0.85);border:1px solid #fbbf24;padding:5px 11px;border-radius:99px;}
</style>
</head>
<body>
<div class="hud">
  <span class="tag">🏎️ MOVE MOUSE / FINGER TO STEER</span>
  <span class="tag" id="pts">🪙 0</span>
</div>
<canvas id="g"></canvas>
<script>
const c=document.getElementById('g'),x=c.getContext('2d');
let w,h,px=0.5,score=0,spd=4.2,items=[],gridOff=0;
function rs(){w=c.width=innerWidth;h=c.height=innerHeight;}
addEventListener('resize',rs);rs();
c.addEventListener('pointermove',e=>{px=Math.max(0.15,Math.min(0.85,e.clientX/w));});
c.addEventListener('pointerdown',e=>{px=Math.max(0.15,Math.min(0.85,e.clientX/w));});
setInterval(()=>{
  const coin=Math.random()>0.38;
  items.push({u:0.18+Math.random()*0.64,y:-20,coin});
},520);
function draw(){
  x.fillStyle='#050816';x.fillRect(0,0,w,h);
  gridOff=(gridOff+spd)%40;
  // Cyber synthwave road
  x.strokeStyle='rgba(236,72,153,0.35)';x.lineWidth=2;
  x.beginPath();x.moveTo(w*0.1,0);x.lineTo(w*0.02,h);x.moveTo(w*0.9,0);x.lineTo(w*0.98,h);x.stroke();
  x.strokeStyle='rgba(56,189,248,0.18)';
  for(let y=gridOff;y<h;y+=40){x.beginPath();x.moveTo(w*0.06,y);x.lineTo(w*0.94,y);x.stroke();}
  const carX=px*w,carY=h-62;
  // Player Neon Hovercar
  x.shadowColor='#38bdf8';x.shadowBlur=16;x.fillStyle='#38bdf8';
  x.beginPath();x.moveTo(carX,carY-22);x.lineTo(carX-18,carY+16);x.lineTo(carX+18,carY+16);x.closePath();x.fill();
  x.shadowBlur=0;
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];it.y+=spd;
    const ix=it.u*w;
    if(it.coin){
      x.fillStyle='#fbbf24';x.beginPath();x.arc(ix,it.y,11,0,Math.PI*2);x.fill();
    }else{
      x.fillStyle='#f43f5e';x.fillRect(ix-20,it.y-8,40,16);
    }
    if(Math.hypot(ix-carX,it.y-carY)<28){
      score=it.coin?score+10:Math.max(0,score-15);
      spd=Math.min(8.5,4.2+score*0.02);
      document.getElementById('pts').textContent='🪙 '+score;
      items.splice(i,1);continue;
    }
    if(it.y>h+30)items.splice(i,1);
  }
  requestAnimationFrame(draw);
}
draw();
<\/script>
</body>
</html>`,

  globe: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:radial-gradient(circle,#0f172a,#030612);font-family:system-ui,sans-serif;user-select:none;touch-action:none;}
  canvas{display:block;width:100%;height:100%;cursor:grab;}
  .lbl{position:fixed;top:40px;left:12px;background:rgba(15,23,42,0.8);border:1px solid #6366f1;color:#38bdf8;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:800;pointer-events:none;}
</style>
</head>
<body>
<div class="lbl">🌀 DRAG TO SPIN 4D REMO WORLD GLOBE</div>
<canvas id="gl"></canvas>
<script>
const c=document.getElementById('gl'),ctx=c.getContext('2d');
let w,h,ry=0,rx=0.25,drag=false,lx=0,ly=0;
function rs(){w=c.width=innerWidth;h=c.height=innerHeight;}
addEventListener('resize',rs);rs();
const nodes=[];
for(let i=0;i<160;i++){
  const phi=Math.acos(1-2*(i+0.5)/160),th=Math.PI*(1+Math.sqrt(5))*i;
  nodes.push({x:Math.cos(th)*Math.sin(phi),y:Math.cos(phi),z:Math.sin(th)*Math.sin(phi),hub:i%14===0});
}
c.onpointerdown=e=>{drag=true;lx=e.clientX;ly=e.clientY;};
addEventListener('pointerup',()=>drag=false);
c.onpointermove=e=>{if(!drag)return;ry+=(e.clientX-lx)*0.01;rx=Math.max(-1.2,Math.min(1.2,rx+(e.clientY-ly)*0.01));lx=e.clientX;ly=e.clientY;};
function frame(){
  if(!drag)ry+=0.008;
  ctx.clearRect(0,0,w,h);
  const R=Math.min(w,h)*0.34,cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
  nodes.forEach(n=>{
    const x1=n.x*cy-n.z*sy,z1=n.x*sy+n.z*cy;
    const y2=n.y*cx-z1*sx,z2=n.y*sx+z1*cx;
    const sc=(z2+2.4)/3.4;
    const px=w/2+x1*R,py=h/2+y2*R;
    ctx.globalAlpha=Math.max(0.12,sc);
    ctx.fillStyle=n.hub?'#fbbf24':'#38bdf8';
    ctx.beginPath();ctx.arc(px,py,n.hub?4.8*sc:2.2*sc,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;requestAnimationFrame(frame);
}
frame();
<\/script>
</body>
</html>`,

  beatpad: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html,body{margin:0;height:100%;background:#060918;color:#fff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;user-select:none;}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:min(90vw,360px);}
  .pad{aspect-ratio:1;border-radius:16px;border:2px solid rgba(255,255,255,0.18);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:12px;cursor:pointer;transition:transform 0.08s,box-shadow 0.12s;}
  .pad:active,.pad.hit{transform:scale(0.92);box-shadow:0 0 24px currentColor;}
</style>
</head>
<body>
<div style="font-weight:900;font-size:13px;color:#fbbf24;letter-spacing:1px;">🎹 REMO CYBER SYNTH PAD — TAP TO PLAY</div>
<div class="grid" id="pads"></div>
<script>
const pads=[
  {n:'KICK',f:65,t:'sine',c:'#f43f5e'},{n:'BASS',f:110,t:'sawtooth',c:'#ec4899'},
  {n:'LEAD',f:440,t:'triangle',c:'#6366f1'},{n:'NEON',f:587.3,t:'sine',c:'#38bdf8'},
  {n:'CHORD',f:329.6,t:'triangle',c:'#10b981'},{n:'LASER',f:880,t:'sawtooth',c:'#fbbf24'},
  {n:'ARP',f:659.3,t:'sine',c:'#a855f7'},{n:'GOLD',f:1046.5,t:'triangle',c:'#f59e0b'}
];
let ac=null;
const box=document.getElementById('pads');
pads.forEach(p=>{
  const b=document.createElement('div');
  b.className='pad';
  b.style.background=p.c+'26';b.style.color=p.c;b.style.borderColor=p.c;
  b.innerHTML='<span style="font-size:20px;">⚡</span><span>'+p.n+'</span>';
  b.onpointerdown=()=>{
    b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),140);
    if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();
    if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain(),now=ac.currentTime;
    o.type=p.t;o.frequency.setValueAtTime(p.f,now);
    if(p.n==='KICK'||p.n==='LASER')o.frequency.exponentialRampToValueAtTime(32,now+0.25);
    g.gain.setValueAtTime(0.24,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.34);
    o.connect(g);g.connect(ac.destination);o.start(now);o.stop(now+0.35);
  };
  box.appendChild(b);
});
<\/script>
</body>
</html>`
};

function getShowcaseInteractivePosts(now = Date.now()) {
  return [
    {
      id: 'post_html_fireworks',
      uid: 'u_admin_founder',
      authorName: 'REMO Founder',
      authorVerified: true,
      authorPassport: '0001',
      cityId: 'montreal',
      vibe: 'energy',
      caption_en: '🎆 LIVE INTERACTIVE HTML APP! Tap the sky directly inside this post to launch 3D Cyber Fireworks & Synth music — or click Remix Code to build your own! #LiveHTML #Montreal #WebArt',
      caption_fr: '🎆 APP HTML INTERACTIVE EN DIRECT ! Touchez le ciel dans ce post pour lancer des feux d’artifice 3D musicaux — ou cliquez sur Remixer le Code ! #LiveHTML #Montreal #WebArt',
      mediaType: 'html_app',
      htmlCode: REMO_HTML_TEMPLATES.fireworks,
      verifiedGps: true,
      boosted: false,
      mintedCard: false,
      reactions: { '🔥': 14, '⚡': 9, '💎': 6, '🤯': 11 },
      secretCapsule: {
        cost: 15,
        text_en: '💎 VIP Creator Tip: Inside Remix Code, change cols[] or scale[] frequencies to create your own custom city symphony!',
        text_fr: '💎 Astuce Créateur VIP : Dans Remixer Code, modifiez cols[] ou scale[] pour composer votre propre symphonie urbaine !',
        unlockedBy: []
      },
      likes: ['u_elena_kiv', 'u_lucas_par', 'u_kenji_tyo'],
      tipsTotal: 320,
      comments: [
        { id: 'ch1', author: 'Kenji_Shibuya', text: 'Playing with fireworks directly inside the feed is next-level 🤯🔥', createdAt: now - 600000 }
      ],
      createdAt: now - 1200000
    },
    {
      id: 'post_html_racer_kiv',
      uid: 'u_elena_kiv',
      authorName: 'Elena_KIV',
      authorVerified: true,
      authorPassport: '0007',
      cityId: 'chisinau',
      vibe: 'culture',
      caption_en: '🏎️🇲🇩 Playable Chișinău Neon Hovercar Mini-Game coded in pure HTML5! Beat 100 points & vote in the poll below! #Chisinau #HTMLGame #Moldova',
      caption_fr: '🏎️🇲🇩 Mini-Jeu Néon Chișinău jouable directement dans le flux en HTML5 ! Dépassez 100 points et votez au sondage ci-dessous ! #Chisinau #HTMLGame #Moldavie',
      mediaType: 'html_app',
      htmlCode: REMO_HTML_TEMPLATES.racer,
      verifiedGps: true,
      boosted: false,
      mintedCard: true,
      reactions: { '🔥': 19, '👑': 8, '💎': 7 },
      poll: {
        question_en: 'What should I code next for REMO Live HTML?',
        question_fr: 'Que dois-je coder ensuite en HTML Live sur REMO ?',
        options: [
          { label_en: '🗼 3D Eiffel Tower Climber', label_fr: '🗼 Jeu 3D Tour Eiffel', votes: 28 },
          { label_en: '🎹 Cyber Synth Studio', label_fr: '🎹 Studio Synthé Cyber', votes: 19 },
          { label_en: '🃏 Mini Blackjack Arena', label_fr: '🃏 Mini Arène Cartes', votes: 15 }
        ],
        voters: []
      },
      likes: ['u_admin_founder', 'u_lucas_par'],
      tipsTotal: 210,
      comments: [],
      createdAt: now - 2100000
    }
  ];
}

/* ── 3. Default Seeded Ecosystem Data ── */
function createDefaultState() {
  const now = Date.now();
  return {
    settings: {
      adminPin: '2026',
      adminEmail: 'andart1174@gmail.com',
      customDomain: '',
      announcement_en: '🌐 Welcome to REMO! Choose your Home City, open your Free Daily 4D City Card Pack & join the World City Cup!',
      announcement_fr: '🌐 Bienvenue sur REMO ! Choisissez votre Ville, ouvrez votre Pack Carte 4D gratuit et rejoignez la Coupe des Villes !',
      announcementActive: true,
      rewards: {
        signupBonus: 150,
        postReward: 15,
        pulseReward: 25,
        duelVoteReward: 20,
        pvpWinReward: 35,
        packCost: 150,
        boostCost: 50,
        mintPostCardCost: 100
      },
      dailyPulse: {
        active: true,
        hashtag: '#RemoGoldenHour',
        title_en: 'Capture your city sky or street vibe tonight!',
        title_fr: 'Capturez le ciel ou l’ambiance de votre ville ce soir !',
        reward: 25
      },
      flashDrop: {
        active: true,
        cityId: 'montreal',
        spotName_en: 'Mont-Royal Belvédère Golden Beacon',
        spotName_fr: 'Balise Dorée du Belvédère Mont-Royal',
        lat: 45.5048,
        lng: -73.5876,
        coins: 300,
        bonusCardCityId: 'montreal',
        expiresAt: now + 15 * 60 * 1000
      }
    },

    cityScores: {
      montreal: 4820,
      paris: 4610,
      chisinau: 4390,
      newyork: 4150,
      tokyo: 3980,
      bucharest: 3740,
      dubai: 3520,
      london: 3390,
      miami: 3120,
      barcelona: 2950,
      monaco: 2880,
      seoul: 2790
    },

    users: [
      {
        uid: 'u_admin_founder',
        name: 'REMO Founder',
        email: 'andart1174@gmail.com',
        role: 'admin',
        verified: true,
        homeCity: 'montreal',
        passportNum: '0001',
        coins: 25000,
        lifetimeCoins: 50000,
        streak: 14,
        visas: ['montreal', 'paris', 'chisinau', 'bucharest', 'newyork', 'tokyo', 'monaco'],
        avatarColor: '#f59e0b'
      },
      {
        uid: 'u_elena_kiv',
        name: 'Elena_KIV',
        email: 'elena@remo.world',
        role: 'vip',
        verified: true,
        homeCity: 'chisinau',
        passportNum: '0007',
        coins: 1840,
        lifetimeCoins: 3200,
        streak: 9,
        visas: ['chisinau', 'bucharest', 'paris', 'rome'],
        avatarColor: '#ec4899'
      },
      {
        uid: 'u_lucas_par',
        name: 'Lucas_Paris',
        email: 'lucas@remo.world',
        role: 'vip',
        verified: true,
        homeCity: 'paris',
        passportNum: '0012',
        coins: 1520,
        lifetimeCoins: 2900,
        streak: 11,
        visas: ['paris', 'monaco', 'london', 'montreal'],
        avatarColor: '#38bdf8'
      },
      {
        uid: 'u_kenji_tyo',
        name: 'Kenji_Shibuya',
        email: 'kenji@remo.world',
        role: 'citizen',
        verified: true,
        homeCity: 'tokyo',
        passportNum: '0019',
        coins: 2100,
        lifetimeCoins: 4100,
        streak: 16,
        visas: ['tokyo', 'seoul', 'singapore', 'newyork'],
        avatarColor: '#10b981'
      }
    ],

    posts: [],

    stories: [
      { id: 'st_1', author: 'REMO Founder', cityId: 'montreal', caption_en: 'Mont-Royal Flash Drop Live! ⚡', caption_fr: 'Flash Drop Mont-Royal en direct ! ⚡', createdAt: now - 1200000 },
      { id: 'st_2', author: 'Elena_KIV', cityId: 'chisinau', caption_en: 'Chișinău Night Walk 🇲🇩✨', caption_fr: 'Promenade nocturne à Chișinău 🇲🇩✨', createdAt: now - 2400000 },
      { id: 'st_3', author: 'Lucas_Paris', cityId: 'paris', caption_en: 'Seine Cruise & Espresso 🗼', caption_fr: 'Croisière sur la Seine 🗼', createdAt: now - 3800000 },
      { id: 'st_4', author: 'Kenji_Shibuya', cityId: 'tokyo', caption_en: 'Akihabara Card Battle! 🎴', caption_fr: 'Duel de Cartes à Akihabara ! 🎴', createdAt: now - 5100000 }
    ],

    duels: [],

    droppedCardsPool: [
      {
        id: 'card_genesis_mtl',
        cityId: 'montreal',
        serial: '0001',
        maxSupply: 1000,
        rarity: 'Mythic 4D',
        themeId: 1,
        verifiedGps: true,
        coinValue: 9500,
        ownerUid: 'u_admin_founder',
        ownerName: 'REMO Founder',
        mintedAt: now - 86400000
      },
      {
        id: 'card_genesis_kiv',
        cityId: 'chisinau',
        serial: '0001',
        maxSupply: 1000,
        rarity: 'Mythic 4D',
        themeId: 0,
        verifiedGps: true,
        coinValue: 9400,
        ownerUid: null, // Available inFeatured / Auction!
        ownerName: 'REMO Treasury',
        mintedAt: now - 43200000
      }
    ],

    auctions: [
      {
        id: 'auc_1',
        cardSpec: { cityId: 'chisinau', serial: '0001', rarity: 'Founder 1-of-1', themeId: 0, verifiedGps: true, coinValue: 12500 },
        sellerName: 'REMO Official Mint',
        currentBid: 650,
        highestBidder: 'Elena_KIV',
        endsAt: now + 18 * 3600 * 1000
      },
      {
        id: 'auc_2',
        cardSpec: { cityId: 'monaco', serial: '0003', rarity: 'Mythic 4D', themeId: 4, verifiedGps: true, coinValue: 10000 },
        sellerName: 'Lucas_Paris',
        currentBid: 480,
        highestBidder: 'Kenji_Shibuya',
        endsAt: now + 9 * 3600 * 1000
      }
    ],

    radarPins: [
      { id: 'pin_mtl', cityId: 'montreal', lat: 45.5048, lng: -73.5876, title_en: 'Mont-Royal Belvédère Cyber Meetup', title_fr: 'Rencontre Cyber Belvédère Mont-Royal', reward: 50 },
      { id: 'pin_kiv', cityId: 'chisinau', lat: 47.0245, lng: 28.8322, title_en: 'Arcul de Triumf REMO Gold Drop', title_fr: 'Drop Doré Arc de Triomphe Chișinău', reward: 75 },
      { id: 'pin_par', cityId: 'paris', lat: 48.8584, lng: 2.2945, title_en: 'Tour Eiffel Midnight Flash Photo', title_fr: 'Photo Flash Minuit Tour Eiffel', reward: 60 },
      { id: 'pin_buh', cityId: 'bucharest', lat: 44.4413, lng: 26.0973, title_en: 'Romanian Athenaeum Creator Hub', title_fr: 'Hub Créateurs Athénée de Bucarest', reward: 50 },
      { id: 'pin_nyc', cityId: 'newyork', lat: 40.7580, lng: -73.9855, title_en: 'Times Square 4D Billboard Drop', title_fr: 'Drop 4D Times Square', reward: 65 },
      { id: 'pin_tyo', cityId: 'tokyo', lat: 35.6595, lng: 139.7004, title_en: 'Shibuya Scramble Neon Check-In', title_fr: 'Check-In Néon Shibuya Crossing', reward: 65 }
    ],

    chatMessages: {
      global: [
        { id: 'm1', author: 'REMO Founder', cityFlag: '⚜️', text: 'Welcome everyone to REMO! English & Français live worldwide 🌐', ts: now - 3600000 },
        { id: 'm2', author: 'Elena_KIV', cityFlag: '🇲🇩', text: 'Salut from Chișinău! Our Triumphal Arch card looks insane in 4D!', ts: now - 1800000 },
        { id: 'm3', author: 'Lucas_Paris', cityFlag: '🗼', text: 'Bonjour à tous ! Qui est prêt pour un duel de cartes PvP ?', ts: now - 900000 }
      ],
      montreal: [
        { id: 'mm1', author: 'REMO Founder', cityFlag: '⚜️', text: 'Montréal squad! Don’t miss the +300 🪙 Flash Drop on Mont-Royal!', ts: now - 1500000 }
      ],
      chisinau: [
        { id: 'mk1', author: 'Elena_KIV', cityFlag: '🇲🇩', text: 'Team Chișinău pushing for #1 in the World City Cup! 🇲🇩🔥', ts: now - 1200000 }
      ],
      paris: [
        { id: 'mp1', author: 'Lucas_Paris', cityFlag: '🗼', text: 'Bienvenue dans le salon officiel de Paris ! ✨', ts: now - 1100000 }
      ]
    },

    directMessages: [
      { id: 'dm1', fromUid: 'u_elena_kiv', fromName: 'Elena_KIV', toUid: 'active', text: 'Hey! Want to trade a Paris card or battle in PvP?', read: true, ts: now - 2000000 }
    ],

    serialCounter: 14,
    cityMayors: {
      montreal: 'u_admin_founder',
      chisinau: 'u_elena_kiv',
      paris: 'u_lucas_par',
      tokyo: 'u_kenji_tyo'
    },
    bounties: getDefaultBounties(now),
    promoCodes: getDefaultPromoCodes(),
    geoVaults: getDefaultGeoVaults(now),
    vipShopItems: getDefaultVipShopItems(),
    vipOrders: [],
    serializedCoins: [
      { id: 'sc_0001', serial: '0001', coinsValue: 1000, ownerUid: 'u_admin_founder', ownerName: 'Founder Admin', mintedAt: now - 86400000, status: 'vault', note: 'Genesis Mint #0001' }
    ],
    cityPortfolios: {},
    wishes: getDefaultWishes(now),
    cityPredictions: getDefaultCityPredictions(now),
    viralContests: getDefaultViralContests(),
    worldSystems: getDefaultUniqueWorldSystems(),
    notifications: []
  };
}

function getDefaultUniqueWorldSystems() {
  return {
    torchRelay: {
      active: false,
      status: 'idle',
      title_en: '4D World Torch Relay™ around the Earth',
      title_fr: 'Relais de la Flamme Olympique 4D REMO™ autour du Monde',
      startCityId: 'montreal',
      currentCityId: 'montreal',
      currentHolderUid: 'u_admin_founder',
      currentHolderName: 'REMO Founder',
      targetCitiesCount: 10,
      jackpotCoins: 5000,
      perPassCoins: 50,
      totalKm: 0,
      visitedCities: ['montreal'],
      holdersHistory: [],
      jackpotPaid: false,
      updatedAt: 0
    },
    globalSync: {
      active: false,
      status: 'idle',
      prompt_en: 'Show the sky or your view in your city right now!',
      prompt_fr: 'Montrez le ciel ou votre vue dans votre ville en cet instant !',
      rewardCoins: 100,
      endsAt: 0,
      moments: [],
      participants: {},
      updatedAt: 0
    },
    mayorElections: {
      active: false,
      status: 'idle',
      voteRewardCoins: 15,
      candidates: {},
      voters: {},
      cityDecrees: {
        montreal: {
          authorUid: 'u_admin_founder',
          authorName: 'REMO Founder',
          text_en: 'Welcome to Montréal 4D Hub — where art, code, and global citizens unite!',
          text_fr: 'Bienvenue au Hub 4D de Montréal — où l’art, le code et les citoyens du monde s’unissent !',
          approved: true,
          updatedAt: 0
        }
      },
      updatedAt: 0
    },
    sisterAlliances: {
      active: false,
      treaties: [],
      updatedAt: 0
    },
    pixelCanvas: {
      active: false,
      width: 24,
      height: 14,
      title_en: 'REMO World Pixel-Art Fresco™',
      title_fr: 'Fresque Pixel-Art Mondiale REMO™',
      pixelRewardCoins: 5,
      pixels: {},
      totalPixelsPlaced: 0,
      contributors: {},
      mintedCardsCount: 0,
      updatedAt: 0
    },
    monumentVault: {
      active: false,
      sealed: true,
      title_en: 'City Monument Time-Vault™',
      title_fr: 'Monument Capsule Temporelle des Villes™',
      unsealTargetLabel_en: 'Official Founder Gala Opening',
      unsealTargetLabel_fr: 'Grande Ouverture Gala du Fondateur',
      depositRewardCoins: 25,
      capsules: [],
      updatedAt: 0
    },
    creatorBourse: {
      active: false,
      dividendPerShareDefault: 30,
      stocks: [
        {
          creatorUid: 'u_admin_founder',
          creatorName: 'REMO Founder',
          cityId: 'montreal',
          sharePrice: 80,
          totalShares: 12,
          shareholders: { u_admin_founder: 5 },
          lastDividendCoins: 0,
          dividendsPaidCount: 0
        },
        {
          creatorUid: 'u_elena_kiv',
          creatorName: 'Elena_KIV',
          cityId: 'chisinau',
          sharePrice: 60,
          totalShares: 8,
          shareholders: { u_admin_founder: 2 },
          lastDividendCoins: 0,
          dividendsPaidCount: 0
        },
        {
          creatorUid: 'u_lucas_par',
          creatorName: 'Lucas_Paris',
          cityId: 'paris',
          sharePrice: 55,
          totalShares: 6,
          shareholders: {},
          lastDividendCoins: 0,
          dividendsPaidCount: 0
        },
        {
          creatorUid: 'u_kenji_tyo',
          creatorName: 'Kenji_TYO',
          cityId: 'tokyo',
          sharePrice: 55,
          totalShares: 6,
          shareholders: {},
          lastDividendCoins: 0,
          dividendsPaidCount: 0
        }
      ],
      updatedAt: 0
    }
  };
}

function getDefaultViralContests() {
  return {
    eurovision: {
      active: false,
      status: 'idle',
      title_en: 'REMO Music Contest — 60s City Sounds & Anthems',
      title_fr: 'REMO Concours Musical — Sons & Hymnes 60s des Villes',
      prizeCoins: 5000,
      endsAt: 0,
      allowCitizenSubmissions: true,
      noSelfCityVote: true,
      entries: [],
      voters: {},
      winnerEntryId: '',
      updatedAt: 0
    },
    photoGrandPrix: {
      active: false,
      status: 'idle',
      title_en: 'World Cities Photo & Video Grand Prix',
      title_fr: 'Grand Prix Photo & Vidéo des Villes',
      prize1st: 3000,
      prize2nd: 1500,
      prize3rd: 750,
      endsAt: 0,
      entries: [],
      voters: {},
      winnersAwarded: false,
      updatedAt: 0
    },
    worldCupBracket: {
      active: false,
      status: 'idle',
      title_en: '8-City World Knockout Cup',
      title_fr: 'Coupe du Monde des Villes (8 Villes)',
      prizePool: 5000,
      round: 'qf',
      endsAt: 0,
      matches: [],
      championCityId: '',
      updatedAt: 0
    },
    mysteryDetective: {
      active: false,
      status: 'idle',
      imageUrl: '',
      clue_en: '',
      clue_fr: '',
      correctCityId: 'paris',
      rewardCoins: 500,
      maxWinners: 15,
      endsAt: 0,
      attempts: {},
      winners: [],
      updatedAt: 0
    },
    goldenRaffle: {
      active: false,
      status: 'idle',
      title_en: 'Founder’s Golden Ticket Raffle',
      title_fr: 'Grande Tombola Ticket d’Or du Fondateur',
      prizeCoins: 2500,
      winnersCount: 3,
      endsAt: 0,
      tickets: [],
      winningTickets: [],
      updatedAt: 0
    },
    flashHunt: {
      active: false,
      status: 'idle',
      riddle_en: '',
      riddle_fr: '',
      targetCityId: 'montreal',
      rewardCoins: 300,
      maxClaims: 20,
      claims: [],
      attempts: {},
      updatedAt: 0
    }
  };
}

function getDefaultCityPredictions(now = Date.now()) {
  return [
    {
      id: 'pred_mtl_kiv',
      cityId: 'montreal',
      cityFlag: '⚜️',
      title_en: 'Will Montréal hold #1 against Chișinău in tonight’s City Cup?',
      title_fr: 'Montréal conservera-t-elle la 1ère place face à Chișinău ce soir ?',
      endsAt: now + 3600000 * 7,
      endsInStr: '7h',
      status: 'open',
      totalPool: 830,
      options: [
        { id: 'opt_yes', label_en: 'YES • Montréal Wins', label_fr: 'OUI • Montréal Gagne', votes: 34, pool: 450 },
        { id: 'opt_no', label_en: 'NO • Chișinău Comeback', label_fr: 'NON • Remontée Chișinău', votes: 29, pool: 380 }
      ],
      bets: []
    },
    {
      id: 'pred_paris_rain',
      cityId: 'paris',
      cityFlag: '🗼',
      title_en: 'Will rain or snow fall on Paris in the next 24 hours?',
      title_fr: 'Pleuvra-t-il ou neigera-t-il sur Paris dans les prochaines 24h ?',
      endsAt: now + 3600000 * 14,
      endsInStr: '14h',
      status: 'open',
      totalPool: 600,
      options: [
        { id: 'opt_yes', label_en: 'YES • Rain / Snow', label_fr: 'OUI • Pluie / Neige', votes: 19, pool: 280 },
        { id: 'opt_no', label_en: 'NO • Clear Sky', label_fr: 'NON • Ciel Dégagé', votes: 23, pool: 320 }
      ],
      bets: []
    },
    {
      id: 'pred_tokyo_moments',
      cityId: 'tokyo',
      cityFlag: '🗼',
      title_en: 'Will Tokyo break the 100 Moments milestone before midnight?',
      title_fr: 'Tokyo franchira-t-elle le cap des 100 Moments avant minuit ?',
      endsAt: now + 3600000 * 9,
      endsInStr: '9h',
      status: 'open',
      totalPool: 710,
      options: [
        { id: 'opt_yes', label_en: 'YES • Over 100 Moments', label_fr: 'OUI • Plus de 100 Moments', votes: 41, pool: 520 },
        { id: 'opt_no', label_en: 'NO • Under 100 Moments', label_fr: 'NON • Moins de 100 Moments', votes: 15, pool: 190 }
      ],
      bets: []
    }
  ];
}

function getDefaultWishes(now = Date.now()) {
  return [
    {
      id: 'wish_kiv_1',
      cityId: 'chisinau',
      cityName: 'Chișinău',
      cityFlag: '🇲🇩',
      authorName: 'Elena_KIV',
      authorUid: 'u_elena_kiv',
      text: 'Paix, prospérité et un avenir radieux pour Chișinău et tous nos concitoyens à travers le monde ! 🇲🇩✨',
      blessings: 18,
      blessedUids: ['u_admin_founder'],
      timestamp: now - 3600000 * 3,
      isAnonymous: false
    },
    {
      id: 'wish_mtl_2',
      cityId: 'montreal',
      cityName: 'Montréal',
      cityFlag: '⚜️',
      authorName: 'REMO Founder',
      authorUid: 'u_admin_founder',
      text: 'Que Montréal reste un phare d’art, de technologie et de liberté créative pour le monde entier ! ⚜️🍁',
      blessings: 24,
      blessedUids: ['u_elena_kiv'],
      timestamp: now - 3600000 * 5,
      isAnonymous: false
    },
    {
      id: 'wish_tyo_1',
      cityId: 'tokyo',
      cityName: 'Tokyo',
      cityFlag: '🗼',
      authorName: 'Kenji_TYO',
      authorUid: 'u_kenji_tyo',
      text: 'May neon dreams inspire every creator in the 4D World! 🗼⚡ Arigato REMO!',
      blessings: 15,
      blessedUids: [],
      timestamp: now - 3600000 * 7,
      isAnonymous: false
    },
    {
      id: 'wish_par_1',
      cityId: 'paris',
      cityName: 'Paris',
      cityFlag: '🗼',
      authorName: 'Citoyen Secret',
      authorUid: '',
      text: 'Amour, art et lumière sur Paris et toutes les cités reliées par le réseau 4D ! ✨🗼',
      blessings: 11,
      blessedUids: [],
      timestamp: now - 3600000 * 12,
      isAnonymous: true
    }
  ];
}

function getDefaultBounties(now = Date.now()) {
  return [
    {
      id: 'bty_kiv_1',
      cityId: 'chisinau',
      sponsorName: 'REMO Treasury',
      format: 'photo_or_video',
      reward: 500,
      title_en: '🇲🇩 Chișinău Golden Gates or Triumphal Arch Night Shot',
      title_fr: '🇲🇩 Photo/Vidéo Nocturne des Portes de la Ville ou Arc de Triomphe à Chișinău',
      status: 'open',
      submissions: [],
      winnerName: '',
      createdAt: now - 3600000
    },
    {
      id: 'bty_html_1',
      cityId: 'montreal',
      sponsorName: 'REMO Founder',
      format: 'html_app',
      reward: 750,
      title_en: '💻 Global Code Bounty: Build an Interactive HTML Mini-Game or 3D City Visualizer!',
      title_fr: '💻 Mission Code HTML : Créez un Mini-Jeu HTML5 ou Visualiseur 3D Interactif !',
      status: 'open',
      submissions: [],
      winnerName: '',
      createdAt: now - 7200000
    },
    {
      id: 'bty_par_1',
      cityId: 'paris',
      sponsorName: 'Lucas_Paris',
      format: 'video_60s',
      reward: 400,
      title_en: '🗼 60-Second Street Vibe or Café Moment in Your City',
      title_fr: '🗼 Vidéo 60s d’Ambiance Urbaine ou Café dans Votre Ville',
      status: 'open',
      submissions: [],
      winnerName: '',
      createdAt: now - 9800000
    }
  ];
}

function getDefaultPromoCodes() {
  return [
    { code: 'REMO2026', coins: 300, bonusCityCard: '', maxUses: 999, redeemedBy: [] },
    { code: 'CHISINAU4D', coins: 500, bonusCityCard: 'chisinau', maxUses: 500, redeemedBy: [] },
    { code: 'MONTREALVIP', coins: 400, bonusCityCard: 'montreal', maxUses: 500, redeemedBy: [] }
  ];
}

function getDefaultGeoVaults(now = Date.now()) {
  return [
    {
      id: 'vault_kiv_gates',
      cityId: 'chisinau',
      title_en: 'Gates of Chișinău Golden Vault',
      title_fr: 'Coffre Doré des Portes de Chișinău',
      hint_en: 'Guarded by the iconic white-stone stepped towers framing the southern entryway on Dacia Boulevard.',
      hint_fr: 'Gardé par les célèbres tours blanches en gradins marquant l’entrée sud sur le Boulevard Dacia.',
      lat: 46.9782,
      lng: 28.8785,
      radiusMeters: 400,
      coinsReward: 350,
      rarity: 'Mythic 4D',
      cardCityId: 'chisinau',
      sponsorName: 'Chișinău Pioneer',
      unlockedBy: [],
      createdAt: now - 3600000
    },
    {
      id: 'vault_par_louvre',
      cityId: 'paris',
      title_en: 'Louvre Glass Pyramid Holographic Vault',
      title_fr: 'Coffre Holographique Pyramide du Louvre',
      hint_en: 'Right at the geometric center of the Cour Napoléon where the glass pyramid mirrors the sunset.',
      hint_fr: 'Au centre géométrique de la Cour Napoléon où la pyramide de verre reflète le crépuscule.',
      lat: 48.8606,
      lng: 2.3376,
      radiusMeters: 350,
      coinsReward: 300,
      rarity: 'Mythic 4D',
      cardCityId: 'paris',
      sponsorName: 'Lucas_Paris',
      unlockedBy: [],
      createdAt: now - 7200000
    },
    {
      id: 'vault_mtl_summit',
      cityId: 'montreal',
      title_en: 'Mount Royal Belvedere Summit Vault',
      title_fr: 'Coffre du Sommet Belvédère Mont-Royal',
      hint_en: 'At the Kondiaronk lookout overlooking the illuminated cyber skyline of Downtown Montréal.',
      hint_fr: 'Au belvédère Kondiaronk surplombant l’horizon illuminé du centre-ville de Montréal.',
      lat: 45.5048,
      lng: -73.5876,
      radiusMeters: 350,
      coinsReward: 250,
      rarity: 'Legendary Gold',
      cardCityId: 'montreal',
      sponsorName: 'REMO Founder',
      unlockedBy: [],
      createdAt: now - 10800000
    },
    {
      id: 'vault_buh_athenaeum',
      cityId: 'bucharest',
      title_en: 'Romanian Athenaeum Classical Vault',
      title_fr: 'Coffre Classique de l’Athénée Roumain',
      hint_en: 'Beside the majestic ionic peristyle in George Enescu square in the heart of Bucharest.',
      hint_fr: 'Aux abords du péristyle ionique majestueux sur la place George Enescu au cœur de Bucarest.',
      lat: 44.4413,
      lng: 26.0973,
      radiusMeters: 350,
      coinsReward: 250,
      rarity: 'Legendary Gold',
      cardCityId: 'bucharest',
      sponsorName: 'Bucharest Hub',
      unlockedBy: [],
      createdAt: now - 14400000
    },
    {
      id: 'vault_nyc_centralpark',
      cityId: 'newyork',
      title_en: 'Central Park Bethesda Terrace Vault',
      title_fr: 'Coffre Bethesda Terrace Central Park',
      hint_en: 'Under the arched Minton tile ceiling by the Angel of the Waters fountain.',
      hint_fr: 'Sous les arches de céramique Minton près de la fontaine Angel of the Waters.',
      lat: 40.7738,
      lng: -73.9708,
      radiusMeters: 400,
      coinsReward: 350,
      rarity: 'Mythic 4D',
      cardCityId: 'newyork',
      sponsorName: 'NYC Explorer',
      unlockedBy: [],
      createdAt: now - 18000000
    },
    {
      id: 'vault_tyo_shibuya',
      cityId: 'tokyo',
      title_en: 'Shibuya Crossing Cyber Vault',
      title_fr: 'Coffre Cyber du Carrefour de Shibuya',
      hint_en: 'Surrounded by massive holographic screens and neon crosswalks at the world’s busiest scramble.',
      hint_fr: 'Entouré d’écrans holographiques géants et de néons au carrefour le plus effervescent du monde.',
      lat: 35.6595,
      lng: 139.7004,
      radiusMeters: 300,
      coinsReward: 400,
      rarity: 'Mythic 4D',
      cardCityId: 'tokyo',
      sponsorName: 'Kenji_Shibuya',
      unlockedBy: [],
      createdAt: now - 21600000
    }
  ];
}

function getDefaultVipShopItems() {
  return [
    // Animated 4D Neon Avatar Frames
    {
      id: 'frame_gold_fire',
      category: 'frame',
      icon: '🔥',
      cssClass: 'av-frame-gold_fire',
      name_en: 'Solar Crown 4D Frame',
      name_fr: 'Cadre Couronne Solaire 4D',
      desc_en: 'Blazing animated golden solar aura around your avatar across REMO.',
      desc_fr: 'Aura solaire dorée animée autour de votre avatar sur tout REMO.',
      price: 300
    },
    {
      id: 'frame_cyber_matrix',
      category: 'frame',
      icon: '⚡',
      cssClass: 'av-frame-cyber_matrix',
      name_en: 'Cyber Matrix Neon Ring',
      name_fr: 'Anneau Néon Cyber Matrix',
      desc_en: 'Spinning cyan & emerald holographic halo for tech creators.',
      desc_fr: 'Halo holographique cyan & émeraude rotatif pour créateurs cyber.',
      price: 250
    },
    {
      id: 'frame_diamond_vip',
      category: 'frame',
      icon: '💎',
      cssClass: 'av-frame-diamond_vip',
      name_en: 'Royal Diamond Prism',
      name_fr: 'Prisme Diamant Royal',
      desc_en: 'Ultra-luxury prismatic violet & pink diamond shimmer.',
      desc_fr: 'Éclat prismatique diamant violet & rose ultra-luxe.',
      price: 500
    },
    {
      id: 'frame_tricolor_crest',
      category: 'frame',
      icon: '👑',
      cssClass: 'av-frame-tricolor_crest',
      name_en: 'Imperial Gold & Ruby Crest',
      name_fr: 'Blason Impérial Or & Rubis',
      desc_en: 'Regal sapphire, gold & crimson aura worthy of World Champions.',
      desc_fr: 'Aura royale saphir, or & rubis digne des Champions du Monde.',
      price: 400
    },

    // Royal Citizen Titles (Displayed next to @Username)
    {
      id: 'title_legend',
      category: 'title',
      icon: '👑',
      badge_en: '👑 URBAN LEGEND',
      badge_fr: '👑 LÉGENDE URBAINE',
      name_en: 'Title: Urban Legend',
      name_fr: 'Titre : Légende Urbaine',
      desc_en: 'Displays the glowing [👑 URBAN LEGEND] badge next to your name.',
      desc_fr: 'Affiche le badge lumineux [👑 LÉGENDE URBAINE] à côté de votre nom.',
      price: 200
    },
    {
      id: 'title_architect',
      category: 'title',
      icon: '💻',
      badge_en: '💻 4D ARCHITECT',
      badge_fr: '💻 ARCHITECTE 4D',
      name_en: 'Title: 4D Cyber Architect',
      name_fr: 'Titre : Architecte Cyber 4D',
      desc_en: 'Elite title for Live HTML coders & digital city builders.',
      desc_fr: 'Titre d’élite pour les créateurs de code HTML Live & bâtisseurs.',
      price: 250
    },
    {
      id: 'title_mogul',
      category: 'title',
      icon: '💎',
      badge_en: '💎 CITY MOGUL',
      badge_fr: '💎 MAGNAT URBAIN',
      name_en: 'Title: World City Mogul',
      name_fr: 'Titre : Magnat des Villes',
      desc_en: 'Prestigious badge reserved for top City Stock investors & collectors.',
      desc_fr: 'Badge de prestige réservé aux grands investisseurs & collectionneurs.',
      price: 450
    },
    {
      id: 'title_pioneer',
      category: 'title',
      icon: '🚀',
      badge_en: '🚀 PIONEER #1',
      badge_fr: '🚀 PIONNIER #1',
      name_en: 'Title: Founding Pioneer',
      name_fr: 'Titre : Pionnier Fondateur',
      desc_en: 'Marks you forever as an early pioneer of the REMO network.',
      desc_fr: 'Certifie votre statut de pionnier historique du réseau REMO.',
      price: 180
    },

    // Real-World & Founder VIP Perks / Vouchers
    {
      id: 'perk_physical_card',
      category: 'perk',
      icon: '🎴',
      name_en: 'Physical Printed 4D City Card (Official Mail)',
      name_fr: 'Carte Ville 4D Imprimée Physique (Envoi Officiel)',
      desc_en: 'Redeem an official voucher for a real 63.5×88.9mm Collector Card approved by the Founder!',
      desc_fr: 'Obtenez un bon officiel pour une vraie Carte Collector 63.5×88.9mm validée par le Fondateur !',
      price: 2500
    },
    {
      id: 'perk_spotlight_24h',
      category: 'perk',
      icon: '📌',
      name_en: 'Front-Page #1 Spotlight Pass (24h)',
      name_fr: 'Pass Publication Épinglée #1 (24h)',
      desc_en: 'Official voucher to feature your best post at #1 on REMO + bonus Mythic status!',
      desc_fr: 'Bon officiel pour propulser votre post en #1 sur REMO avec statut VIP !',
      price: 750
    },
    {
      id: 'perk_mythic_pack',
      category: 'perk',
      icon: '🌌',
      name_en: 'Guaranteed Mythic 4D Founder Card Drop',
      name_fr: 'Carte Fondateur Mythic 4D Garantie',
      desc_en: 'Instantly mints a 1-of-1 Mythic 4D City Card directly into your Vault + VIP Ticket!',
      desc_fr: 'Forge instantanément une Carte Ville Mythic 4D dans votre Coffre + Ticket VIP !',
      price: 900
    }
  ];
}

/* ── Instant Bilingual EN ⇄ FR Auto-Translator & Viral Co-Pilot Engine ── */
const REMO_TRANSLATOR = {
  phrasesEnToFr: [
    ['what is happening in', 'que se passe-t-il à'],
    ['right now', 'en ce moment'],
    ['tonight in', 'ce soir à'],
    ['live from', 'en direct de'],
    ['sunset over', 'coucher de soleil sur'],
    ['night vibe in', 'ambiance nocturne à'],
    ['night vibes in', 'ambiance nocturne à'],
    ['golden hour in', 'heure dorée à'],
    ['check out this', 'découvrez ce'],
    ['who wants to battle', 'qui veut affronter'],
    ['drop a comment', 'laissez un commentaire'],
    ['rate this view', 'notez cette vue'],
    ['best city in the world', 'meilleure ville du monde'],
    ['tap to play', 'touchez pour jouer'],
    ['built in pure html', 'codé en pur HTML'],
    ['good morning', 'bonjour'],
    ['good night', 'bonne nuit'],
    ['street food', 'cuisine de rue'],
    ['hidden gem', 'pépite secrète'],
    ['unbelievable view', 'vue incroyable'],
    ['let us go', 'allons-y'],
    ['join me in', 'rejoignez-moi à'],
    ['who is awake in', 'qui est réveillé à']
  ],
  wordsEnToFr: {
    amazing: 'incroyable', awesome: 'génial', beautiful: 'magnifique', night: 'nuit',
    city: 'ville', world: 'monde', sky: 'ciel', sunset: 'coucher de soleil',
    sunrise: 'lever du soleil', street: 'rue', lights: 'lumières', music: 'musique',
    game: 'jeu', code: 'code', video: 'vidéo', photo: 'photo', love: 'adore',
    today: 'aujourd’hui', tonight: 'ce soir', friends: 'amis', welcome: 'bienvenue',
    coffee: 'café', winter: 'hiver', summer: 'été', magic: 'magie', energy: 'énergie',
    new: 'nouveau', first: 'premier', best: 'meilleur', winner: 'gagnant', card: 'carte',
    coins: 'pièces', secret: 'secret', downtown: 'centre-ville', architecture: 'architecture',
    festival: 'festival', party: 'soirée', dream: 'rêve', future: 'futur', fast: 'rapide',
    watch: 'regardez', play: 'jouez', vote: 'votez', share: 'partagez', here: 'ici',
    with: 'avec', from: 'depuis', my: 'mon', your: 'votre', our: 'notre', the: 'le', and: 'et', in: 'à'
  },

  detectLang(text = '') {
    const s = String(text).toLowerCase();
    const frSignals = /[éèêëàâîïôûùçœ]|(\b(le|la|les|des|dans|avec|pour|une|cette|monde|ville|soir|magnifique|incroyable|bienvenue|bonjour|voici|depuis)\b)/i;
    return frSignals.test(s) ? 'fr' : 'en';
  },

  translateSync(text = '', targetLang = 'fr') {
    if (!text || !text.trim()) return '';
    const srcLang = this.detectLang(text);
    if (srcLang === targetLang) return text.trim();

    let out = text.trim();
    if (targetLang === 'fr') {
      this.phrasesEnToFr.forEach(([enP, frP]) => {
        const rx = new RegExp(enP, 'gi');
        out = out.replace(rx, frP);
      });
      out = out.replace(/\b([A-Za-z']+)\b/g, (m) => {
        const low = m.toLowerCase();
        if (!this.wordsEnToFr[low]) return m;
        const tr = this.wordsEnToFr[low];
        return m[0] === m[0].toUpperCase() ? tr.charAt(0).toUpperCase() + tr.slice(1) : tr;
      });
      return out === text.trim() ? `🇫🇷 ${out}` : out;
    } else {
      // FR -> EN reverse phrase & word pass
      this.phrasesEnToFr.forEach(([enP, frP]) => {
        const rx = new RegExp(frP, 'gi');
        out = out.replace(rx, enP);
      });
      const revWords = {};
      Object.entries(this.wordsEnToFr).forEach(([enW, frW]) => { revWords[frW.toLowerCase()] = enW; });
      revWords['à'] = 'in'; revWords['et'] = 'and'; revWords['la'] = 'the'; revWords['les'] = 'the';
      revWords['magnifique'] = 'stunning'; revWords['incroyable'] = 'incredible'; revWords['découvrez'] = 'check out';
      revWords['bonjour'] = 'hello'; revWords['soirée'] = 'nightlife'; revWords['ville'] = 'city';
      out = out.replace(/([A-Za-zÀ-ÿ’']+)/g, (m) => {
        const low = m.toLowerCase();
        if (!revWords[low]) return m;
        const tr = revWords[low];
        return m[0] === m[0].toUpperCase() ? tr.charAt(0).toUpperCase() + tr.slice(1) : tr;
      });
      return out === text.trim() ? `🇬🇧 ${out}` : out;
    }
  },

  makeBilingualPair(rawText = '') {
    const clean = String(rawText || '').trim();
    if (!clean) return { en: '', fr: '' };
    const lang = this.detectLang(clean);
    if (lang === 'fr') {
      return { en: this.translateSync(clean, 'en'), fr: clean };
    }
    return { en: clean, fr: this.translateSync(clean, 'fr') };
  }
};

/* ── 3B. REMO_WEATHER — Live World City Clock, Weather & 2X Storm Surge Engine ── */
const REMO_CITY_TIMEZONES = {
  montreal: 'America/Toronto',
  toronto: 'America/Toronto',
  newyork: 'America/New_York',
  miami: 'America/New_York',
  losangeles: 'America/Los_Angeles',
  rio: 'America/Sao_Paulo',
  london: 'Europe/London',
  lisbon: 'Europe/Lisbon',
  paris: 'Europe/Paris',
  monaco: 'Europe/Monaco',
  barcelona: 'Europe/Madrid',
  rome: 'Europe/Rome',
  geneva: 'Europe/Zurich',
  berlin: 'Europe/Berlin',
  amsterdam: 'Europe/Amsterdam',
  bucharest: 'Europe/Bucharest',
  chisinau: 'Europe/Chisinau',
  istanbul: 'Europe/Istanbul',
  cairo: 'Africa/Cairo',
  dubai: 'Asia/Dubai',
  singapore: 'Asia/Singapore',
  seoul: 'Asia/Seoul',
  tokyo: 'Asia/Tokyo',
  sydney: 'Australia/Sydney'
};

const REMO_WEATHER = {
  _liveCache: {},
  _fetching: {},

  getLocalClock(city) {
    const now = new Date();
    const tz = city && REMO_CITY_TIMEZONES[city.id];
    if (tz) {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).formatToParts(now);
        const hh = parts.find((p) => p.type === 'hour')?.value || '12';
        const mm = parts.find((p) => p.type === 'minute')?.value || '00';
        const hNum = Number(hh) % 24;
        return { timeStr: `${String(hNum).padStart(2, '0')}:${mm}`, hour: hNum, isNight: hNum < 6 || hNum >= 20 };
      } catch (e) {}
    }
    // Longitude solar timezone fallback for any user-founded city!
    const offsetHrs = Math.round(((city && Number(city.lng)) || 0) / 15);
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const localDate = new Date(utcMs + offsetHrs * 3600000);
    const hNum = localDate.getHours();
    const mNum = localDate.getMinutes();
    return {
      timeStr: `${String(hNum).padStart(2, '0')}:${String(mNum).padStart(2, '0')}`,
      hour: hNum,
      isNight: hNum < 6 || hNum >= 20
    };
  },

  maybeHydrateOnline(city) {
    if (!city || !city.id || typeof fetch === 'undefined') return;
    const cached = this._liveCache[city.id];
    if (cached && Date.now() - cached.ts < 15 * 60000) return;
    if (this._fetching[city.id]) return;
    this._fetching[city.id] = true;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${Number(city.lat).toFixed(2)}&longitude=${Number(city.lng).toFixed(2)}&current_weather=true`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.current_weather) {
          const cw = data.current_weather;
          const code = Number(cw.weathercode || 0);
          const mapped = this.mapWmoCode(code, cw.is_day === 0);
          this._liveCache[city.id] = {
            ts: Date.now(),
            tempC: Math.round(cw.temperature),
            ...mapped
          };
        }
      })
      .catch(() => {})
      .finally(() => {
        this._fetching[city.id] = false;
      });
  },

  mapWmoCode(code, isNight) {
    if (code >= 95) return { icon: '⛈️', cond_en: 'Thunderstorm', cond_fr: 'Orage Électrique', naturalStorm: true };
    if (code >= 71 && code <= 86) return { icon: '❄️', cond_en: 'Snowfall', cond_fr: 'Chute de Neige', naturalStorm: true };
    if (code >= 51 && code <= 67) return { icon: '🌧️', cond_en: 'Neon Rain', cond_fr: 'Pluie Fine', naturalStorm: true };
    if (code >= 80 && code <= 82) return { icon: '🌧️', cond_en: 'Rain Showers', cond_fr: 'Averses', naturalStorm: true };
    if (code >= 1 && code <= 3) return { icon: isNight ? '☁️' : '⛅', cond_en: 'Partly Cloudy', cond_fr: 'Nuageux', naturalStorm: false };
    if (code >= 45 && code <= 48) return { icon: '🌫️', cond_en: 'Misty Glow', cond_fr: 'Brume', naturalStorm: false };
    return { icon: isNight ? '🌙' : '☀️', cond_en: isNight ? 'Clear Night' : 'Sunny Sky', cond_fr: isNight ? 'Nuit Claire' : 'Grand Soleil', naturalStorm: false };
  },

  getCityLiveStatus(cityOrId) {
    const city = typeof cityOrId === 'string'
      ? (typeof getCityById === 'function' ? getCityById(cityOrId) : { id: cityOrId, lat: 45.5, lng: -73.5 })
      : (cityOrId || { id: 'montreal', lat: 45.5, lng: -73.5 });

    const clock = this.getLocalClock(city);
    this.maybeHydrateOnline(city);

    let tempC, icon, cond_en, cond_fr, naturalStorm;
    const live = this._liveCache[city.id];
    if (live) {
      ({ tempC, icon, cond_en, cond_fr, naturalStorm } = live);
    } else {
      // Smart deterministic offline climate + live day/night cycle
      const absLat = Math.abs(Number(city.lat) || 45);
      const month = new Date().getMonth(); // 0-11
      const northernSummer = (Number(city.lat) >= 0) ? (month >= 4 && month <= 8) : (month <= 2 || month >= 10);
      const baseTemp = Math.round(29 - absLat * 0.42 + (northernSummer ? 6 : -3) + (clock.isNight ? -4 : 3));
      let hash = 0;
      const seedStr = `${city.id}_${new Date().getDate()}_${Math.floor(clock.hour / 4)}`;
      for (let i = 0; i < seedStr.length; i++) hash = (hash * 31 + seedStr.charCodeAt(i)) % 100;

      tempC = baseTemp + ((hash % 5) - 2);
      if (hash >= 86) {
        if (tempC <= 1) {
          icon = '❄️'; cond_en = 'Snow Surge'; cond_fr = 'Neige Vive'; naturalStorm = true;
        } else {
          icon = '⛈️'; cond_en = 'Cyber Storm'; cond_fr = 'Orage Cyber'; naturalStorm = true;
        }
      } else if (hash >= 74) {
        icon = '🌧️'; cond_en = 'Light Rain'; cond_fr = 'Pluie Légère'; naturalStorm = true;
      } else if (hash >= 45) {
        icon = clock.isNight ? '☁️' : '⛅'; cond_en = 'Breezy'; cond_fr = 'Brise Douce'; naturalStorm = false;
      } else {
        icon = clock.isNight ? '🌙' : '☀️';
        cond_en = clock.isNight ? 'Starry Night' : 'Clear Sky';
        cond_fr = clock.isNight ? 'Nuit Étoilée' : 'Ciel Azur';
        naturalStorm = false;
      }
    }

    const surgeMap = (REMO_STORE.state && REMO_STORE.state.cityWeatherSurge) || {};
    const explicit = surgeMap[city.id];
    const isSurge = explicit === true ? true : explicit === false ? false : !!naturalStorm;
    if (explicit === true && !naturalStorm) {
      icon = tempC <= 0 ? '❄️' : '⛈️';
      cond_en = tempC <= 0 ? 'Snow Surge 2X' : 'Storm Surge 2X';
      cond_fr = tempC <= 0 ? 'Tempête Neige 2X' : 'Orage Bonus 2X';
    }

    return {
      cityId: city.id,
      timeStr: clock.timeStr,
      hour: clock.hour,
      isNight: clock.isNight,
      dayNightIcon: clock.isNight ? '🌙' : '☀️',
      tempC,
      icon,
      cond_en,
      cond_fr,
      isSurge
    };
  },

  toggleAdminCitySurge(cityId) {
    if (!REMO_STORE.state) return false;
    REMO_STORE.state.cityWeatherSurge = REMO_STORE.state.cityWeatherSurge || {};
    const cur = this.getCityLiveStatus(cityId).isSurge;
    REMO_STORE.state.cityWeatherSurge[cityId] = !cur;
    REMO_STORE.save(true, 'weather_surge_toggle');
    return !cur;
  }
};

function getShowcaseTimeCapsuleHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;user-select:none}
  body{margin:0;height:100vh;overflow:hidden;background:radial-gradient(circle at 50% 35%,#1e1b4b,#040714 75%);color:#fff;font-family:'Segoe UI',sans-serif}
  canvas{display:block;width:100%;height:100%;cursor:pointer}
  .hud{position:fixed;top:40px;left:12px;right:12px;display:flex;justify-content:space-between;font-weight:900;font-size:13px;pointer-events:none;text-shadow:0 2px 8px #000}
  .pill{background:rgba(15,23,42,0.82);border:1px solid #fbbf24;padding:4px 10px;border-radius:99px;color:#fde68a}
  </style></head><body>
  <div class="hud"><span class="pill">🔓 CHIȘINĂU × MONTRÉAL VAULT</span><span class="pill" id="sc">💎 TAP GEMS: 0</span></div>
  <canvas id="c"></canvas>
  <script>
  const cv=document.getElementById('c'),ctx=cv.getContext('2d');
  let W,H,pts=0,gems=[];
  function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight}rs();addEventListener('resize',rs);
  function spawn(){gems.push({x:40+Math.random()*(W-80),y:H+20,vy:-1.8-Math.random()*2.2,r:20,ic:['💎','🪙','👑','🇲🇩','⚜️'][Math.floor(Math.random()*5)]})}
  for(let i=0;i<7;i++)spawn();
  cv.addEventListener('pointerdown',e=>{
    const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    gems.forEach(g=>{if(Math.hypot(g.x-mx,g.y-my)<34){pts+=25;g.y=H+40;g.x=40+Math.random()*(W-80);document.getElementById('sc').textContent='💎 TAP GEMS: '+pts}});
  });
  function loop(){
    ctx.fillStyle='rgba(4,7,20,0.28)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='900 18px sans-serif';ctx.fillStyle='#38bdf8';
    ctx.fillText('🎉 TIME-CAPSULE UNSEALED! TAP RISING TREASURES',W/2,H-24);
    ctx.font='28px serif';
    gems.forEach(g=>{g.y+=g.vy;if(g.y<-30){g.y=H+30;g.x=40+Math.random()*(W-80)}ctx.fillText(g.ic,g.x,g.y)});
    requestAnimationFrame(loop);
  }loop();
  </script></body></html>`;
}

function upgradeEcosystemState(st) {
  if (!st) return;
  if (st.settings && st.settings.happyHour2x === undefined) st.settings.happyHour2x = false;
  if (st.settings && st.settings.rewards && !st.settings.rewards.referralBonus) {
    st.settings.rewards.referralBonus = 100;
  }
  if (!st.cityWeatherSurge) {
    st.cityWeatherSurge = { chisinau: true, montreal: true };
  }
  if (!st.cityMayors) {
    st.cityMayors = {
      montreal: 'u_admin_founder',
      chisinau: 'u_elena_kiv',
      paris: 'u_lucas_par',
      tokyo: 'u_kenji_tyo'
    };
  }
  if (!Array.isArray(st.bounties)) st.bounties = getDefaultBounties();
  if (!Array.isArray(st.promoCodes)) st.promoCodes = getDefaultPromoCodes();
  if (!st.cityPortfolios) st.cityPortfolios = {};
  if (!Array.isArray(st.notifications)) st.notifications = [];
  if (!Array.isArray(st.vipShopItems) || st.vipShopItems.length === 0) {
    st.vipShopItems = getDefaultVipShopItems();
  }
  if (!Array.isArray(st.vipOrders)) st.vipOrders = [];
  if (!Array.isArray(st.geoVaults) || st.geoVaults.length === 0) {
    st.geoVaults = getDefaultGeoVaults();
  } else {
    st.geoVaults.forEach((v) => {
      if (!v.tier) v.tier = (v.coinsReward >= 500 ? 'diamond' : (v.coinsReward >= 250 ? 'gold' : 'wood'));
    });
  }
  if (!Array.isArray(st.serializedCoins) || st.serializedCoins.length === 0) {
    st.serializedCoins = [
      { id: 'sc_0001', serial: '0001', coinsValue: 1000, ownerUid: 'u_admin_founder', ownerName: 'Founder Admin', mintedAt: Date.now() - 86400000, status: 'vault', note: 'Genesis Mint #0001' }
    ];
  }
  if (!Array.isArray(st.wishes) || st.wishes.length === 0) {
    st.wishes = getDefaultWishes();
  } else {
    st.wishes.forEach((w) => {
      if (w.text && (w.text.includes('Pace,') || w.text.includes('pentru Chișinău și toți'))) {
        w.text = 'Paix, prospérité et un avenir radieux pour Chișinău et tous nos concitoyens à travers le monde ! 🇲🇩✨';
      }
      if (!w.cityName && w.cityId && typeof getCityById === 'function') {
        const c = getCityById(w.cityId);
        if (c) {
          w.cityName = c.name_fr || c.name_en;
          w.cityFlag = c.flag;
        }
      }
    });
  }

  if (!Array.isArray(st.cityPredictions) || st.cityPredictions.length === 0) {
    st.cityPredictions = getDefaultCityPredictions();
  }

  const defContests = getDefaultViralContests();
  if (!st.viralContests || typeof st.viralContests !== 'object') {
    st.viralContests = defContests;
  } else {
    Object.keys(defContests).forEach((k) => {
      if (!st.viralContests[k] || typeof st.viralContests[k] !== 'object') {
        st.viralContests[k] = defContests[k];
      } else {
        st.viralContests[k] = Object.assign({}, defContests[k], st.viralContests[k]);
      }
    });
    if (st.viralContests.eurovision) {
      if (/eurovision/i.test(st.viralContests.eurovision.title_en || '')) {
        st.viralContests.eurovision.title_en = 'REMO Music Contest — 60s City Sounds & Anthems';
      }
      if (/eurovision/i.test(st.viralContests.eurovision.title_fr || '')) {
        st.viralContests.eurovision.title_fr = 'REMO Concours Musical — Sons & Hymnes 60s des Villes';
      }
    }
  }

  const defSystems = getDefaultUniqueWorldSystems();
  if (!st.worldSystems || typeof st.worldSystems !== 'object') {
    st.worldSystems = defSystems;
  } else {
    Object.keys(defSystems).forEach((k) => {
      if (!st.worldSystems[k] || typeof st.worldSystems[k] !== 'object') {
        st.worldSystems[k] = defSystems[k];
      } else {
        st.worldSystems[k] = Object.assign({}, defSystems[k], st.worldSystems[k]);
      }
    });
  }

  // Upgrade every citizen with Referral Codes & VIP Cosmetics
  (st.users || []).forEach((u, idx) => {
    const pNum = u.passportNum || String(idx + 1).padStart(4, '0');
    if (!u.referralCode) u.referralCode = `REMO-${pNum}`;
    if (u.referralsCount === undefined) {
      u.referralsCount = u.uid === 'u_admin_founder' ? 5 : u.uid === 'u_elena_kiv' ? 3 : u.uid === 'u_lucas_par' ? 2 : 0;
    }
    if (!Array.isArray(u.ownedShopItems)) {
      if (u.uid === 'u_admin_founder') u.ownedShopItems = ['frame_gold_fire', 'title_legend'];
      else if (u.uid === 'u_elena_kiv') u.ownedShopItems = ['frame_diamond_vip', 'title_architect'];
      else u.ownedShopItems = [];
    }
    if (u.equippedFrame === undefined) {
      u.equippedFrame = u.uid === 'u_admin_founder' ? 'frame_gold_fire' : u.uid === 'u_elena_kiv' ? 'frame_diamond_vip' : '';
    }
    if (u.equippedTitleId === undefined) {
      u.equippedTitleId = u.uid === 'u_admin_founder' ? 'title_legend' : u.uid === 'u_elena_kiv' ? 'title_architect' : '';
    }
  });

  // Ensure existing HTML mini-app HUDs sit cleanly below top post badges
  (st.posts || []).forEach((p) => {
    if (p.mediaType === 'html_app' && p.htmlCode) {
      p.htmlCode = p.htmlCode.replace(/\.hud\{position:fixed;top:(10|12)px;/g, '.hud{position:fixed;top:40px;');
    }
  });

  // Ensure all demo posts (capsule and duet) are permanently stripped
  if (Array.isArray(st.posts)) {
    st.posts = st.posts.filter((p) => p && p.id !== 'post_capsule_demo_1' && p.id !== 'post_duet_demo_1');
  }

  // #5: Upgrade 1-on-1 Direct Messages & Seed an Unclaimed +50 🪙 Gift Envelope!
  st.directMessages = Array.isArray(st.directMessages) ? st.directMessages : [];
  st.directMessages.forEach((d) => {
    if (!d.toUid || d.toUid === 'peer') d.toUid = 'u_admin_founder';
    if (!d.fromUid) d.fromUid = 'u_elena_kiv';
    if ((d.id === 'dm1' || d.id === 'dm_env_demo_1') && d.read === undefined) {
      d.read = true;
    }
  });
  if (!st.directMessages.some((d) => d.id === 'dm_env_demo_1')) {
    st.directMessages.push({
      id: 'dm_env_demo_1',
      fromUid: 'u_elena_kiv',
      fromName: 'Elena KIV',
      fromCity: 'chisinau',
      toUid: 'u_admin_founder',
      text: 'Salut from Chișinău 🇲🇩! Open this Golden Envelope gift inside our private chat!',
      envelopeCoins: 50,
      envelopeClaimed: false,
      read: true,
      ts: Date.now() - 60000
    });
  }

  // #8: Seed World City Digital Bottles floating across the ocean!
  if (!Array.isArray(st.worldBottles) || st.worldBottles.length === 0) {
    st.worldBottles = [
      {
        id: 'btl_demo_tyo',
        fromUid: 'u_kenji_tyo',
        fromName: 'Kenji TYO',
        fromCityId: 'tokyo',
        toCityId: 'montreal',
        km: 10390,
        text_en: 'Greetings from Shibuya Crossing at midnight 🏯! What is the best midnight street food in your city?',
        text_fr: 'Salutations de Shibuya à minuit 🏯 ! Quel est le meilleur plat nocturne dans votre ville ?',
        bonusCoins: 25,
        isGoldenAdmin: false,
        caughtByUid: '',
        repliedByName: '',
        replyText: '',
        createdAt: Date.now() - 360000
      },
      {
        id: 'btl_demo_kiv',
        fromUid: 'u_elena_kiv',
        fromName: 'Elena KIV',
        fromCityId: 'chisinau',
        toCityId: 'paris',
        km: 1980,
        text_en: 'Sending warm vibes from Valea Morilor lake in Chișinău 🇲🇩! Tell me one secret spot in your city!',
        text_fr: 'Salutations chaleureuses du lac Valea Morilor à Chișinău 🇲🇩 ! Partagez un lieu secret de votre ville !',
        bonusCoins: 30,
        isGoldenAdmin: false,
        caughtByUid: '',
        repliedByName: '',
        replyText: '',
        createdAt: Date.now() - 180000
      },
      {
        id: 'btl_demo_founder',
        fromUid: 'u_admin_founder',
        fromName: 'Founder Admin',
        fromCityId: 'montreal',
        toCityId: 'chisinau',
        km: 7140,
        text_en: '👑 GOLDEN FOUNDER BOTTLE! Whoever catches this ocean bottle wins +100 🪙 Treasury Coins!',
        text_fr: '👑 BOUTEILLE D’OR FONDATEUR ! Celui qui pêche cette bouteille gagne +100 🪙 Pièces Royales !',
        bonusCoins: 100,
        isGoldenAdmin: true,
        caughtByUid: '',
        repliedByName: '',
        replyText: '',
        createdAt: Date.now() - 90000
      }
    ];
  }

  // 🏆 v60: Seed Weekly City Jukebox tracks (synced across citizens via live_state)
  if (!Array.isArray(st.jukeboxTracks) || st.jukeboxTracks.length === 0) {
    st.jukeboxTracks = [
      {
        id: 'jb_mtl_1',
        title: 'Midnight St-Laurent Groove',
        artist: 'Kaytranada Vibe · MTL',
        cityId: 'montreal',
        url: '',
        soundPreset: 'sunset_house',
        addedBy: 'REMO Founder',
        votes: 14,
        voters: [],
        createdAt: Date.now() - 320000
      },
      {
        id: 'jb_par_1',
        title: 'Nuit Électronique sur Seine',
        artist: 'French Touch Collective',
        cityId: 'paris',
        url: '',
        soundPreset: 'french_cafe',
        addedBy: 'Lucas_PAR',
        votes: 11,
        voters: [],
        createdAt: Date.now() - 240000
      },
      {
        id: 'jb_kiv_1',
        title: 'Chișinău Golden Horizon',
        artist: 'Carla’s & Dara Pulse',
        cityId: 'chisinau',
        url: '',
        soundPreset: 'cyber_pulse',
        addedBy: 'Elena_KIV',
        votes: 10,
        voters: [],
        createdAt: Date.now() - 180000
      },
      {
        id: 'jb_tyo_1',
        title: 'Shibuya Rain 2099',
        artist: 'Kenji Synth',
        cityId: 'tokyo',
        url: '',
        soundPreset: 'shibuya_neon',
        addedBy: 'Kenji_TYO',
        votes: 9,
        voters: [],
        createdAt: Date.now() - 120000
      }
    ];
  }
}

/* ── 4. REMO_STORE Singleton ── */
const REMO_STORE = {
  KEY: 'remo_master_state_v1',
  USER_KEY: 'remo_current_user_uid',
  FB_KEY: 'remo_firebase_config_json',
  ADMIN_MODE_KEY: 'remo_admin_godmode',
  state: null,
  fbApp: null,
  fbDb: null,
  fbAuth: null,
  deletedPostIds: null,
  deletedUserIds: null,
  deletedDuelIds: null,
  deletedAuctionIds: null,

  init() {
    try {
      this.deletedPostIds = new Set(JSON.parse(localStorage.getItem('remo_deleted_posts') || '[]'));
    } catch (e) {
      this.deletedPostIds = new Set();
    }
    try {
      this.deletedUserIds = new Set(JSON.parse(localStorage.getItem('remo_deleted_users') || '[]'));
    } catch (e) {
      this.deletedUserIds = new Set();
    }
    try {
      this.deletedDuelIds = new Set(JSON.parse(localStorage.getItem('remo_deleted_duels') || '[]'));
    } catch (e) {
      this.deletedDuelIds = new Set();
    }
    try {
      this.deletedAuctionIds = new Set(JSON.parse(localStorage.getItem('remo_deleted_auctions') || '[]'));
    } catch (e) {
      this.deletedAuctionIds = new Set();
    }
    try {
      const raw = localStorage.getItem(this.KEY);
      this.state = raw ? JSON.parse(raw) : createDefaultState();
    } catch (e) {
      this.state = createDefaultState();
    }
    if (!this.state.settings) this.state = createDefaultState();
    if (Array.isArray(this.state.auctions) && this.deletedAuctionIds && this.deletedAuctionIds.size > 0) {
      this.state.auctions = this.state.auctions.filter((a) => a && a.id && !this.deletedAuctionIds.has(a.id));
    }
    // Strip out deleted city wars / duels and legacy mock wars
    const legacyMockWarIds = new Set(['war_1', 'war_2', 'war_3']);
    if (Array.isArray(this.state.duels)) {
      this.state.duels = this.state.duels.filter((d) =>
        d && d.id && !legacyMockWarIds.has(d.id) && (!this.deletedDuelIds || !this.deletedDuelIds.has(d.id))
      );
    }
    // Strip out legacy built-in mock posts from previous builds
    const legacyMockIds = new Set(['post_capsule_demo_1', 'post_duet_demo_1', 'post_html_fireworks', 'post_html_racer_kiv', 'post_1', 'post_2', 'post_3', 'post_4', 'post_duet_tokyo_paris', 'post_duet_mtl_chisinau', 'post_capsule_locked', 'post_duo_live_kiv_mtl', 'demo_1']);
    if (Array.isArray(this.state.posts)) {
      this.state.posts = this.state.posts.filter((p) =>
        p && p.id &&
        !legacyMockIds.has(p.id) &&
        !p.id.startsWith('demo_') &&
        !p.id.includes('demo') &&
        (!this.deletedPostIds || !this.deletedPostIds.has(p.id))
      );
    }
    // Strip out legacy fake citizen00XX accounts and deleted users from local state
    if (Array.isArray(this.state.users)) {
      this.state.users = this.state.users.filter((u) =>
        u && u.uid &&
        !this.deletedUserIds.has(u.uid) &&
        !(u.email && /^citizen\d+@remo\.world$/i.test(u.email) && u.role !== 'admin') &&
        !(u.name && u.name.startsWith('REMO Pioneer #'))
      );
    }
    upgradeEcosystemState(this.state);
    this.save(false);
    this.initFirebaseIfConfigured();

    // Listen to live cross-tab broadcasts (Admin Office <-> Social Network)
    if (REMO_LIVE_BUS) {
      REMO_LIVE_BUS.onmessage = (ev) => {
        if (ev.data && ev.data.type === 'STATE_UPDATED') {
          this.reloadFromDisk();
          window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: ev.data }));
        }
      };
    }
    window.addEventListener('storage', (ev) => {
      if (ev.key === this.KEY || ev.key === 'remo_cities_override' || ev.key === this.ADMIN_MODE_KEY) {
        this.reloadFromDisk();
        window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'storage' } }));
      }
    });
  },

  isCurrentUserAdmin() {
    const u = this.getCurrentUser();
    if (!u) return false;
    const adminEmail = (this.state && this.state.settings && this.state.settings.adminEmail) || 'andart1174@gmail.com';
    const emailMatch = Boolean(u.email && u.email.toLowerCase().trim() === adminEmail.toLowerCase().trim());
    return emailMatch && (u.role === 'admin' || u.uid === 'u_admin_founder');
  },

  isAdminUnlocked() {
    if (!this.isCurrentUserAdmin()) return false;
    return localStorage.getItem(this.ADMIN_MODE_KEY) === '1' || sessionStorage.getItem('remo_admin_unlocked') === '1';
  },

  setAdminUnlocked(active) {
    if (active) {
      localStorage.setItem(this.ADMIN_MODE_KEY, '1');
      sessionStorage.setItem('remo_admin_unlocked', '1');
    } else {
      localStorage.removeItem(this.ADMIN_MODE_KEY);
      sessionStorage.removeItem('remo_admin_unlocked');
    }
    if (REMO_LIVE_BUS) {
      REMO_LIVE_BUS.postMessage({ type: 'STATE_UPDATED', reason: 'admin_mode', ts: Date.now() });
    }
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'admin_mode' } }));
  },

  adminAdjustUserCoins(targetUid, mode = 'add', amount = 100, note = '') {
    const u = this.state.users.find((x) => x.uid === targetUid);
    if (!u) return null;
    const val = Math.max(0, Math.round(Number(amount) || 0));
    if (mode === 'set') {
      u.coins = val;
      u.lifetimeCoins = Math.max(u.lifetimeCoins || 0, val);
    } else if (mode === 'sub') {
      u.coins = Math.max(0, (u.coins || 0) - val);
    } else {
      u.coins = (u.coins || 0) + val;
      u.lifetimeCoins = (u.lifetimeCoins || 0) + val;
    }
    if (note && note.trim()) {
      this.state.directMessages = this.state.directMessages || [];
      this.state.directMessages.push({
        id: 'dm_adm_' + Date.now(),
        fromUid: 'u_admin_founder',
        fromName: '👑 REMO Treasury',
        toUid: u.uid,
        text: `🪙 [${mode === 'sub' ? '-' : mode === 'set' ? '=' : '+'}${val} REMO Coins → @${u.name}]: ${note.trim()}`,
        ts: Date.now()
      });
    }
    RemoAudio.play('coin');
    this.save(true, 'admin_coin_transfer', { uid: u.uid, coins: u.coins });
    return u;
  },

  getCityMayor(cityId) {
    if (!cityId || !this.state.cityMayors) return null;
    const mayorUid = this.state.cityMayors[cityId];
    if (mayorUid) {
      const explicit = this.state.users.find((u) => u.uid === mayorUid && !u.banned);
      if (explicit) return explicit;
    }
    // Dynamic auto-mayor: richest citizen of that city!
    const candidates = (this.state.users || [])
      .filter((u) => u.homeCity === cityId && !u.banned)
      .sort((a, b) => (b.lifetimeCoins || b.coins || 0) - (a.lifetimeCoins || a.coins || 0));
    return candidates[0] || null;
  },

  setCityMayor(cityId, uid) {
    this.state.cityMayors = this.state.cityMayors || {};
    if (!uid) delete this.state.cityMayors[cityId];
    else this.state.cityMayors[cityId] = uid;
    this.save(true, 'mayor_updated');
  },

  getCitySharePrice(cityId) {
    const score = (this.state.cityScores && this.state.cityScores[cityId]) || 1500;
    return Math.max(25, Math.round(score / 25));
  },

  reloadFromDisk() {
    try {
      try {
        this.deletedDuelIds = new Set(JSON.parse(localStorage.getItem('remo_deleted_duels') || '[]'));
      } catch (e) {}
      try {
        this.deletedAuctionIds = new Set(JSON.parse(localStorage.getItem('remo_deleted_auctions') || '[]'));
      } catch (e) {}
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const diskState = JSON.parse(raw);
        if (diskState && typeof diskState === 'object') {
          if (Array.isArray(diskState.auctions) && this.deletedAuctionIds && this.deletedAuctionIds.size > 0) {
            diskState.auctions = diskState.auctions.filter((a) => a && a.id && !this.deletedAuctionIds.has(a.id));
          }
          // Never discard newer in-memory posts when reloading from disk
          const memPosts = this.state.posts || [];
          if (Array.isArray(diskState.posts)) {
            memPosts.forEach((mp) => {
              if (mp && mp.id && !diskState.posts.some((dp) => dp.id === mp.id)) {
                diskState.posts.unshift(mp);
              }
            });
            diskState.posts = diskState.posts.filter((p) =>
              p && p.id &&
              (!this.deletedPostIds || !this.deletedPostIds.has(p.id)) &&
              !p.id.startsWith('demo') &&
              !p.id.includes('demo')
            );
          } else {
            diskState.posts = memPosts.filter((p) =>
              p && p.id &&
              (!this.deletedPostIds || !this.deletedPostIds.has(p.id)) &&
              !p.id.startsWith('demo') &&
              !p.id.includes('demo')
            );
          }
          if (Array.isArray(diskState.duels)) {
            diskState.duels = diskState.duels.filter((d) =>
              d && d.id && (!this.deletedDuelIds || !this.deletedDuelIds.has(d.id))
            );
          }
          if (Array.isArray(diskState.users)) {
            diskState.users = diskState.users.filter((u) =>
              u && u.uid &&
              (!this.deletedUserIds || !this.deletedUserIds.has(u.uid)) &&
              !(u.email && /^citizen\d+@remo\.world$/i.test(u.email) && u.role !== 'admin') &&
              !(u.name && u.name.startsWith('REMO Pioneer #'))
            );
          }
          this.state = diskState;
          if (!Array.isArray(this.state.vipShopItems) || this.state.vipShopItems.length === 0) {
            this.state.vipShopItems = getDefaultVipShopItems();
          }
          if (!Array.isArray(this.state.vipOrders)) {
            this.state.vipOrders = [];
          }
        }
      }
    } catch (e) {}
  },

  save(broadcast = true, reason = 'update', payload = null) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, trimming local cache:', e);
      try {
        const pruned = Object.assign({}, this.state);
        if (Array.isArray(pruned.posts)) {
          // Keep top 20 posts in localStorage; full posts live safely in Firestore remo_posts
          pruned.posts = pruned.posts.slice(0, 20);
        }
        localStorage.setItem(this.KEY, JSON.stringify(pruned));
      } catch (e2) {}
    }
    if (this.fbDb && reason !== 'cloud_sync' && reason !== 'cloud_live_update') {
      this.syncToFirestore(reason);
    }
    if (broadcast && REMO_LIVE_BUS) {
      REMO_LIVE_BUS.postMessage({ type: 'STATE_UPDATED', reason, payload, ts: Date.now() });
    }
    if (broadcast) {
      window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason, payload } }));
    }
  },

  nextSerial() {
    this.state.serialCounter = (this.state.serialCounter || 14) + 1;
    return String(this.state.serialCounter).padStart(4, '0');
  },

  /* ── Current Citizen, Cosmetics & Viral Referral Engine ── */
  getCurrentUser() {
    const uid = localStorage.getItem(this.USER_KEY);
    if (!uid) return null;
    return this.state.users.find((u) => u.uid === uid) || null;
  },

  getUserCosmetics(uid) {
    const u = uid ? (this.state.users || []).find((x) => x.uid === uid) : null;
    if (!u) return { frameClass: '', title_en: '', title_fr: '' };
    const shop = this.state.vipShopItems || [];
    const frObj = u.equippedFrame ? shop.find((i) => i.id === u.equippedFrame) : null;
    const tiObj = u.equippedTitleId ? shop.find((i) => i.id === u.equippedTitleId) : null;
    return {
      frameClass: frObj && frObj.cssClass ? frObj.cssClass : '',
      title_en: tiObj ? (tiObj.badge_en || tiObj.name_en) : '',
      title_fr: tiObj ? (tiObj.badge_fr || tiObj.name_fr) : ''
    };
  },

  redeemReferralCode(claimerUid, rawCode) {
    if (!claimerUid || !rawCode) return { ok: false, reason: 'empty' };
    const clean = String(rawCode).trim().toUpperCase();
    const claimer = (this.state.users || []).find((u) => u.uid === claimerUid);
    if (!claimer) return { ok: false, reason: 'no_user' };
    if (claimer.referredBy) return { ok: false, reason: 'already_claimed' };

    const inviter = (this.state.users || []).find((u) =>
      (u.referralCode && u.referralCode.toUpperCase() === clean) ||
      (`PASS${u.passportNum}` === clean) ||
      (`REMO-${u.passportNum}` === clean)
    );
    if (!inviter) return { ok: false, reason: 'invalid' };
    if (inviter.uid === claimer.uid) return { ok: false, reason: 'self' };

    const bonus = (this.state.settings.rewards && this.state.settings.rewards.referralBonus) || 100;
    claimer.referredBy = inviter.referralCode || `REMO-${inviter.passportNum}`;
    claimer.coins = (claimer.coins || 0) + bonus;
    claimer.lifetimeCoins = (claimer.lifetimeCoins || 0) + bonus;

    inviter.referralsCount = (inviter.referralsCount || 0) + 1;
    inviter.coins = (inviter.coins || 0) + bonus;
    inviter.lifetimeCoins = (inviter.lifetimeCoins || 0) + bonus;

    this.state.directMessages = this.state.directMessages || [];
    this.state.directMessages.push({
      id: 'dm_ref_' + Date.now(),
      fromUid: inviter.uid,
      fromName: `🤝 @${inviter.name}`,
      toUid: claimer.uid,
      text: `🎉 Referral Bonus Activated! Both @${inviter.name} and @${claimer.name} earned +${bonus} 🪙 REMO Coins!`,
      ts: Date.now()
    });
    RemoAudio.play('fanfare');
    this.save(true, 'referral_claimed', { inviter: inviter.name, claimer: claimer.name, bonus });
    return { ok: true, inviter, claimer, bonus };
  },

  ensureGuestOrCitizen(name, email, homeCity = 'montreal', isAdmin = false, fbUid = '') {
    // 1. If user already logged in and no specific new email/fbUid is requested, keep current user
    if (!email && !fbUid) {
      const cur = this.getCurrentUser();
      // If current user in storage is u_admin_founder but admin is not unlocked or verified, wipe to protect founder identity
      if (cur) {
        if (cur.uid === 'u_admin_founder' && !this.isAdminUnlocked()) {
          localStorage.removeItem(this.USER_KEY);
        } else {
          return cur;
        }
      }
      // Never fallback to this.state.users[0]! Create an isolated Guest Explorer session
      const guestUid = 'u_guest_' + Math.random().toString(36).slice(2, 9);
      const guestName = (name && name !== 'REMO Founder' && name !== 'Admin Founder') ? name : 'Guest Explorer';
      const guestUser = {
        uid: guestUid,
        fbUid: '',
        name: guestName,
        email: '',
        role: 'guest',
        verified: false,
        emailVerified: false,
        termsAcceptedAt: 0,
        homeCity: homeCity || 'montreal',
        passportNum: '0000',
        referralCode: '',
        referralsCount: 0,
        referredBy: '',
        ownedShopItems: [],
        equippedFrame: '',
        equippedTitleId: '',
        coins: 100,
        lifetimeCoins: 100,
        streak: 1,
        lastStreakClaimDate: '',
        following: [],
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),
        bio: 'Visiting REMO World',
        avatarBg: '#38bdf8'
      };
      localStorage.setItem(this.USER_KEY, guestUid);
      if (!Array.isArray(this.state.users)) this.state.users = [];
      this.state.users.push(guestUser);
      return guestUser;
    }

    let u = email ? this.state.users.find((x) => x.email && x.email.toLowerCase() === email.toLowerCase()) : null;
    if (!u && fbUid) {
      u = this.state.users.find((x) => x.uid === ('u_fb_' + fbUid) || x.fbUid === fbUid);
    }

    if (!u) {
      // Only create if we actually have an email or fbUid (real sign-up)
      if (!email && !fbUid) {
        return null;
      }
      const pNum = String(this.state.users.length + 1).padStart(4, '0');
      const bonus = this.state.settings?.rewards?.signupBonus || 150;
      const finalEmail = email || (fbUid ? `user_${fbUid.slice(0, 8)}@gmail.com` : '');

      u = {
        uid: fbUid ? ('u_fb_' + fbUid) : ('u_' + Date.now().toString(36)),
        fbUid: fbUid || '',
        name: name || 'Citizen #' + pNum,
        email: finalEmail,
        role: isAdmin || (email && email.toLowerCase() === this.state.settings?.adminEmail?.toLowerCase()) ? 'admin' : 'citizen',
        verified: true,
        emailVerified: Boolean(fbUid || (email && !email.includes('citizen') && !email.includes('pioneer'))),
        termsAcceptedAt: Date.now(),
        termsVersion: '1.0',
        homeCity: homeCity || 'montreal',
        passportNum: pNum,
        referralCode: `REMO-${pNum}`,
        referralsCount: 0,
        referredBy: '',
        ownedShopItems: [],
        equippedFrame: '',
        equippedTitleId: '',
        coins: bonus,
        lifetimeCoins: bonus,
        streak: 1,
        lastStreakClaimDate: '',
        following: [],
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),
        visas: [homeCity || 'montreal'],
        avatarColor: '#6366f1'
      };
      this.state.users.push(u);
      this.mintCardForUser(u.uid, homeCity || 'montreal', 'Rare', false);
    } else {
      if (name && (!u.name || u.name.startsWith('Citizen #') || u.name === 'REMO Pioneer')) {
        u.name = name;
      }
      if (fbUid && !u.fbUid) u.fbUid = fbUid;
    }

    localStorage.setItem(this.USER_KEY, u.uid);
    const adminEmail = (this.state && this.state.settings && this.state.settings.adminEmail) || 'andart1174@gmail.com';
    if (u && u.email && u.email.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
      u.role = 'admin';
      this.setAdminUnlocked(true);
    }
    // Auto-apply pending URL Referral Code (?ref=...) if present!
    const pendingRef = localStorage.getItem('remo_pending_ref');
    if (pendingRef && !u.referredBy) {
      this.redeemReferralCode(u.uid, pendingRef);
      localStorage.removeItem('remo_pending_ref');
    }
    this.save(true, 'auth');
    if (u.email && !/^citizen\d+@remo\.world$/i.test(u.email)) {
      this.syncUserToCloud(u);
      this.pingMyPresence(true);
    }
    return u;
  },

  syncUserToCloud(user) {
    if (!this.fbDb || !user || !user.uid) return;
    try {
      const cleanUser = {
        uid: user.uid,
        name: user.name || 'Citizen',
        email: user.email || '',
        role: user.role || 'citizen',
        verified: Boolean(user.verified),
        homeCity: user.homeCity || 'montreal',
        passportNum: user.passportNum || '0000',
        referralCode: user.referralCode || `REMO-${user.passportNum}`,
        referralsCount: Number(user.referralsCount || 0),
        referredBy: user.referredBy || '',
        coins: Number(user.coins || 0),
        lifetimeCoins: Number(user.lifetimeCoins || user.coins || 0),
        streak: Number(user.streak || 1),
        lastStreakClaimDate: user.lastStreakClaimDate || '',
        following: Array.isArray(user.following) ? user.following : [],
        joinedAt: Number(user.joinedAt || 0),
        lastSeenAt: Number(user.lastSeenAt || Date.now()),
        visas: Array.isArray(user.visas) ? user.visas : [user.homeCity || 'montreal'],
        equippedFrame: user.equippedFrame || '',
        equippedTitleId: user.equippedTitleId || '',
        lastPhotoCardMintMonth: user.lastPhotoCardMintMonth || '',
        banned: Boolean(user.banned),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      this.fbDb.collection('remo_users').doc(cleanUser.uid).set(cleanUser, { merge: true })
        .catch((err) => {
          console.warn('Firestore sync user notice:', err.message);
        });
    } catch (e) {
      console.warn('syncUserToCloud error:', e);
    }
  },

  /* ── Scalable Live Presence, Follow Graph, Daily Streak & Arcade Leaderboard ── */
  pingMyPresence(forceNow = false) {
    const u = this.getCurrentUser();
    if (!u || !u.uid) return;
    const now = Date.now();
    if (!forceNow && this._lastPresencePingTs && (now - this._lastPresencePingTs < 45000)) return;
    this._lastPresencePingTs = now;
    u.lastSeenAt = now;

    if (!this.presenceCache) this.presenceCache = new Map();
    const presDoc = {
      uid: u.uid,
      name: u.name || 'Citizen',
      homeCity: u.homeCity || 'montreal',
      passportNum: u.passportNum || '0001',
      joinedAt: Number(u.joinedAt || 0),
      lastSeenAt: now
    };
    this.presenceCache.set(u.uid, presDoc);

    if (this.fbDb && u.email && !/^citizen\d+@remo\.world$/i.test(u.email)) {
      this.fbDb.collection('remo_presence').doc(u.uid).set(presDoc, { merge: true })
        .catch(() => {});
    }

    if (!this._presenceTimerStarted && typeof window !== 'undefined') {
      this._presenceTimerStarted = true;
      setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
          this.pingMyPresence(false);
        }
      }, 60000);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.pingMyPresence(true);
      });
    }
  },

  getOnlineCitizensList() {
    const now = Date.now();
    const ONLINE_WINDOW_MS = 210000; // 3.5 minutes active window
    const merged = new Map();
    const curU = this.getCurrentUser();
    if (curU && curU.uid) {
      merged.set(curU.uid, {
        uid: curU.uid,
        name: curU.name || 'Citizen',
        homeCity: curU.homeCity || 'montreal',
        passportNum: curU.passportNum || '0001',
        joinedAt: Number(curU.joinedAt || 0),
        lastSeenAt: now
      });
    }
    if (this.presenceCache) {
      this.presenceCache.forEach((p, uid) => {
        if (!p || !uid || (this.deletedUserIds && this.deletedUserIds.has(uid))) return;
        if (now - Number(p.lastSeenAt || 0) <= ONLINE_WINDOW_MS) {
          const usr = (this.state.users || []).find((x) => x.uid === uid);
          merged.set(uid, {
            uid,
            name: (usr && usr.name) || p.name || 'Citizen',
            homeCity: (usr && usr.homeCity) || p.homeCity || 'montreal',
            passportNum: (usr && usr.passportNum) || p.passportNum || '0000',
            joinedAt: Number((usr && usr.joinedAt) || p.joinedAt || 0),
            lastSeenAt: Number(p.lastSeenAt || 0)
          });
        }
      });
    }
    (this.state.users || []).forEach((usr) => {
      if (!usr || !usr.uid || merged.has(usr.uid)) return;
      if (this.deletedUserIds && this.deletedUserIds.has(usr.uid)) return;
      if (now - Number(usr.lastSeenAt || 0) <= ONLINE_WINDOW_MS) {
        merged.set(usr.uid, {
          uid: usr.uid,
          name: usr.name || 'Citizen',
          homeCity: usr.homeCity || 'montreal',
          passportNum: usr.passportNum || '0000',
          joinedAt: Number(usr.joinedAt || 0),
          lastSeenAt: Number(usr.lastSeenAt || 0)
        });
      }
    });
    return Array.from(merged.values()).sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  },

  isFollowingUser(targetUid) {
    const me = this.getCurrentUser();
    if (!me || !targetUid || !Array.isArray(me.following)) return false;
    return me.following.includes(targetUid);
  },

  getFollowersCount(targetUid) {
    if (!targetUid) return 0;
    return (this.state.users || []).reduce((cnt, u) => {
      return cnt + (u && Array.isArray(u.following) && u.following.includes(targetUid) ? 1 : 0);
    }, 0);
  },

  toggleFollowUser(targetUid) {
    const me = this.getCurrentUser();
    if (!me || !targetUid || me.uid === targetUid) return { ok: false };
    if (!Array.isArray(me.following)) me.following = [];
    const idx = me.following.indexOf(targetUid);
    let nowFollowing = false;
    if (idx >= 0) {
      me.following.splice(idx, 1);
      nowFollowing = false;
    } else {
      me.following.push(targetUid);
      nowFollowing = true;
      const recentFollowNotif = (this.state.notifications || []).some(
        (n) => n.type === 'follow' && n.fromUid === me.uid && n.toUid === targetUid && (Date.now() - (n.ts || 0) < 86400000)
      );
      if (!recentFollowNotif) {
        this.addNotification({
          toUid: targetUid,
          fromUid: me.uid,
          fromName: me.name,
          fromCity: me.homeCity || 'montreal',
          type: 'follow',
          text: 'started following you 🌟'
        });
      }
    }
    this.save(true, 'follow_toggle');
    this.syncUserToCloud(me);
    return { ok: true, following: nowFollowing };
  },

  _getLocalDateKey(offsetDays = 0) {
    const d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  getDailyStreakStatus() {
    const REWARDS = [15, 25, 40, 60, 85, 120, 200];
    const u = this.getCurrentUser();
    const todayKey = this._getLocalDateKey(0);
    const yesterdayKey = this._getLocalDateKey(-1);
    if (!u) {
      return { signedIn: false, canClaim: false, currentStreak: 1, cycleDay: 1, todayReward: 15, rewards: REWARDS };
    }
    const lastKey = u.lastStreakClaimDate || '';
    if (lastKey === todayKey) {
      const cur = Math.max(1, Number(u.streak || 1));
      const cDay = ((cur - 1) % 7) + 1;
      return { signedIn: true, canClaim: false, currentStreak: cur, cycleDay: cDay, todayReward: REWARDS[cDay - 1], rewards: REWARDS };
    }
    const nextStreak = (lastKey === yesterdayKey) ? (Math.max(1, Number(u.streak || 0)) + 1) : 1;
    const cycleDay = ((nextStreak - 1) % 7) + 1;
    return {
      signedIn: true,
      canClaim: true,
      currentStreak: nextStreak,
      cycleDay,
      todayReward: REWARDS[cycleDay - 1],
      rewards: REWARDS
    };
  },

  claimDailyStreakReward() {
    const u = this.getCurrentUser();
    if (!u) return { ok: false, reason: 'auth' };
    const st = this.getDailyStreakStatus();
    if (!st.canClaim) return { ok: false, reason: 'already_claimed', status: st };

    u.streak = st.currentStreak;
    u.lastStreakClaimDate = this._getLocalDateKey(0);
    u.coins = (u.coins || 0) + st.todayReward;
    u.lifetimeCoins = (u.lifetimeCoins || 0) + st.todayReward;
    this.addCityScore(u.homeCity || 'montreal', 10);

    let mintedCard = null;
    if (st.cycleDay === 7) {
      mintedCard = this.mintCardForUser(u.uid, u.homeCity || 'montreal', 'Mythic 4D', true, {
        subtitle: `7-DAY STREAK CHAMPION`
      });
    }

    this.save(true, 'streak_claimed');
    this.syncUserToCloud(u);
    return { ok: true, coins: st.todayReward, streak: u.streak, cycleDay: st.cycleDay, mintedCard };
  },

  submitHtmlGameScore(postId, rawScore) {
    const score = Math.floor(Number(rawScore || 0));
    if (!postId || !Number.isFinite(score) || score <= 0) return { ok: false };
    const u = this.getCurrentUser();
    if (!u) return { ok: false, needAuth: true, score };
    const p = (this.state.posts || []).find((x) => x && x.id === postId);
    if (!p) return { ok: false };

    if (!Array.isArray(p.leaderboard)) p.leaderboard = [];
    const prevTop = p.leaderboard.length > 0 ? Number(p.leaderboard[0].score || 0) : 0;
    const existing = p.leaderboard.find((e) => e && e.uid === u.uid);
    if (existing && Number(existing.score || 0) >= score) {
      return { ok: false, reason: 'not_higher', best: existing.score };
    }

    if (existing) {
      existing.score = score;
      existing.name = u.name;
      existing.cityId = u.homeCity || 'montreal';
      existing.ts = Date.now();
    } else {
      p.leaderboard.push({
        uid: u.uid,
        name: u.name,
        cityId: u.homeCity || 'montreal',
        score,
        ts: Date.now()
      });
    }
    p.leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
    if (p.leaderboard.length > 10) p.leaderboard = p.leaderboard.slice(0, 10);

    const isNewRecord = score > prevTop;
    if (isNewRecord) {
      this.addCoins(u.uid, 15, 10);
    }
    this.syncPostToCloud(p);
    this.save(true, 'game_score');
    return { ok: true, isNewRecord, score };
  },

  deleteUserFromCloud(uid) {
    if (!uid) return;
    if (!this.deletedUserIds) this.deletedUserIds = new Set();
    this.deletedUserIds.add(uid);
    try {
      localStorage.setItem('remo_deleted_users', JSON.stringify([...this.deletedUserIds]));
    } catch (e) {}
    this.state.users = (this.state.users || []).filter((u) => u.uid !== uid);
    this.save(false);
    if (this.fbDb) {
      try {
        this.fbDb.collection('remo_users').doc(uid).delete().catch(() => {});
      } catch (e) {}
    }
  },

  deleteMyAccount(uid) {
    if (!uid) return;
    if (!this.deletedUserIds) this.deletedUserIds = new Set();
    this.deletedUserIds.add(uid);
    try {
      localStorage.setItem('remo_deleted_users', JSON.stringify([...this.deletedUserIds]));
    } catch (e) {}
    // Remove user posts
    const userPosts = (this.state.posts || []).filter((p) => p && (p.authorUid === uid || p.uid === uid));
    userPosts.forEach((p) => this.deletePostFromCloud(p.id));
    // Remove user profile
    this.state.users = (this.state.users || []).filter((u) => u.uid !== uid);
    if (localStorage.getItem(this.USER_KEY) === uid) {
      localStorage.removeItem(this.USER_KEY);
    }
    this.save(true, 'user_self_deleted');
    if (this.fbDb) {
      try {
        this.fbDb.collection('remo_users').doc(uid).delete().catch(() => {});
      } catch (e) {}
    }
    this.syncToFirestore('user_self_deleted', true);
  },

  async purgeFakeUsersFromCloud() {
    if (!this.deletedUserIds) this.deletedUserIds = new Set();
    const fakeUids = [];
    this.state.users = (this.state.users || []).filter((u) => {
      const isFake = u && /^citizen\d+@remo\.world$/i.test(u.email || '') && u.role !== 'admin';
      if (isFake) {
        fakeUids.push(u.uid);
        this.deletedUserIds.add(u.uid);
      }
      return !isFake;
    });
    try {
      localStorage.setItem('remo_deleted_users', JSON.stringify([...this.deletedUserIds]));
    } catch (e) {}
    this.save(false, 'purge_fake_users');
    if (this.fbDb) {
      try {
        const snap = await this.fbDb.collection('remo_users').get();
        const batch = this.fbDb.batch();
        snap.forEach((doc) => {
          const d = doc.data();
          if (d && ((d.email && /^citizen\d+@remo\.world$/i.test(d.email) && d.role !== 'admin') || fakeUids.includes(doc.id))) {
            batch.delete(doc.ref);
          }
        });
        await batch.commit();
        console.log('Fake pioneer citizens purged from Firestore successfully');
      } catch (e) {
        console.warn('purgeFakeUsersFromCloud error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'purge_users' } }));
    if (typeof refreshAllAdminPanels === 'function') refreshAllAdminPanels();
  },

  syncDmToCloud(dm) {
    if (!this.fbDb || !dm || !dm.id) return;
    try {
      if (dm.read) {
        if (!this._recentlyReadDmIds) this._recentlyReadDmIds = new Map();
        this._recentlyReadDmIds.set(dm.id, Date.now());
      }
      const cleanDm = {
        id: dm.id,
        fromUid: dm.fromUid,
        fromName: dm.fromName || 'Citizen',
        fromCity: dm.fromCity || '',
        toUid: dm.toUid || 'u_admin_founder',
        text: dm.text || '',
        voiceUrl: dm.voiceUrl || '',
        envelopeCoins: Number(dm.envelopeCoins || 0),
        envelopeClaimed: Boolean(dm.envelopeClaimed),
        isRoyalAdmin: Boolean(dm.isRoyalAdmin),
        cardOffer: dm.cardOffer || null,
        isDailyMatch: Boolean(dm.isDailyMatch),
        dailyMatchKey: dm.dailyMatchKey || '',
        dailyMatchRewarded: Boolean(dm.dailyMatchRewarded),
        read: Boolean(dm.read),
        ts: Number(dm.ts || Date.now())
      };
      this.fbDb.collection('remo_direct_messages').doc(dm.id).set(cleanDm, { merge: true })
        .catch((err) => console.warn('Firestore sync DM notice:', err.message));
    } catch (e) {
      console.warn('syncDmToCloud error:', e);
    }
  },

  signOut() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ADMIN_MODE_KEY);
    sessionStorage.removeItem('remo_admin_unlocked');
    this.setAdminUnlocked(false);
    if (this.fbAuth) {
      try { this.fbAuth.signOut().catch(() => {}); } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'auth' } }));
  },

  addCoins(uid, delta, addCityPoints = 0) {
    const u = this.state.users.find((x) => x.uid === uid);
    if (!u || u.banned) return false;
    const finalDelta = (delta > 0 && addCityPoints > 0 && this.state.settings.happyHour2x) ? delta * 2 : delta;
    if (finalDelta < 0 && u.coins + finalDelta < 0) return false;
    u.coins += finalDelta;
    if (finalDelta > 0) u.lifetimeCoins = (u.lifetimeCoins || 0) + finalDelta;
    if (addCityPoints > 0 && u.homeCity) {
      const pts = this.state.settings.happyHour2x ? addCityPoints * 2 : addCityPoints;
      this.state.cityScores[u.homeCity] = (this.state.cityScores[u.homeCity] || 1000) + pts;
    }
    if (finalDelta > 0) RemoAudio.play('coin');
    this.save(true, 'coins');
    this.syncUserToCloud(u);
    return true;
  },

  addCityScore(cityId, pts) {
    if (!cityId) return;
    this.state.cityScores[cityId] = (this.state.cityScores[cityId] || 1000) + pts;
    this.save(true, 'city_score');
  },

  mintCardForUser(uid, cityId, rarityOverride, verifiedGps = false, customSpec = {}) {
    const u = this.state.users.find((x) => x.uid === uid);
    const city = getCityById(cityId);
    const serial = customSpec.serial || this.nextSerial();
    const card = {
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      cityId: city.id,
      title: customSpec.title || '',
      subtitle: customSpec.subtitle || '',
      serial,
      maxSupply: customSpec.maxSupply || 1000,
      rarity: rarityOverride || customSpec.rarity || city.rarity || 'Epic',
      themeId: customSpec.themeId !== undefined ? customSpec.themeId : city.themeId,
      verifiedGps: !!verifiedGps,
      coinValue: customSpec.coinValue || city.baseValue || 8500,
      customPhotoDataUrl: customSpec.customPhotoDataUrl || '',
      security: customSpec.security || {
        guilloche: true, microtext: true, nfcChip: true,
        psaSlab: false, goldStamp: true, founderSig: true, redLensSecret: ''
      },
      ownerUid: uid || null,
      ownerName: u ? u.name : (customSpec.ownerName || 'REMO Drop'),
      mintedAt: Date.now()
    };
    this.state.droppedCardsPool.unshift(card);
    if (u && !u.visas.includes(city.id)) {
      u.visas.push(city.id);
    }
    this.addCityScore(city.id, 30);
    this.save(true, 'card_minted', card);
    return card;
  },

  getUserCards(uid) {
    if (!uid) return [];
    return this.state.droppedCardsPool.filter((c) => c.ownerUid === uid);
  },

  /* ── Detect Social In-App Browser (TikTok, Instagram, FB) ── */
  isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || '';
    return /FBAN|FBAV|Instagram|BytedanceWebview|TikTok|Snapchat|Line\//i.test(ua);
  },

  /* ── Urban Geo-Vaults (Real-World AR Treasure Hunts) ── */
  _calcGeoDistKm(lat1, lon1, lat2, lon2) {
    if (typeof haversineKm === 'function') return haversineKm(lat1, lon1, lat2, lon2);
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  claimGeoVault(vaultId, userLat, userLng, isSimulated = false) {
    if (!this.state || !Array.isArray(this.state.geoVaults)) return { success: false, reason: 'no_state' };
    const v = this.state.geoVaults.find((x) => x.id === vaultId);
    if (!v) return { success: false, reason: 'not_found' };

    const u = this.getCurrentUser() || this.ensureGuestOrCitizen('Explorer', '', v.cityId || 'montreal');
    v.unlockedBy = v.unlockedBy || [];
    if (v.unlockedBy.includes(u.uid)) {
      return { success: false, reason: 'already_claimed', vault: v };
    }

    const distKm = this._calcGeoDistKm(userLat, userLng, v.lat, v.lng);
    const radiusKm = (v.radiusMeters || 350) / 1000;

    if (!isSimulated && distKm > radiusKm) {
      return {
        success: false,
        reason: 'too_far',
        distanceKm: distKm,
        radiusMeters: v.radiusMeters || 350,
        vault: v
      };
    }

    // Mark as unlocked
    v.unlockedBy.push(u.uid);

    // First Finder Hall of Fame engraving
    if (!v.firstClaimedBy) {
      v.firstClaimedBy = {
        uid: u.uid,
        name: u.name,
        passportNum: u.passportNum,
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };
    }

    // Reward Coins
    const coinsWon = v.coinsReward || 250;
    this.addCoins(u.uid, coinsWon, 50);

    // Mint Bonus 4D City Card if configured
    let cardDrop = null;
    if (v.cardCityId) {
      cardDrop = this.mintCardForUser(u.uid, v.cardCityId, v.rarity || 'Mythic 4D', true, {
        title: v.title_en || 'Geo-Vault Treasure Card',
        subtitle: `Discovered at ${v.title_en}`,
        verifiedGps: true,
        coinValue: 9500
      });
    }

    this.save(true, 'geovault_claimed', { vaultId, uid: u.uid, coins: coinsWon });
    return {
      success: true,
      vault: v,
      distanceKm: distKm,
      coinsWon,
      cardDrop
    };
  },

  buryNewGeoVault(data) {
    if (!this.state) return null;
    if (!this.isAdminUnlocked() && !this.isCurrentUserAdmin()) {
      return { success: false, reason: 'admin_only' };
    }
    this.state.geoVaults = this.state.geoVaults || [];
    const u = this.getCurrentUser() || this.ensureGuestOrCitizen('Admin Founder', '', data.cityId || 'montreal');

    const bountyCoins = Math.max(50, Number(data.coinsReward) || 150);
    const tier = data.tier || (bountyCoins >= 500 ? 'diamond' : (bountyCoins >= 250 ? 'gold' : 'wood'));

    const newVault = {
      id: 'vault_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      cityId: data.cityId || u.homeCity || 'montreal',
      address: data.address || '',
      title_en: data.title_en || data.title || 'Secret Landmark Vault',
      title_fr: data.title_fr || data.title_en || data.title || 'Coffre Secret Urbain',
      hint_en: data.hint_en || data.hint || 'Look closely around the landmark coordinates...',
      hint_fr: data.hint_fr || data.hint_en || data.hint || 'Observez attentivement autour des coordonnées du lieu...',
      lat: Number(data.lat) || 45.5017,
      lng: Number(data.lng) || -73.5673,
      radiusMeters: Math.max(100, Math.min(2000, Number(data.radiusMeters) || 350)),
      coinsReward: bountyCoins,
      tier: tier,
      rarity: data.rarity || (tier === 'diamond' ? 'Mythic 4D' : (tier === 'gold' ? 'Legendary Gold' : 'Urban Rare')),
      cardCityId: data.cardCityId || data.cityId,
      sponsorName: u.name || 'REMO Admin',
      creatorUid: u.uid,
      unlockedBy: [],
      firstClaimedBy: null,
      createdAt: Date.now()
    };

    this.state.geoVaults.unshift(newVault);
    this.state.latestChestAlert = {
      id: newVault.id,
      cityId: newVault.cityId,
      tier: newVault.tier,
      coinsReward: newVault.coinsReward,
      timestamp: Date.now()
    };
    this.save(true, 'geovault_buried', newVault);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('remo:worldchest_dropped', { detail: newVault }));
    }
    return { success: true, vault: newVault };
  },

  /* ── 🛂 4D Sovereign Border Control & Live GPS Passport Stamping ── */
  verifyAndStampGpsBorder(userUid, coords) {
    if (!this.state || !coords) return { ok: false, reason: 'invalid_coords' };
    const u = userUid ? (this.state.users || []).find((x) => x.uid === userUid) : this.getCurrentUser();
    if (!u) return { ok: false, reason: 'no_user' };

    const uLat = Number(coords.latitude);
    const uLng = Number(coords.longitude);
    if (isNaN(uLat) || isNaN(uLng)) return { ok: false, reason: 'invalid_coords' };

    const allCities = (typeof REMO_CITIES_DATA !== 'undefined' && REMO_CITIES_DATA.cities) ? REMO_CITIES_DATA.cities : [];
    let closestCity = null;
    let minDistKm = Infinity;

    allCities.forEach((c) => {
      const cLat = typeof c.lat === 'number' ? c.lat : (c.coords ? c.coords.lat : 0);
      const cLng = typeof c.lng === 'number' ? c.lng : (c.coords ? c.coords.lng : 0);
      const d = this._calcGeoDistKm(uLat, uLng, cLat, cLng);
      if (d < minDistKm) {
        minDistKm = d;
        closestCity = c;
      }
    });

    if (!closestCity) return { ok: false, reason: 'no_cities' };

    u.gpsBorderVisas = Array.isArray(u.gpsBorderVisas) ? u.gpsBorderVisas : [];
    const existingIndex = u.gpsBorderVisas.findIndex((v) => v.cityId === closestCity.id);

    const inRange = minDistKm <= 45; // 45km radius covers any metropolitan area
    if (!inRange) {
      return {
        ok: false,
        reason: 'too_far',
        closestCity,
        distanceKm: Math.round(minDistKm),
        userLat: uLat,
        userLng: uLng
      };
    }

    const now = Date.now();
    const stampData = {
      id: 'bdr_' + closestCity.id + '_' + now,
      cityId: closestCity.id,
      cityName_en: closestCity.name_en || closestCity.name,
      cityName_fr: closestCity.name_fr || closestCity.name,
      flag: closestCity.flag,
      code: closestCity.code || closestCity.id.toUpperCase().slice(0, 3),
      lat: Math.round(uLat * 100) / 100,
      lng: Math.round(uLng * 100) / 100,
      accuracy: Math.round(coords.accuracy || 25),
      stampedAt: now,
      serial: `BDR-${closestCity.code || 'REMO'}-${String(u.gpsBorderVisas.length + 1).padStart(3, '0')}`
    };

    let bonusAwarded = 0;
    let isNew = false;
    if (existingIndex === -1) {
      isNew = true;
      u.gpsBorderVisas.push(stampData);
      bonusAwarded = 150;
      this.addCoins(u.uid, bonusAwarded, 25);
      if (!Array.isArray(u.visas)) u.visas = [];
      if (!u.visas.includes(closestCity.id)) u.visas.push(closestCity.id);
    } else {
      u.gpsBorderVisas[existingIndex] = stampData;
    }

    const count = u.gpsBorderVisas.length;
    let diplomaticTitle = 'Attaché Diplomatique';
    if (count >= 5) diplomaticTitle = 'Ambassadeur Mondial';
    else if (count >= 3) diplomaticTitle = 'Globetrotter Vérifié';
    else diplomaticTitle = 'Attaché Diplomatique';

    u.diplomaticRank = diplomaticTitle;

    this.save(true, 'gps_border_stamp', { uid: u.uid, cityId: closestCity.id, count });
    return {
      ok: true,
      isNew,
      closestCity,
      stamp: stampData,
      distanceKm: Math.round(minDistKm),
      bonusAwarded,
      totalGpsVisas: count,
      diplomaticTitle
    };
  },

  /* ── Sovereign REMO Coin Serialization Bureau (Admin Exclusive) ── */
  mintSerializedCoin(serialStr, coinsVal = 500, targetUid = '', note = '', alloy = 'genesis') {
    if (!this.state) return { success: false, reason: 'no_state' };
    this.state.serializedCoins = this.state.serializedCoins || [];

    const cleanSerial = String(serialStr || '').trim().replace(/^#+/, '') || String(this.state.serializedCoins.length + 1).padStart(4, '0');
    
    // Check if duplicate serial
    if (this.state.serializedCoins.some((c) => c.serial.toLowerCase() === cleanSerial.toLowerCase())) {
      return { success: false, reason: 'duplicate_serial', serial: cleanSerial };
    }

    const val = Math.max(0, Math.round(Number(coinsVal) || 0));
    let recipientUser = targetUid && targetUid !== 'vault' ? this.state.users.find((u) => u.uid === targetUid) : null;
    const cleanAlloy = ['genesis', 'platinum', 'obsidian', 'urban'].includes(alloy) ? alloy : 'genesis';

    const newCoin = {
      id: 'sc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      serial: cleanSerial,
      coinsValue: val,
      alloy: cleanAlloy,
      ownerUid: recipientUser ? recipientUser.uid : 'u_admin_founder',
      ownerName: recipientUser ? recipientUser.name : 'Founder Treasury Vault',
      mintedAt: Date.now(),
      status: recipientUser ? 'assigned' : 'vault',
      note: note.trim() || `Official Mint #${cleanSerial} [${cleanAlloy.toUpperCase()}]`
    };

    this.state.serializedCoins.unshift(newCoin);

    // If assigned to a citizen, credit the coins to their balance & send royal DM
    if (recipientUser && val > 0) {
      recipientUser.coins = (recipientUser.coins || 0) + val;
      recipientUser.lifetimeCoins = (recipientUser.lifetimeCoins || 0) + val;

      this.state.directMessages = this.state.directMessages || [];
      this.state.directMessages.push({
        id: 'dm_royal_coin_' + Date.now(),
        fromUid: 'u_admin_founder',
        fromName: '👑 REMO Treasury',
        toUid: recipientUser.uid,
        text: `👑 [ROYAL SOVEREIGN COIN #${cleanSerial}]: You have been granted Official Serialized REMO Coin #${cleanSerial} containing +${val} 🪙 REMO Coins! ${note ? `Message: "${note}"` : ''}`,
        ts: Date.now()
      });
    }

    RemoAudio.play('fanfare');
    this.save(true, 'coin_serialized_minted', newCoin);
    return { success: true, coin: newCoin, recipient: recipientUser };
  },

  getSerializedCoins() {
    return (this.state && this.state.serializedCoins) || [];
  },

  COIN_ALLOYS: {
    genesis: {
      id: 'genesis',
      name: 'Genesis Proof (24K Gold & Titanium)',
      nameFr: 'Épreuve Genesis (Or 24K & Titane)',
      icon: '🌟',
      badgeColor: '#fbbf24',
      badgeBg: 'rgba(251,191,36,0.18)',
      rimBorder: '#f59e0b',
      glow: 'rgba(251, 191, 36, 0.55)',
      filter: 'sepia(0.18) saturate(1.22) brightness(1.04)',
      goldGrad: ['#fffbeb', '#fef08a', '#eab308', '#ca8a04', '#854d0e'],
      sound: 'goldchime',
      spec: '99.9% 24K Fine Gold & Grade 5 Titanium'
    },
    platinum: {
      id: 'platinum',
      name: 'Royal Platinum & Sapphire (Ambassador VIP)',
      nameFr: 'Platine Royal & Saphir (Ambassadeur VIP)',
      icon: '💎',
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56,189,248,0.18)',
      rimBorder: '#93c5fd',
      glow: 'rgba(56, 189, 248, 0.55)',
      filter: 'hue-rotate(185deg) saturate(1.3) brightness(1.12)',
      goldGrad: ['#f0fdf4', '#e0f2fe', '#38bdf8', '#0284c7', '#0c4a6e'],
      sound: 'crystalchime',
      spec: '95% Pure Mirror Platinum with Sapphire Crystal Core'
    },
    obsidian: {
      id: 'obsidian',
      name: 'Cyber Obsidian & Emerald Neon (Night Rare)',
      nameFr: 'Cyber Obsidienne & Émeraude Néon (Édition Nuit)',
      icon: '⚡',
      badgeColor: '#34d399',
      badgeBg: 'rgba(52,211,153,0.18)',
      rimBorder: '#10b981',
      glow: 'rgba(16, 185, 129, 0.55)',
      filter: 'hue-rotate(95deg) brightness(0.92) contrast(1.25)',
      goldGrad: ['#ecfdf5', '#a7f3d0', '#34d399', '#059669', '#064e3b'],
      sound: 'cybersound',
      spec: 'Volcanic Obsidian Glass with Radiant Emerald Neon Matrix'
    },
    urban: {
      id: 'urban',
      name: 'Urban Sovereign (Aged Brass & Steel)',
      nameFr: 'Souverain Urbain (Laiton Antique & Acier)',
      icon: '🪙',
      badgeColor: '#fb923c',
      badgeBg: 'rgba(251,146,60,0.18)',
      rimBorder: '#d97706',
      glow: 'rgba(249, 115, 22, 0.55)',
      filter: 'sepia(0.42) saturate(0.95) contrast(1.12)',
      goldGrad: ['#fff7ed', '#fed7aa', '#f97316', '#c2410c', '#7c2d12'],
      sound: 'brassclink',
      spec: 'Urban Heavy Antiqued Brass & Gunmetal Industrial Steel'
    }
  },

  getAlloyConfig(alloyId) {
    return this.COIN_ALLOYS[alloyId] || this.COIN_ALLOYS.genesis;
  },

  /* ── Dedicated Firebase Cloud Infrastructure & Realtime Sync ── */
  DEFAULT_FIREBASE_CONFIG: {
    apiKey: "AIzaSyCEuOszFOEspkoj0vgfQxHrwhv65Pa1U1U",
    authDomain: "remo-world.firebaseapp.com",
    projectId: "remo-world",
    storageBucket: "remo-world.firebasestorage.app",
    messagingSenderId: "536603686704",
    appId: "1:536603686704:web:1fddedb557b3a0cf963af5",
    measurementId: "G-TBWJYSC60M"
  },

  getFirebaseConfig() {
    try {
      const raw = localStorage.getItem(this.FB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return this.DEFAULT_FIREBASE_CONFIG;
  },

  saveFirebaseConfig(cfgObj) {
    if (!cfgObj || !cfgObj.apiKey || !cfgObj.projectId) {
      localStorage.removeItem(this.FB_KEY);
      return false;
    }
    localStorage.setItem(this.FB_KEY, JSON.stringify(cfgObj));
    this.initFirebaseIfConfigured();
    return true;
  },

  initFirebaseIfConfigured() {
    const cfg = this.getFirebaseConfig();
    if (!cfg || !cfg.apiKey || typeof firebase === 'undefined') return false;
    try {
      if (!firebase.apps.length) {
        this.fbApp = firebase.initializeApp(cfg);
      } else {
        this.fbApp = firebase.app();
      }
      if (firebase.firestore) {
        this.fbDb = firebase.firestore();
        this.startFirestoreSync();
      }
      if (firebase.auth) {
        this.fbAuth = firebase.auth();
        this.fbAuth.onAuthStateChanged((fbU) => {
          if (fbU) {
            const isGoogle = Array.isArray(fbU.providerData) && fbU.providerData.some((p) => p && p.providerId === 'google.com');
            if (!fbU.emailVerified && !isGoogle) {
              // Do not create or log in Citizen account until real email link is clicked and verified
              return;
            }
            const adminEmail = (this.state?.settings?.adminEmail || 'andart1174@gmail.com').toLowerCase();
            const isAdminEmail = (fbU.email || '').toLowerCase() === adminEmail;
            let pendingName = fbU.displayName || '';
            let pendingCity = 'montreal';
            try {
              const rawPending = sessionStorage.getItem('remo_pending_signup') || localStorage.getItem('remo_pending_signup');
              if (rawPending) {
                const parsed = JSON.parse(rawPending);
                if (parsed && parsed.email && parsed.email.toLowerCase() === (fbU.email || '').toLowerCase()) {
                  if (parsed.name) pendingName = parsed.name;
                  if (parsed.cityId) pendingCity = parsed.cityId;
                }
              }
            } catch (e) {}
            const u = this.ensureGuestOrCitizen(pendingName || (isAdminEmail ? 'REMO Founder' : 'Citizen'), fbU.email, pendingCity, isAdminEmail, fbU.uid);
            if (u) {
              u.emailVerified = true;
            }
            if (isAdminEmail) {
              this.setAdminUnlocked(true);
            }
            if (typeof syncHeaderAndSidebars === 'function') syncHeaderAndSidebars();
          }
        });
      }
      console.log('%c☁️ REMO Firebase Cloud Connected: ' + cfg.projectId, 'color:#10b981;font-weight:bold;');
      return true;
    } catch (e) {
      console.warn('Firebase init deferred:', e.message);
      return false;
    }
  },

  startFirestoreSync() {
    if (!this.fbDb || this._fbSyncStarted) return;
    this._fbSyncStarted = true;
    try {
      // 1. Sync & Watch ALL USERS in Real Time across all devices (Cloud is Authoritative Source of Truth)
      this.fbDb.collection('remo_users').onSnapshot((snap) => {
        if (!snap) return;
        const cloudUsers = [];
        const cloudUserIds = new Set();
        snap.forEach((doc) => {
          const uData = doc.data();
          if (!uData || !uData.uid) return;

          // Delete any fake pioneer citizens or admin-deleted accounts from Firestore on the fly
          const isFakeCitizen = (uData.name && uData.name.startsWith('REMO Pioneer #')) || (uData.email && /^citizen\d+@remo\.world$/i.test(uData.email) && uData.role !== 'admin');
          const isDeleted = (this.deletedUserIds && this.deletedUserIds.has(uData.uid));
          if (isFakeCitizen || isDeleted) {
            this.fbDb.collection('remo_users').doc(uData.uid).delete().catch(() => {});
            return;
          }
          cloudUsers.push(uData);
          cloudUserIds.add(uData.uid);
        });

        // Current active user
        const curU = this.getCurrentUser();
        const activeUsers = [...cloudUsers];
        if (curU && !cloudUserIds.has(curU.uid) && !this.deletedUserIds?.has(curU.uid)) {
          if (!/^citizen\d+@remo\.world$/i.test(curU.email || '')) {
            activeUsers.push(curU);
          }
        }
        this.state.users = activeUsers;
        this.save(false, 'cloud_users_sync');
        window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_users' } }));
        if (typeof refreshAllAdminPanels === 'function') refreshAllAdminPanels();
        if (typeof syncHeaderAndSidebars === 'function') syncHeaderAndSidebars();
        if (typeof renderDirectMessagesView === 'function' && typeof currentRemoView !== 'undefined' && currentRemoView === 'messages') {
          renderDirectMessagesView();
        }
        if (typeof renderLivePresenceStrip === 'function') renderLivePresenceStrip();
      }, (err) => {
        console.warn('Firestore remo_users sync notice:', err.message);
      });

      // 1B. Sync & Watch LIVE CITIZEN PRESENCE (Capped at 50 most recent for 100k+ user scalability)
      this.pingMyPresence(true);
      this.fbDb.collection('remo_presence').orderBy('lastSeenAt', 'desc').limit(50).onSnapshot((snap) => {
        if (!snap) return;
        if (!this.presenceCache) this.presenceCache = new Map();
        snap.forEach((doc) => {
          const p = doc.data();
          if (p && p.uid) {
            this.presenceCache.set(p.uid, p);
          }
        });
        if (typeof renderLivePresenceStrip === 'function') {
          renderLivePresenceStrip();
        }
      }, (err) => {
        console.warn('Firestore remo_presence sync notice:', err.message);
      });

      // 2. Sync & Watch ALL DIRECT MESSAGES in Real Time
      let isInitialDmSnap = true;
      this.fbDb.collection('remo_direct_messages').orderBy('ts', 'desc').limit(150).onSnapshot((snap) => {
        if (!snap) return;
        let hasNew = false;
        const curU = this.getCurrentUser();
        const myUid = curU ? curU.uid : null;
        const isAdm = this.isCurrentUserAdmin();
        const lang = (typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang) ? REMO_I18N.getLang() : 'en';

        snap.docChanges().forEach((change) => {
          const dm = change.doc.data();
          if (!dm || !dm.id) return;
          if (dm.id === 'dm1' || dm.id === 'dm_env_demo_1') dm.read = true;
          const recentlyReadTs = this._recentlyReadDmIds ? (this._recentlyReadDmIds.get(dm.id) || 0) : 0;
          if (recentlyReadTs && (Date.now() - recentlyReadTs < 15000)) {
            dm.read = true;
          }

          if (change.type === 'added') {
            const existingIdx = this.state.directMessages.findIndex((x) => x.id === dm.id);
            if (existingIdx < 0) {
              this.state.directMessages.push(dm);
              hasNew = true;

              // Live incoming message alert & sound if addressed to me or Admin
              const isForMe = (myUid && (dm.toUid === myUid || (isAdm && (dm.toUid === 'u_admin_founder' || !dm.toUid)))) && dm.fromUid !== myUid;
              const isFreshLive = !isInitialDmSnap || (Date.now() - (dm.ts || 0) < 35000);
              if (isForMe && !dm.read && isFreshLive) {
                try { RemoAudio.play('chime'); } catch (e) {}
                const msgPreview = dm.text || (dm.voiceUrl
                  ? (lang === 'fr' ? '🎙️ Note vocale privée' : '🎙️ Private voice note')
                  : (dm.envelopeCoins > 0
                    ? (lang === 'fr' ? `🧧 Enveloppe +${dm.envelopeCoins} 🪙` : `🧧 +${dm.envelopeCoins} 🪙 Envelope`)
                    : (lang === 'fr' ? '✉️ Nouveau message privé' : '✉️ New private message')));
                if (typeof showHeadsUpNotification === 'function') {
                  showHeadsUpNotification({
                    type: 'message',
                    title: `@${dm.fromName || 'Citizen'}`,
                    text: msgPreview,
                    partnerUid: dm.fromUid
                  });
                }
                if (typeof triggerNativeDeviceNotification === 'function') {
                  triggerNativeDeviceNotification({
                    title: `💌 @${dm.fromName || 'Citizen'} • REMO`,
                    body: msgPreview,
                    tag: 'remo_dm_' + dm.fromUid,
                    data: { type: 'message', partnerUid: dm.fromUid, url: './index.html?view=messages' }
                  });
                }
              }
            } else {
              const prev = this.state.directMessages[existingIdx];
              if (prev.read || recentlyReadTs) dm.read = true;
              this.state.directMessages[existingIdx] = Object.assign({}, prev, dm);
              hasNew = true;
            }
          } else if (change.type === 'modified') {
            const idx = this.state.directMessages.findIndex((x) => x.id === dm.id);
            if (idx >= 0) {
              const prev = this.state.directMessages[idx];
              if (recentlyReadTs) dm.read = true;
              this.state.directMessages[idx] = Object.assign({}, prev, dm);
              hasNew = true;
            }
          } else if (change.type === 'removed') {
            this.state.directMessages = this.state.directMessages.filter((x) => x.id !== dm.id);
            hasNew = true;
          }
        });

        this.state.directMessages.sort((a, b) => (a.ts || 0) - (b.ts || 0));
        isInitialDmSnap = false;

        if (hasNew) {
          this.save(false, 'cloud_dms');
          window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_dms' } }));
          if (typeof renderDirectMessagesView === 'function' && typeof currentRemoView !== 'undefined' && currentRemoView === 'messages') {
            renderDirectMessagesView();
          }
          if (typeof refreshAllAdminPanels === 'function') refreshAllAdminPanels();
        }
        if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
        if (typeof renderNotificationsList === 'function' && document.getElementById('notificationsModal')?.classList.contains('open')) {
          renderNotificationsList();
        }
      }, (err) => {
        console.warn('Firestore remo_direct_messages sync notice:', err.message);
      });

      // 2B. Sync & Watch ALL NOTIFICATIONS in Real Time
      let isInitialNotifSnap = true;
      this.fbDb.collection('remo_notifications').orderBy('ts', 'desc').limit(80).onSnapshot((snap) => {
        if (!snap) return;
        const curU = this.getCurrentUser();
        const myUid = curU ? curU.uid : null;
        const isAdm = this.isCurrentUserAdmin();
        if (!Array.isArray(this.state.notifications)) this.state.notifications = [];
        const localReadSet = this.getLocalReadNotifIds();

        snap.docChanges().forEach((change) => {
          const n = change.doc.data();
          if (!n || !n.id) return;
          if (localReadSet.has(n.id)) n.read = true;
          if (change.type === 'added') {
            const idx = this.state.notifications.findIndex((x) => x.id === n.id);
            if (idx < 0) {
              this.state.notifications.unshift(n);
              const isForMe = myUid && (n.toUid === myUid || (isAdm && (n.toUid === 'u_admin_founder' || !n.toUid))) && n.fromUid !== myUid;
              const isFreshLive = !isInitialNotifSnap || (Date.now() - (n.ts || 0) < 35000);
              // Direct messages already trigger their own Heads-Up toast from remo_direct_messages
              if (isForMe && !n.read && n.type !== 'message' && isFreshLive) {
                try { RemoAudio.play('goldchime'); } catch (e) {}
                if (typeof showHeadsUpNotification === 'function') {
                  const formattedDesc = (typeof formatNotificationDesc === 'function') ? formatNotificationDesc(n) : (n.text || '');
                  showHeadsUpNotification({
                    type: n.type,
                    title: `@${n.fromName || 'Citizen'}`,
                    text: formattedDesc,
                    emoji: n.emoji,
                    postId: n.postId,
                    partnerUid: n.fromUid
                  });
                  if (typeof triggerNativeDeviceNotification === 'function') {
                    triggerNativeDeviceNotification({
                      title: `🔔 @${n.fromName || 'Citizen'} • REMO`,
                      body: formattedDesc,
                      tag: 'remo_notif_' + n.id,
                      data: { type: n.type, postId: n.postId || '', partnerUid: n.fromUid || '', url: n.postId ? `./index.html?post=${n.postId}` : './index.html' }
                    });
                  }
                }
              }
            } else {
              if (this.state.notifications[idx].read || localReadSet.has(n.id)) n.read = true;
              this.state.notifications[idx] = Object.assign({}, this.state.notifications[idx], n);
            }
          } else if (change.type === 'modified') {
            const idx = this.state.notifications.findIndex((x) => x.id === n.id);
            if (idx >= 0) {
              if (localReadSet.has(n.id)) n.read = true;
              this.state.notifications[idx] = n;
            }
          } else if (change.type === 'removed') {
            this.state.notifications = this.state.notifications.filter((x) => x.id !== n.id);
          }
        });

        isInitialNotifSnap = false;
        this.state.notifications.sort((a, b) => (b.ts || 0) - (a.ts || 0));
        if (this.state.notifications.length > 80) this.state.notifications = this.state.notifications.slice(0, 80);
        this.save(false, 'cloud_notifs');
        if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
        if (typeof renderNotificationsList === 'function') renderNotificationsList();
      }, (err) => {
        console.warn('Firestore remo_notifications sync notice:', err.message);
      });

      // 3. Sync & Watch ALL SOCIAL POSTS in Real Time across all devices (Cloud is Authoritative Source of Truth)
      let isInitialPostsSnap = true;
      this.fbDb.collection('remo_posts').limit(80).onSnapshot((snap) => {
        if (!snap) return;
        const cloudPosts = [];
        const cloudPostIds = new Set();
        snap.forEach((doc) => {
          const cp = doc.data();
          if (cp && cp.id) {
            // Discard and delete any demo posts or posts deleted by admin
            const isDemo = cp.id === 'demo_1' || cp.id.startsWith('demo_') || cp.id.includes('demo') || cp.id === 'post_capsule_demo_1' || cp.id === 'post_duet_demo_1';
            const isDeleted = (this.deletedPostIds && this.deletedPostIds.has(cp.id));
            if (isDemo || isDeleted) {
              this.fbDb.collection('remo_posts').doc(cp.id).delete().catch(() => {});
              return;
            }
            cloudPosts.push(cp);
            cloudPostIds.add(cp.id);
          }
        });

        const now = Date.now();
        const curU = this.getCurrentUser();
        const myUid = curU ? curU.uid : null;
        // Preserve only freshly created local drafts (< 4000ms old) that haven't hit the cloud yet
        const freshLocal = (this.state.posts || []).filter((lp) =>
          lp && lp.id && !cloudPostIds.has(lp.id) && !this.deletedPostIds?.has(lp.id) && (now - (lp.createdAt || 0) < 4000)
        );

        // Active posts with smart-merge for likes, reactions and comments
        const activePosts = [...freshLocal];
        cloudPosts.forEach((cp) => {
          const lp = (this.state.posts || []).find((x) => x && x.id === cp.id);
          if (lp) {
            const prevCommentIds = new Set((lp.comments || []).map((c) => c && c.id).filter(Boolean));
            // Keep union of likes
            const mergedLikes = Array.from(new Set([...(cp.likes || []), ...(lp.likes || [])]));
            cp.likes = mergedLikes;
            // Merge reactions & mystery city guesses
            cp.reactions = Object.assign({}, cp.reactions || {}, lp.reactions || {});
            if (cp.cityGuesses || lp.cityGuesses) {
              cp.cityGuesses = Object.assign({}, cp.cityGuesses || {}, lp.cityGuesses || {});
            }
            // Merge comments
            const cmtMap = new Map();
            (cp.comments || []).forEach((c) => {
              if (c && c.id) {
                cmtMap.set(c.id, c);
                // Detect live comment on my post if remo_notifications has not arrived yet
                if (!isInitialPostsSnap && myUid && cp.uid === myUid && c.uid && c.uid !== myUid && !prevCommentIds.has(c.id) && (now - (c.createdAt || 0) < 120000)) {
                  const alreadyNotified = (this.state.notifications || []).some(
                    (n) => n.type === 'comment' && n.postId === cp.id && n.fromUid === c.uid && Math.abs((n.ts || 0) - (c.createdAt || now)) < 15000
                  );
                  if (!alreadyNotified) {
                    const synthId = 'notif_cmt_' + c.id;
                    if (!this.getLocalReadNotifIds().has(synthId)) {
                      const snippet = c.text ? (c.text.length > 50 ? c.text.slice(0, 47) + '...' : c.text) : '';
                      const synthNotif = {
                        id: synthId,
                        toUid: myUid,
                        fromUid: c.uid,
                        fromName: c.author || 'Citizen',
                        fromCity: c.cityId || '',
                        type: 'comment',
                        postId: cp.id,
                        rawPreview: snippet,
                        text: snippet,
                        read: false,
                        ts: c.createdAt || now
                      };
                      this.state.notifications = this.state.notifications || [];
                      this.state.notifications.unshift(synthNotif);
                      try { RemoAudio.play('goldchime'); } catch (e) {}
                      if (typeof showHeadsUpNotification === 'function') {
                        const formattedDesc = (typeof formatNotificationDesc === 'function') ? formatNotificationDesc(synthNotif) : snippet;
                        showHeadsUpNotification({
                          type: 'comment',
                          title: `@${c.author || 'Citizen'}`,
                          text: formattedDesc,
                          postId: cp.id,
                          partnerUid: c.uid
                        });
                      }
                    }
                  }
                }
              }
            });
            (lp.comments || []).forEach((c) => { if (c && c.id && !cmtMap.has(c.id)) cmtMap.set(c.id, c); });
            cp.comments = Array.from(cmtMap.values());
            if ((lp.tipsTotal || 0) > (cp.tipsTotal || 0)) cp.tipsTotal = lp.tipsTotal;
            // Smart-merge HTML Arcade Leaderboard (keep highest score per citizen)
            if (Array.isArray(cp.leaderboard) || Array.isArray(lp.leaderboard)) {
              const lbMap = new Map();
              [...(cp.leaderboard || []), ...(lp.leaderboard || [])].forEach((entry) => {
                if (!entry || !entry.uid) return;
                const prevE = lbMap.get(entry.uid);
                if (!prevE || Number(entry.score || 0) > Number(prevE.score || 0)) {
                  lbMap.set(entry.uid, entry);
                }
              });
              cp.leaderboard = Array.from(lbMap.values()).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
            }
          }
          if (!activePosts.some((m) => m.id === cp.id) && (!this.deletedPostIds || !this.deletedPostIds.has(cp.id))) {
            activePosts.push(cp);
          }
        });
        isInitialPostsSnap = false;

        const prevSignature = (this.state.posts || []).map((p) => `${p.id}_${p.type || ''}_${p.likes?.length || 0}_${p.comments?.length || 0}_${Object.keys(p.cityGuesses || {}).length}_${p.leaderboard?.[0]?.score || 0}_${p.pinned ? 1 : 0}`).join('|');
        const nextSignature = activePosts.map((p) => `${p.id}_${p.type || ''}_${p.likes?.length || 0}_${p.comments?.length || 0}_${Object.keys(p.cityGuesses || {}).length}_${p.leaderboard?.[0]?.score || 0}_${p.pinned ? 1 : 0}`).join('|');
        const hasContentChanged = prevSignature !== nextSignature;

        this.state.posts = activePosts;
        this.state.posts.sort((a, b) =>
          (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
          (b.boosted ? 1 : 0) - (a.boosted ? 1 : 0) ||
          (b.createdAt || 0) - (a.createdAt || 0)
        );

        this.save(false, 'cloud_posts_sync');
        if (hasContentChanged) {
          window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_posts' } }));
          if (typeof renderSocialFeed === 'function' && (typeof currentRemoView === 'undefined' || currentRemoView === 'feed')) {
            renderSocialFeed();
          }
          if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
          if (typeof refreshAllAdminPanels === 'function') {
            refreshAllAdminPanels();
          }
        }
      }, (err) => {
        console.warn('Firestore remo_posts sync notice:', err.message);
      });

      // 4. Ecosystem Live State (City Scores, Live Duels, Settings, World Bottles, Auctions & GeoVaults)
      const docRef = this.fbDb.collection('remo_ecosystem').doc('live_state');
      const mergeCloudScoresAndDuels = (data) => {
        if (data.cityScores && typeof data.cityScores === 'object') {
          this.state.cityScores = this.state.cityScores || {};
          Object.keys(data.cityScores).forEach((cid) => {
            const cVal = Number(data.cityScores[cid] || 0);
            const lVal = Number(this.state.cityScores[cid] || 0);
            if (cVal > lVal) this.state.cityScores[cid] = cVal;
          });
        }
        if (Array.isArray(data.deletedDuelIds)) {
          if (!this.deletedDuelIds) this.deletedDuelIds = new Set();
          data.deletedDuelIds.forEach((id) => this.deletedDuelIds.add(id));
          try {
            localStorage.setItem('remo_deleted_duels', JSON.stringify([...this.deletedDuelIds]));
          } catch (e) {}
        }
        if (Array.isArray(data.duels)) {
          const legacyMockWarIds = new Set(['war_1', 'war_2', 'war_3']);
          // Cloud duels list is authoritative - filter out deleted duels and legacy mocks
          const cleanCloudDuels = data.duels.filter((cd) =>
            cd && cd.id && !legacyMockWarIds.has(cd.id) && (!this.deletedDuelIds || !this.deletedDuelIds.has(cd.id))
          );
          this.state.duels = cleanCloudDuels;
        }
        if (this.deletedDuelIds && this.deletedDuelIds.size > 0 && Array.isArray(this.state.duels)) {
          this.state.duels = this.state.duels.filter((d) => d && d.id && !this.deletedDuelIds.has(d.id));
        }
        if (data.cityMayors && typeof data.cityMayors === 'object') {
          this.state.cityMayors = Object.assign({}, this.state.cityMayors || {}, data.cityMayors);
        }
        if (data.viralContests && typeof data.viralContests === 'object') {
          this.state.viralContests = this.state.viralContests || getDefaultViralContests();
          Object.keys(data.viralContests).forEach((k) => {
            const cObj = data.viralContests[k];
            if (cObj && typeof cObj === 'object') {
              const localObj = this.state.viralContests[k] || {};
              if (Number(cObj.updatedAt || 0) >= Number(localObj.updatedAt || 0)) {
                this.state.viralContests[k] = Object.assign({}, localObj, cObj);
              }
            }
          });
          if (typeof renderViralContestsView === 'function') renderViralContestsView();
          if (typeof renderFeedActiveContestsBanner === 'function') renderFeedActiveContestsBanner();
        }
        if (Array.isArray(data.stories) && data.stories.length > 0) {
          this.state.stories = data.stories;
          if (typeof updateHeaderStoryBadge === 'function') updateHeaderStoryBadge();
        }
        if (data.worldSystems && typeof data.worldSystems === 'object') {
          this.state.worldSystems = this.state.worldSystems || getDefaultUniqueWorldSystems();
          Object.keys(data.worldSystems).forEach((k) => {
            const sObj = data.worldSystems[k];
            if (sObj && typeof sObj === 'object') {
              const localObj = this.state.worldSystems[k] || {};
              if (Number(sObj.updatedAt || 0) >= Number(localObj.updatedAt || 0)) {
                this.state.worldSystems[k] = Object.assign({}, localObj, sObj);
              }
            }
          });
          if (typeof renderViralContestsView === 'function') renderViralContestsView();
          if (typeof renderFeedActiveContestsBanner === 'function') renderFeedActiveContestsBanner();
        }
      };
      
      docRef.get().then((snap) => {
        if (!snap.exists) {
          docRef.set({
            cityScores: this.state.cityScores || {},
            cityMayors: this.state.cityMayors || {},
            duels: (this.state.duels || []).slice(0, 15),
            settings: this.state.settings || {},
            bottles: (this.state.bottles || []).slice(0, 30),
            jukeboxTracks: (this.state.jukeboxTracks || []).slice(0, 30),
            auctions: (this.state.auctions || []).slice(0, 25),
            geoVaults: (this.state.geoVaults || []).slice(0, 35),
            viralContests: this.state.viralContests || getDefaultViralContests(),
            worldSystems: this.state.worldSystems || getDefaultUniqueWorldSystems(),
            deletedPostIds: [...(this.deletedPostIds || [])].slice(-100),
            deletedUserIds: [...(this.deletedUserIds || [])].slice(-100),
            deletedDuelIds: [...(this.deletedDuelIds || [])].slice(-100),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }).catch((err) => console.log('Firestore seed status:', err.message));
        } else {
          const data = snap.data();
          if (data) {
            mergeCloudScoresAndDuels(data);
            if (data.bottles) this.state.bottles = data.bottles;
            if (Array.isArray(data.jukeboxTracks) && data.jukeboxTracks.length > 0) {
              this.state.jukeboxTracks = data.jukeboxTracks;
            }
            if (Array.isArray(data.deletedAuctionIds)) {
              if (!this.deletedAuctionIds) this.deletedAuctionIds = new Set();
              data.deletedAuctionIds.forEach((id) => this.deletedAuctionIds.add(id));
              try {
                localStorage.setItem('remo_deleted_auctions', JSON.stringify([...this.deletedAuctionIds]));
              } catch (e) {}
            }
            if (Array.isArray(data.auctions)) {
              this.mergeCloudAuctions(data.auctions);
              if (typeof renderAuctionsView === 'function') renderAuctionsView();
            }
            if (Array.isArray(data.geoVaults)) {
              this.state.geoVaults = data.geoVaults;
              if (typeof refreshRadarMarkers === 'function') refreshRadarMarkers();
            }
            if (Array.isArray(data.deletedPostIds)) {
              if (!this.deletedPostIds) this.deletedPostIds = new Set();
              data.deletedPostIds.forEach((id) => this.deletedPostIds.add(id));
              this.state.posts = (this.state.posts || []).filter((p) => !this.deletedPostIds.has(p.id));
            }
            if (Array.isArray(data.deletedUserIds)) {
              if (!this.deletedUserIds) this.deletedUserIds = new Set();
              data.deletedUserIds.forEach((id) => this.deletedUserIds.add(id));
              this.state.users = (this.state.users || []).filter((u) => !this.deletedUserIds.has(u.uid));
            }
            if (Array.isArray(data.deletedDuelIds)) {
              if (!this.deletedDuelIds) this.deletedDuelIds = new Set();
              data.deletedDuelIds.forEach((id) => this.deletedDuelIds.add(id));
              try {
                localStorage.setItem('remo_deleted_duels', JSON.stringify([...this.deletedDuelIds]));
              } catch (e) {}
              this.state.duels = (this.state.duels || []).filter((d) => !this.deletedDuelIds.has(d.id));
            }
            this.save(false, 'cloud_sync');
            window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_sync' } }));
          }
        }
      }).catch((err) => console.log('Firestore read status:', err.message));

      // Realtime listener for scores, duels, bottles, auctions & geovaults
      docRef.onSnapshot((snap) => {
        if (!snap || !snap.exists || snap.metadata?.hasPendingWrites) return;
        const data = snap.data();
        if (data) {
          mergeCloudScoresAndDuels(data);
          if (data.bottles) this.state.bottles = data.bottles;
          if (Array.isArray(data.jukeboxTracks) && data.jukeboxTracks.length > 0) {
            this.state.jukeboxTracks = data.jukeboxTracks;
          }
          if (Array.isArray(data.deletedAuctionIds)) {
            if (!this.deletedAuctionIds) this.deletedAuctionIds = new Set();
            data.deletedAuctionIds.forEach((id) => this.deletedAuctionIds.add(id));
            try {
              localStorage.setItem('remo_deleted_auctions', JSON.stringify([...this.deletedAuctionIds]));
            } catch (e) {}
          }
          if (Array.isArray(data.auctions)) {
            this.mergeCloudAuctions(data.auctions);
            if (typeof renderAuctionsView === 'function') renderAuctionsView();
          }
          if (Array.isArray(data.geoVaults)) {
            this.state.geoVaults = data.geoVaults;
            if (typeof refreshRadarMarkers === 'function') refreshRadarMarkers();
          }
          if (Array.isArray(data.deletedPostIds)) {
            if (!this.deletedPostIds) this.deletedPostIds = new Set();
            data.deletedPostIds.forEach((id) => this.deletedPostIds.add(id));
            this.state.posts = (this.state.posts || []).filter((p) => !this.deletedPostIds.has(p.id));
          }
          if (Array.isArray(data.deletedUserIds)) {
            if (!this.deletedUserIds) this.deletedUserIds = new Set();
            data.deletedUserIds.forEach((id) => this.deletedUserIds.add(id));
            this.state.users = (this.state.users || []).filter((u) => !this.deletedUserIds.has(u.uid));
          }
          if (Array.isArray(data.deletedDuelIds)) {
            if (!this.deletedDuelIds) this.deletedDuelIds = new Set();
            data.deletedDuelIds.forEach((id) => this.deletedDuelIds.add(id));
            try {
              localStorage.setItem('remo_deleted_duels', JSON.stringify([...this.deletedDuelIds]));
            } catch (e) {}
            this.state.duels = (this.state.duels || []).filter((d) => !this.deletedDuelIds.has(d.id));
          }
          this.save(false, 'cloud_live_update');
          window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_live_update' } }));
        }
      }, (err) => console.log('Firestore live watch status:', err.message));
    } catch (e) {
      console.warn('Firestore sync setup deferred:', e);
    }
  },

  syncPostToCloud(post) {
    if (!this.fbDb || !post || !post.id) return;
    try {
      // Sanitize undefined fields so Firestore doesn't reject write
      const cleanPost = JSON.parse(JSON.stringify(post));
      if (!cleanPost.createdAt) cleanPost.createdAt = Date.now();
      this.fbDb.collection('remo_posts').doc(post.id).set(cleanPost, { merge: true })
        .catch((err) => console.warn('Firestore post sync notice:', err.message));
    } catch (e) {
      console.warn('syncPostToCloud exception:', e);
    }
  },

  getLocalReadNotifIds() {
    if (this._localReadNotifSet) return this._localReadNotifSet;
    try {
      const raw = JSON.parse(localStorage.getItem('remo_read_notif_ids') || '[]');
      this._localReadNotifSet = new Set(Array.isArray(raw) ? raw : []);
    } catch (e) {
      this._localReadNotifSet = new Set();
    }
    return this._localReadNotifSet;
  },

  markNotifIdReadLocal(id) {
    if (!id) return;
    const set = this.getLocalReadNotifIds();
    set.add(id);
    try {
      const arr = [...set].slice(-250);
      localStorage.setItem('remo_read_notif_ids', JSON.stringify(arr));
    } catch (e) {}
  },

  addNotification(notif) {
    if (!notif) return null;
    if (!Array.isArray(this.state.notifications)) this.state.notifications = [];
    const id = notif.id || ('notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6));
    const newNotif = {
      id,
      toUid: notif.toUid,
      fromUid: notif.fromUid || '',
      fromName: notif.fromName || 'Citizen',
      fromCity: notif.fromCity || '',
      type: notif.type || 'system', // 'comment', 'like', 'reaction', 'message', 'tip', 'system'
      postId: notif.postId || null,
      text: notif.text || '',
      rawPreview: notif.rawPreview || '',
      tipAmount: Number(notif.tipAmount || 0),
      distanceKm: Number(notif.distanceKm || 0),
      emoji: notif.emoji || null,
      read: false,
      ts: notif.ts || Date.now()
    };
    const isDup = this.state.notifications.some((n) =>
      n.id === id ||
      (n.toUid === newNotif.toUid && n.fromUid === newNotif.fromUid && n.type === newNotif.type && n.postId === newNotif.postId && (Date.now() - (n.ts || 0) < 3000))
    );
    if (!isDup) {
      this.state.notifications.unshift(newNotif);
      if (this.state.notifications.length > 80) this.state.notifications = this.state.notifications.slice(0, 80);
      this.save(true, 'notification');
      this.syncNotificationToCloud(newNotif);
    }
    return newNotif;
  },

  syncNotificationToCloud(notif) {
    if (!this.fbDb || !notif || !notif.id) return;
    try {
      const clean = JSON.parse(JSON.stringify(notif));
      this.fbDb.collection('remo_notifications').doc(notif.id).set(clean, { merge: true })
        .catch((err) => console.warn('Firestore notif sync notice:', err.message));
    } catch (e) {
      console.warn('syncNotificationToCloud exception:', e);
    }
  },

  markAllNotificationsAsRead() {
    const curU = this.getCurrentUser();
    const myUid = curU ? curU.uid : null;
    const isAdm = this.isCurrentUserAdmin();
    let changed = false;
    (this.state.notifications || []).forEach((n) => {
      if ((n.toUid === myUid || (isAdm && (n.toUid === 'u_admin_founder' || !n.toUid))) && !n.read) {
        n.read = true;
        changed = true;
        this.markNotifIdReadLocal(n.id);
        this.syncNotificationToCloud(n);
      }
    });
    (this.state.directMessages || []).forEach((d) => {
      if ((d.toUid === myUid || (isAdm && (d.toUid === 'u_admin_founder' || !d.toUid))) && !d.read) {
        d.read = true;
        changed = true;
        this.syncDmToCloud(d);
      }
    });
    // Also mark any backfilled comment IDs on my posts as read locally
    (this.state.posts || []).forEach((p) => {
      if (p && (p.uid === myUid || (isAdm && p.uid === 'u_admin_founder'))) {
        (p.comments || []).forEach((c) => {
          if (c && c.id && c.uid !== myUid) {
            this.markNotifIdReadLocal('notif_cmt_' + c.id);
          }
        });
      }
    });
    if (changed) {
      this.save(true, 'notif_read_all');
    }
    if (typeof updateUnreadBadges === 'function') updateUnreadBadges();
    if (typeof renderNotificationsList === 'function') renderNotificationsList();
  },

  deletePostFromCloud(postId) {
    if (!postId) return;
    try {
      if (!this.deletedPostIds) this.deletedPostIds = new Set();
      this.deletedPostIds.add(postId);
      localStorage.setItem('remo_deleted_posts', JSON.stringify([...this.deletedPostIds]));
    } catch (e) {}
    this.state.posts = (this.state.posts || []).filter((p) => p.id !== postId);
    if (!this.fbDb) return;
    try {
      this.fbDb.collection('remo_posts').doc(postId).delete()
        .then(() => console.log('Successfully deleted post from Firestore:', postId))
        .catch((err) => console.warn('Firestore delete notice:', err.message));
    } catch (e) {}
  },

  async purgeAllPostsFromCloud() {
    this.state.posts = [];
    if (!this.deletedPostIds) this.deletedPostIds = new Set();
    localStorage.removeItem('remo_deleted_posts');
    this.deletedPostIds.clear();
    this.save(false, 'purge_all_posts');
    if (this.fbDb) {
      try {
        const snap = await this.fbDb.collection('remo_posts').get();
        const batch = this.fbDb.batch();
        snap.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('All posts deleted from Firestore successfully');
      } catch (err) {
        console.warn('Purge posts error:', err);
      }
    }
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'purge_posts' } }));
    if (typeof renderSocialFeed === 'function') renderSocialFeed();
  },

  tossCoinInWishingWell(cityQuery, text, isAnonymous = false) {
    const u = this.getCurrentUser();
    if (!u) return { success: false, reason: 'no_user' };
    if ((u.coins || 0) < 1) return { success: false, reason: 'no_coins' };
    const cleanText = (text || '').trim();
    if (!cleanText) return { success: false, reason: 'empty_text' };

    u.coins = Math.max(0, (u.coins || 0) - 1);

    const resolvedCity = (typeof resolveCityFromQuery === 'function')
      ? resolveCityFromQuery(cityQuery || (u.homeCity || 'montreal'))
      : (typeof getCityById === 'function' ? getCityById(cityQuery || 'montreal') : null);

    const targetCityId = (resolvedCity && resolvedCity.id) ? resolvedCity.id : 'montreal';
    const targetCityName = (resolvedCity && (resolvedCity.name_fr || resolvedCity.name_en)) ? (resolvedCity.name_fr || resolvedCity.name_en) : (cityQuery || 'Montréal');
    const targetCityFlag = (resolvedCity && resolvedCity.flag) ? resolvedCity.flag : '🌍';

    if (!this.state.cityScores) this.state.cityScores = {};
    this.state.cityScores[targetCityId] = (this.state.cityScores[targetCityId] || 0) + 5;

    if (!Array.isArray(this.state.wishes)) this.state.wishes = [];
    const newWish = {
      id: 'wish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      cityId: targetCityId,
      cityName: targetCityName,
      cityFlag: targetCityFlag,
      authorName: isAnonymous ? (typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang() === 'fr' ? 'Citoyen Anonyme' : 'Anonymous Citizen') : u.name,
      authorUid: isAnonymous ? '' : u.uid,
      text: cleanText,
      blessings: 1,
      blessedUids: u.uid ? [u.uid] : [],
      timestamp: Date.now(),
      isAnonymous: Boolean(isAnonymous)
    };

    this.state.wishes.unshift(newWish);
    if (this.state.wishes.length > 150) this.state.wishes = this.state.wishes.slice(0, 150);
    this.save(true);
    return { success: true, wish: newWish, userCoins: u.coins, cityName: targetCityName };
  },

  blessWish(wishId) {
    const u = this.getCurrentUser();
    if (!Array.isArray(this.state.wishes)) return { success: false, reason: 'not_found' };
    const wish = this.state.wishes.find((w) => w && w.id === wishId);
    if (!wish) return { success: false, reason: 'not_found' };

    if (!Array.isArray(wish.blessedUids)) wish.blessedUids = [];
    if (u && u.uid && wish.blessedUids.includes(u.uid)) {
      return { success: false, reason: 'already_blessed', wish };
    }

    if (u && u.uid) wish.blessedUids.push(u.uid);
    wish.blessings = (wish.blessings || 0) + 1;

    // Positive karma reward: +1 coin to current user
    if (u) {
      u.coins = (u.coins || 0) + 1;
    }
    // Boost city score +1
    if (this.state.cityScores && wish.cityId) {
      this.state.cityScores[wish.cityId] = (this.state.cityScores[wish.cityId] || 0) + 1;
    }

    this.save(true);
    return { success: true, wish, userCoins: u ? u.coins : null };
  },

  /* ── 🌟 IDEA 1: GENESIS PASSPORT ALLOCATION & TIER SYSTEM ── */
  getGenesisAllocationStats() {
    const users = this.state.users || [];
    const totalMax = 500;
    // Real claimed + dynamic progress indicator
    const claimed = Math.min(totalMax, Math.max(users.length, 421));
    const remaining = Math.max(1, totalMax - claimed);
    return {
      totalMax,
      claimed,
      remaining,
      percentage: Math.round((claimed / totalMax) * 100)
    };
  },

  getUserPassportTier(passportNum) {
    const raw = String(passportNum || '').replace(/\D/g, '');
    const num = parseInt(raw, 10) || 1;
    if (num <= 500) {
      return {
        tier: 1,
        id: 'genesis',
        badge_fr: '🌟 PIONNIER GENESIS #1',
        badge_en: '🌟 GENESIS PIONEER TIER 1',
        cssClass: 'genesis-tier',
        color: '#fbbf24',
        glow: 'rgba(251, 191, 36, 0.65)'
      };
    } else if (num <= 2000) {
      return {
        tier: 2,
        id: 'titanium',
        badge_fr: '⚡ CITOYEN TITANE TIER 2',
        badge_en: '⚡ TITANIUM CITIZEN TIER 2',
        cssClass: 'titanium-tier',
        color: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.65)'
      };
    } else {
      return {
        tier: 3,
        id: 'sovereign',
        badge_fr: '🌐 CITOYEN SOUVERAIN TIER 3',
        badge_en: '🌐 SOVEREIGN CITIZEN TIER 3',
        cssClass: 'sovereign-tier',
        color: '#a78bfa',
        glow: 'rgba(167, 139, 250, 0.65)'
      };
    }
  },

  /* ── 🎲 IDEA 4: CITY PREDICTION MARKET WAGERS & PAYOUTS ── */
  placeCityPredictionBet(predictionId, optionId, amount = 5) {
    const u = this.getCurrentUser();
    if (!u) return { success: false, reason: 'auth_required' };
    if ((u.coins || 0) < amount) return { success: false, reason: 'insufficient_coins' };

    if (!Array.isArray(this.state.cityPredictions)) {
      this.state.cityPredictions = getDefaultCityPredictions();
    }
    const pred = this.state.cityPredictions.find((p) => p.id === predictionId);
    if (!pred || pred.status !== 'open') return { success: false, reason: 'prediction_closed' };

    const opt = (pred.options || []).find((o) => o.id === optionId);
    if (!opt) return { success: false, reason: 'invalid_option' };

    u.coins = Math.max(0, (u.coins || 0) - amount);
    opt.votes = (opt.votes || 0) + 1;
    opt.pool = (opt.pool || 0) + amount;
    pred.totalPool = (pred.totalPool || 0) + amount;

    if (!Array.isArray(pred.bets)) pred.bets = [];
    pred.bets.push({
      uid: u.uid,
      userName: u.name,
      optionId,
      amount,
      timestamp: Date.now()
    });

    if (!Array.isArray(u.predictionBets)) u.predictionBets = [];
    u.predictionBets.push({
      predId: predictionId,
      optionId,
      amount,
      timestamp: Date.now()
    });

    // Award +5 points to the prediction's city
    if (this.state.cityScores && pred.cityId) {
      this.state.cityScores[pred.cityId] = (this.state.cityScores[pred.cityId] || 0) + 5;
    }

    this.save(true, 'prediction_bet');
    return { success: true, pred, opt, userCoins: u.coins };
  },

  resolveCityPrediction(predictionId, winningOptionId) {
    if (!this.isAdminUnlocked()) return { success: false, reason: 'unauthorized' };
    if (!Array.isArray(this.state.cityPredictions)) return { success: false, reason: 'no_predictions' };
    const pred = this.state.cityPredictions.find((p) => p.id === predictionId);
    if (!pred) return { success: false, reason: 'not_found' };

    pred.status = 'resolved';
    pred.winningOptionId = winningOptionId;

    const winBets = (pred.bets || []).filter((b) => b.optionId === winningOptionId);
    const winOption = pred.options.find((o) => o.id === winningOptionId);
    const winPool = winOption ? Math.max(1, winOption.pool) : 1;
    const totalPool = pred.totalPool || 0;

    let distributed = 0;
    winBets.forEach((b) => {
      const user = (this.state.users || []).find((u) => u.uid === b.uid);
      if (user) {
        const share = Math.round(totalPool * (b.amount / winPool));
        user.coins = (user.coins || 0) + share;
        distributed += share;
      }
    });

    this.save(true, 'prediction_resolved');
    return { success: true, winnersCount: winBets.length, distributed };
  },

  deleteWar(warId) {
    if (!warId) return;
    if (!this.deletedDuelIds) this.deletedDuelIds = new Set();
    this.deletedDuelIds.add(warId);
    try {
      localStorage.setItem('remo_deleted_duels', JSON.stringify([...this.deletedDuelIds]));
    } catch (e) {}
    this.state.duels = (this.state.duels || []).filter((w) => w && w.id !== warId);
    this.save(true, 'war_deleted');
    this.syncToFirestore('war_deleted', true);
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'war_deleted', warId } }));
    if (REMO_LIVE_BUS) {
      try { REMO_LIVE_BUS.postMessage({ type: 'STATE_UPDATED', reason: 'war_deleted' }); } catch (e) {}
    }
  },

  purgeAllWars() {
    if (!this.deletedDuelIds) this.deletedDuelIds = new Set();
    (this.state.duels || []).forEach((w) => {
      if (w && w.id) this.deletedDuelIds.add(w.id);
    });
    this.deletedDuelIds.add('war_1');
    this.deletedDuelIds.add('war_2');
    this.deletedDuelIds.add('war_3');
    try {
      localStorage.setItem('remo_deleted_duels', JSON.stringify([...this.deletedDuelIds]));
    } catch (e) {}
    this.state.duels = [];
    this.save(true, 'purge_all_wars');
    this.syncToFirestore('purge_all_wars', true);
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'purge_all_wars' } }));
    if (REMO_LIVE_BUS) {
      try { REMO_LIVE_BUS.postMessage({ type: 'STATE_UPDATED', reason: 'purge_all_wars' }); } catch (e) {}
    }
  },

  /* ══════════════════════════════════════════════════════════════════
     🎤🏆⚽🕵️🎟️⚡ 6 ADMIN-CONTROLLED VIRAL CONTESTS ENGINE
     ══════════════════════════════════════════════════════════════════ */
  ensureViralContests() {
    if (!this.state.viralContests || typeof this.state.viralContests !== 'object') {
      this.state.viralContests = getDefaultViralContests();
    }
    return this.state.viralContests;
  },

  _notifyContestUpdate(reason = 'viral_contest_update') {
    this.save(true, reason);
    this.syncToFirestore(reason, true);
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason } }));
    if (REMO_LIVE_BUS) {
      try { REMO_LIVE_BUS.postMessage({ type: 'STATE_UPDATED', reason }); } catch (e) {}
    }
    if (typeof renderViralContestsView === 'function') renderViralContestsView();
    if (typeof renderFeedActiveContestsBanner === 'function') renderFeedActiveContestsBanner();
    if (typeof refreshAllAdminPanels === 'function') refreshAllAdminPanels();
  },

  // ── 1. 🎤 REMO MUSIC CONTEST (World Cities 60s Song Contest) ──
  adminLaunchEurovision(opts = {}) {
    const vc = this.ensureViralContests();
    const hours = Math.max(1, Number(opts.durationHours || 48));
    const prevEntries = opts.keepEntries && Array.isArray(vc.eurovision.entries) ? vc.eurovision.entries : [];
    vc.eurovision = {
      active: true,
      status: 'open',
      title_en: (opts.title_en || 'REMO Music Contest — 60s City Sounds & Anthems').trim(),
      title_fr: (opts.title_fr || 'REMO Concours Musical — Sons & Hymnes 60s des Villes').trim(),
      prizeCoins: Math.max(100, Number(opts.prizeCoins || 5000)),
      endsAt: Date.now() + hours * 3600000,
      allowCitizenSubmissions: opts.allowCitizenSubmissions !== false,
      noSelfCityVote: opts.noSelfCityVote !== false,
      entries: prevEntries,
      voters: opts.keepEntries ? (vc.eurovision.voters || {}) : {},
      winnerEntryId: '',
      updatedAt: Date.now()
    };
    this._notifyContestUpdate('eurovision_launched');
    return vc.eurovision;
  },

  submitEurovisionEntry(entryData = {}) {
    const vc = this.ensureViralContests();
    const ev = vc.eurovision;
    const u = this.getCurrentUser();
    const isAdm = this.isCurrentUserAdmin() || this.isAdminUnlocked();
    if (!isAdm && (!ev.active || ev.status !== 'open')) {
      return { ok: false, error: 'inactive' };
    }
    if (!isAdm && !ev.allowCitizenSubmissions) {
      return { ok: false, error: 'submissions_closed' };
    }
    if (!u && !isAdm) {
      return { ok: false, error: 'auth_required' };
    }
    ev.entries = Array.isArray(ev.entries) ? ev.entries : [];
    const submitterUid = u ? u.uid : 'u_admin_founder';
    const submitterName = (entryData.artistName || (u && u.name) || 'REMO Creator').trim();
    if (!isAdm && ev.entries.some((e) => e && e.uid === submitterUid)) {
      return { ok: false, error: 'already_submitted' };
    }
    const cityId = entryData.cityId || (u && u.homeCity) || 'montreal';
    const newEntry = {
      id: 'euro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      cityId,
      songTitle: (entryData.songTitle || 'City Anthem 60s').trim().slice(0, 80),
      artistName: submitterName.slice(0, 50),
      uid: submitterUid,
      audioUrl: (entryData.audioUrl || '').trim(),
      externalLink: (entryData.externalLink || '').trim(),
      soundPreset: (entryData.soundPreset || 'shibuya_neon').trim(),
      points: 0,
      votesCount: 0,
      createdAt: Date.now()
    };
    ev.entries.push(newEntry);
    ev.updatedAt = Date.now();
    if (u && !isAdm) {
      this.addCoins(u.uid, 25, 20);
      this.addCityScore(cityId, 20);
    }
    this._notifyContestUpdate('eurovision_entry_added');
    return { ok: true, entry: newEntry };
  },

  adminDeleteEurovisionEntry(entryId) {
    const vc = this.ensureViralContests();
    if (!vc.eurovision || !Array.isArray(vc.eurovision.entries)) return;
    vc.eurovision.entries = vc.eurovision.entries.filter((e) => e && e.id !== entryId);
    vc.eurovision.updatedAt = Date.now();
    this._notifyContestUpdate('eurovision_entry_deleted');
  },

  voteEurovisionEntry(entryId) {
    const vc = this.ensureViralContests();
    const ev = vc.eurovision;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!ev.active || ev.status !== 'open' || (ev.endsAt && Date.now() > ev.endsAt)) {
      return { ok: false, error: 'ended' };
    }
    ev.voters = ev.voters || {};
    if (ev.voters[u.uid]) {
      return { ok: false, error: 'already_voted' };
    }
    const entry = (ev.entries || []).find((e) => e && e.id === entryId);
    if (!entry) return { ok: false, error: 'not_found' };
    if (ev.noSelfCityVote && u.homeCity && entry.cityId === u.homeCity && !this.isCurrentUserAdmin()) {
      return { ok: false, error: 'self_city_blocked' };
    }
    entry.points = Number(entry.points || 0) + 100;
    entry.votesCount = Number(entry.votesCount || 0) + 1;
    ev.voters[u.uid] = entryId;
    ev.updatedAt = Date.now();
    this.addCoins(u.uid, 15, 15);
    this.addCityScore(entry.cityId, 20);
    this._notifyContestUpdate('eurovision_voted');
    return { ok: true, entry };
  },

  adminConcludeEurovision() {
    const vc = this.ensureViralContests();
    const ev = vc.eurovision;
    if (!ev || !Array.isArray(ev.entries) || ev.entries.length === 0) {
      return { ok: false, error: 'no_entries' };
    }
    const sorted = ev.entries.slice().sort((a, b) => Number(b.points || 0) - Number(a.points || 0));
    const winner = sorted[0];
    ev.status = 'concluded';
    ev.winnerEntryId = winner.id;
    ev.updatedAt = Date.now();
    const prize = Number(ev.prizeCoins || 5000);
    if (winner.uid) {
      this.adminAdjustUserCoins(winner.uid, 'add', prize);
    }
    this.addCityScore(winner.cityId, 500);
    this._notifyContestUpdate('eurovision_concluded');
    return { ok: true, winner, prize };
  },

  adminStopEurovision() {
    const vc = this.ensureViralContests();
    vc.eurovision = Object.assign(getDefaultViralContests().eurovision, { updatedAt: Date.now() });
    this._notifyContestUpdate('eurovision_stopped');
  },

  // ── 2. 📸 PHOTO & VIDEO GRAND PRIX (Top 3 Live Podium 🥇🥈🥉) ──
  adminLaunchPhotoGrandPrix(opts = {}) {
    const vc = this.ensureViralContests();
    const hours = Math.max(1, Number(opts.durationHours || 48));
    const prevEntries = opts.keepEntries && Array.isArray(vc.photoGrandPrix.entries) ? vc.photoGrandPrix.entries : [];
    vc.photoGrandPrix = {
      active: true,
      status: 'open',
      title_en: (opts.title_en || 'World Cities Photo & Video Grand Prix').trim(),
      title_fr: (opts.title_fr || 'Grand Prix Photo & Vidéo des Villes').trim(),
      prize1st: Math.max(100, Number(opts.prize1st || 3000)),
      prize2nd: Math.max(50, Number(opts.prize2nd || 1500)),
      prize3rd: Math.max(25, Number(opts.prize3rd || 750)),
      endsAt: Date.now() + hours * 3600000,
      entries: prevEntries,
      voters: opts.keepEntries ? (vc.photoGrandPrix.voters || {}) : {},
      winnersAwarded: false,
      updatedAt: Date.now()
    };
    this._notifyContestUpdate('pgp_launched');
    return vc.photoGrandPrix;
  },

  submitPhotoGrandPrixEntry(data = {}) {
    const vc = this.ensureViralContests();
    const pgp = vc.photoGrandPrix;
    const u = this.getCurrentUser();
    const isAdm = this.isCurrentUserAdmin() || this.isAdminUnlocked();
    if (!isAdm && (!pgp.active || pgp.status !== 'open')) return { ok: false, error: 'inactive' };
    if (!u && !isAdm) return { ok: false, error: 'auth_required' };
    pgp.entries = Array.isArray(pgp.entries) ? pgp.entries : [];
    const uid = u ? u.uid : 'u_admin_founder';
    if (!isAdm && pgp.entries.some((e) => e && e.uid === uid)) {
      return { ok: false, error: 'already_submitted' };
    }
    const cityId = data.cityId || (u && u.homeCity) || 'montreal';
    const entry = {
      id: 'pgp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      cityId,
      title: (data.title || 'City Masterpiece').trim().slice(0, 90),
      authorName: ((u && u.name) || 'Creator').slice(0, 45),
      uid,
      mediaUrl: (data.mediaUrl || '').trim(),
      mediaType: data.mediaType || 'image',
      votes: 0,
      createdAt: Date.now()
    };
    pgp.entries.push(entry);
    pgp.updatedAt = Date.now();
    if (u && !isAdm) {
      this.addCoins(u.uid, 20, 15);
      this.addCityScore(cityId, 15);
    }
    this._notifyContestUpdate('pgp_entry_added');
    return { ok: true, entry };
  },

  adminDeletePhotoGrandPrixEntry(entryId) {
    const vc = this.ensureViralContests();
    if (!vc.photoGrandPrix || !Array.isArray(vc.photoGrandPrix.entries)) return;
    vc.photoGrandPrix.entries = vc.photoGrandPrix.entries.filter((e) => e && e.id !== entryId);
    vc.photoGrandPrix.updatedAt = Date.now();
    this._notifyContestUpdate('pgp_entry_deleted');
  },

  votePhotoGrandPrixEntry(entryId) {
    const vc = this.ensureViralContests();
    const pgp = vc.photoGrandPrix;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!pgp.active || pgp.status !== 'open' || (pgp.endsAt && Date.now() > pgp.endsAt)) {
      return { ok: false, error: 'ended' };
    }
    pgp.voters = pgp.voters || {};
    if (pgp.voters[u.uid]) return { ok: false, error: 'already_voted' };
    const entry = (pgp.entries || []).find((e) => e && e.id === entryId);
    if (!entry) return { ok: false, error: 'not_found' };
    entry.votes = Number(entry.votes || 0) + 1;
    pgp.voters[u.uid] = entryId;
    pgp.updatedAt = Date.now();
    this.addCoins(u.uid, 10, 10);
    this.addCityScore(entry.cityId, 10);
    this._notifyContestUpdate('pgp_voted');
    return { ok: true, entry };
  },

  adminConcludePhotoGrandPrix() {
    const vc = this.ensureViralContests();
    const pgp = vc.photoGrandPrix;
    if (!pgp || !Array.isArray(pgp.entries) || pgp.entries.length === 0) {
      return { ok: false, error: 'no_entries' };
    }
    const sorted = pgp.entries.slice().sort((a, b) => Number(b.votes || 0) - Number(a.votes || 0));
    const prizes = [Number(pgp.prize1st || 3000), Number(pgp.prize2nd || 1500), Number(pgp.prize3rd || 750)];
    sorted.slice(0, 3).forEach((ent, idx) => {
      if (ent && ent.uid) {
        this.adminAdjustUserCoins(ent.uid, 'add', prizes[idx]);
      }
      if (ent && ent.cityId) {
        this.addCityScore(ent.cityId, idx === 0 ? 300 : idx === 1 ? 150 : 75);
      }
    });
    pgp.status = 'concluded';
    pgp.winnersAwarded = true;
    pgp.updatedAt = Date.now();
    this._notifyContestUpdate('pgp_concluded');
    return { ok: true, podium: sorted.slice(0, 3) };
  },

  adminStopPhotoGrandPrix() {
    const vc = this.ensureViralContests();
    vc.photoGrandPrix = Object.assign(getDefaultViralContests().photoGrandPrix, { updatedAt: Date.now() });
    this._notifyContestUpdate('pgp_stopped');
  },

  // ── 3. ⚽ 8-CITY WORLD KNOCKOUT CUP (QF ➔ SF ➔ Final) ──
  adminLaunchWorldCupBracket(opts = {}) {
    const vc = this.ensureViralContests();
    const default8 = ['montreal', 'chisinau', 'paris', 'bucharest', 'newyork', 'tokyo', 'london', 'dubai'];
    const rawCities = Array.isArray(opts.cityIds) && opts.cityIds.length >= 8 ? opts.cityIds.slice(0, 8) : default8;
    const roundHours = Math.max(1, Number(opts.roundHours || 24));
    const matches = [
      { id: 'wc_qf_1', round: 'qf', cityA: rawCities[0], cityB: rawCities[1], votesA: 0, votesB: 0, voters: {}, winner: '' },
      { id: 'wc_qf_2', round: 'qf', cityA: rawCities[2], cityB: rawCities[3], votesA: 0, votesB: 0, voters: {}, winner: '' },
      { id: 'wc_qf_3', round: 'qf', cityA: rawCities[4], cityB: rawCities[5], votesA: 0, votesB: 0, voters: {}, winner: '' },
      { id: 'wc_qf_4', round: 'qf', cityA: rawCities[6], cityB: rawCities[7], votesA: 0, votesB: 0, voters: {}, winner: '' }
    ];
    vc.worldCupBracket = {
      active: true,
      status: 'open',
      title_en: (opts.title_en || '8-City World Knockout Cup').trim(),
      title_fr: (opts.title_fr || 'Coupe du Monde des Villes (8 Villes)').trim(),
      prizePool: Math.max(500, Number(opts.prizePool || 5000)),
      round: 'qf',
      roundHours,
      endsAt: Date.now() + roundHours * 3600000,
      matches,
      championCityId: '',
      updatedAt: Date.now()
    };
    this._notifyContestUpdate('worldcup_launched');
    return vc.worldCupBracket;
  },

  voteWorldCupMatch(matchId, side) {
    const vc = this.ensureViralContests();
    const wc = vc.worldCupBracket;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!wc.active || wc.status !== 'open') return { ok: false, error: 'ended' };
    const m = (wc.matches || []).find((x) => x && x.id === matchId && x.round === wc.round);
    if (!m) return { ok: false, error: 'not_found' };
    m.voters = m.voters || {};
    if (m.voters[u.uid]) return { ok: false, error: 'already_voted' };
    if (side === 'A') {
      m.votesA = Number(m.votesA || 0) + 1;
      this.addCityScore(m.cityA, 10);
    } else {
      m.votesB = Number(m.votesB || 0) + 1;
      this.addCityScore(m.cityB, 10);
    }
    m.voters[u.uid] = side;
    wc.updatedAt = Date.now();
    this.addCoins(u.uid, 10, 10);
    this._notifyContestUpdate('worldcup_voted');
    return { ok: true, match: m };
  },

  adminAdvanceWorldCupRound() {
    const vc = this.ensureViralContests();
    const wc = vc.worldCupBracket;
    if (!wc || !wc.active) return { ok: false };
    const pickWinner = (m) => (Number(m.votesA || 0) >= Number(m.votesB || 0) ? m.cityA : m.cityB);
    const roundHours = Math.max(1, Number(wc.roundHours || 24));
    if (wc.round === 'qf') {
      const qfs = (wc.matches || []).filter((m) => m.round === 'qf');
      qfs.forEach((m) => { m.winner = pickWinner(m); });
      if (qfs.length >= 4) {
        wc.matches.push(
          { id: 'wc_sf_1', round: 'sf', cityA: qfs[0].winner, cityB: qfs[1].winner, votesA: 0, votesB: 0, voters: {}, winner: '' },
          { id: 'wc_sf_2', round: 'sf', cityA: qfs[2].winner, cityB: qfs[3].winner, votesA: 0, votesB: 0, voters: {}, winner: '' }
        );
        wc.round = 'sf';
        wc.endsAt = Date.now() + roundHours * 3600000;
      }
    } else if (wc.round === 'sf') {
      const sfs = (wc.matches || []).filter((m) => m.round === 'sf');
      sfs.forEach((m) => { m.winner = pickWinner(m); });
      if (sfs.length >= 2) {
        wc.matches.push(
          { id: 'wc_final_1', round: 'final', cityA: sfs[0].winner, cityB: sfs[1].winner, votesA: 0, votesB: 0, voters: {}, winner: '' }
        );
        wc.round = 'final';
        wc.endsAt = Date.now() + roundHours * 3600000;
      }
    } else if (wc.round === 'final') {
      const fin = (wc.matches || []).find((m) => m.round === 'final');
      if (fin) {
        fin.winner = pickWinner(fin);
        wc.championCityId = fin.winner;
        wc.round = 'champion';
        wc.status = 'concluded';
        this.addCityScore(fin.winner, Number(wc.prizePool || 5000));
      }
    }
    wc.updatedAt = Date.now();
    this._notifyContestUpdate('worldcup_advanced');
    return { ok: true, round: wc.round, championCityId: wc.championCityId };
  },

  adminStopWorldCupBracket() {
    const vc = this.ensureViralContests();
    vc.worldCupBracket = Object.assign(getDefaultViralContests().worldCupBracket, { updatedAt: Date.now() });
    this._notifyContestUpdate('worldcup_stopped');
  },

  // ── 4. 🕵️ MYSTERY CITY DETECTIVE (1-Attempt Secret Landmark Quiz) ──
  adminLaunchMysteryDetective(opts = {}) {
    const vc = this.ensureViralContests();
    const hours = Math.max(1, Number(opts.durationHours || 24));
    vc.mysteryDetective = {
      active: true,
      status: 'open',
      imageUrl: (opts.imageUrl || '').trim(),
      clue_en: (opts.clue_en || 'Identify the secret world city from this view & clue!').trim(),
      clue_fr: (opts.clue_fr || 'Identifiez la ville secrète grâce à cette vue et cet indice !').trim(),
      correctCityId: opts.correctCityId || 'paris',
      rewardCoins: Math.max(50, Number(opts.rewardCoins || 500)),
      maxWinners: Math.max(1, Number(opts.maxWinners || 15)),
      endsAt: Date.now() + hours * 3600000,
      attempts: {},
      winners: [],
      updatedAt: Date.now()
    };
    this._notifyContestUpdate('mystery_launched');
    return vc.mysteryDetective;
  },

  submitMysteryDetectiveGuess(guessedCityId) {
    const vc = this.ensureViralContests();
    const md = vc.mysteryDetective;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!md.active || md.status !== 'open') return { ok: false, error: 'ended' };
    md.attempts = md.attempts || {};
    md.winners = Array.isArray(md.winners) ? md.winners : [];
    if (md.attempts[u.uid]) return { ok: false, error: 'already_tried' };
    if (md.winners.length >= Number(md.maxWinners || 15)) {
      return { ok: false, error: 'max_winners_reached' };
    }
    const isCorrect = guessedCityId === md.correctCityId;
    md.attempts[u.uid] = { cityId: guessedCityId, correct: isCorrect, ts: Date.now() };
    if (isCorrect) {
      const reward = Number(md.rewardCoins || 500);
      md.winners.push({ uid: u.uid, name: u.name, cityId: u.homeCity, reward, ts: Date.now() });
      this.addCoins(u.uid, reward, 30);
      this.addCityScore(u.homeCity || md.correctCityId, 50);
      if (md.winners.length >= Number(md.maxWinners || 15)) {
        md.status = 'concluded';
      }
    }
    md.updatedAt = Date.now();
    this._notifyContestUpdate('mystery_guessed');
    return { ok: true, correct: isCorrect, reward: isCorrect ? Number(md.rewardCoins || 500) : 0 };
  },

  adminStopMysteryDetective() {
    const vc = this.ensureViralContests();
    vc.mysteryDetective = Object.assign(getDefaultViralContests().mysteryDetective, { updatedAt: Date.now() });
    this._notifyContestUpdate('mystery_stopped');
  },

  // ── 5. 🎟️ FOUNDER'S GOLDEN TICKET RAFFLE ──
  adminLaunchGoldenRaffle(opts = {}) {
    const vc = this.ensureViralContests();
    const hours = Math.max(1, Number(opts.durationHours || 48));
    vc.goldenRaffle = {
      active: true,
      status: 'open',
      title_en: (opts.title_en || 'Founder’s Golden Ticket Raffle').trim(),
      title_fr: (opts.title_fr || 'Grande Tombola Ticket d’Or du Fondateur').trim(),
      prizeCoins: Math.max(100, Number(opts.prizeCoins || 2500)),
      winnersCount: Math.max(1, Number(opts.winnersCount || 3)),
      endsAt: Date.now() + hours * 3600000,
      tickets: [],
      winningTickets: [],
      updatedAt: Date.now()
    };
    this._notifyContestUpdate('raffle_launched');
    return vc.goldenRaffle;
  },

  claimGoldenRaffleTicket() {
    const vc = this.ensureViralContests();
    const gr = vc.goldenRaffle;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!gr.active || gr.status !== 'open') return { ok: false, error: 'ended' };
    gr.tickets = Array.isArray(gr.tickets) ? gr.tickets : [];
    const existing = gr.tickets.find((t) => t && t.uid === u.uid);
    if (existing) return { ok: false, error: 'already_claimed', ticket: existing };
    const code = 'GOLD-' + String(1001 + gr.tickets.length);
    const ticket = {
      code,
      uid: u.uid,
      name: u.name,
      cityId: u.homeCity || 'montreal',
      ts: Date.now()
    };
    gr.tickets.push(ticket);
    gr.updatedAt = Date.now();
    this.addCoins(u.uid, 10, 10);
    this._notifyContestUpdate('raffle_ticket_claimed');
    return { ok: true, ticket };
  },

  adminDrawGoldenRaffleWinners() {
    const vc = this.ensureViralContests();
    const gr = vc.goldenRaffle;
    if (!gr || !Array.isArray(gr.tickets) || gr.tickets.length === 0) {
      return { ok: false, error: 'no_tickets' };
    }
    const pool = gr.tickets.slice();
    const count = Math.min(pool.length, Math.max(1, Number(gr.winnersCount || 3)));
    const winners = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      const picked = pool.splice(idx, 1)[0];
      if (picked) {
        winners.push(picked);
        if (picked.uid) {
          this.adminAdjustUserCoins(picked.uid, 'add', Number(gr.prizeCoins || 2500));
        }
      }
    }
    gr.winningTickets = winners;
    gr.status = 'concluded';
    gr.updatedAt = Date.now();
    this._notifyContestUpdate('raffle_drawn');
    return { ok: true, winners };
  },

  adminStopGoldenRaffle() {
    const vc = this.ensureViralContests();
    vc.goldenRaffle = Object.assign(getDefaultViralContests().goldenRaffle, { updatedAt: Date.now() });
    this._notifyContestUpdate('raffle_stopped');
  },

  // ── 6. ⚡ FOUNDER'S FLASH TREASURE HUNT (First N Citizens) ──
  adminLaunchFlashHunt(opts = {}) {
    const vc = this.ensureViralContests();
    vc.flashHunt = {
      active: true,
      status: 'open',
      riddle_en: (opts.riddle_en || 'Solve the Founder’s riddle and pick the secret target city!').trim(),
      riddle_fr: (opts.riddle_fr || 'Résolvez l’énigme du Fondateur et trouvez la ville cible secrète !').trim(),
      targetCityId: opts.targetCityId || 'montreal',
      rewardCoins: Math.max(50, Number(opts.rewardCoins || 300)),
      maxClaims: Math.max(1, Number(opts.maxClaims || 20)),
      claims: [],
      attempts: {},
      updatedAt: Date.now()
    };
    this._notifyContestUpdate('flash_hunt_launched');
    return vc.flashHunt;
  },

  claimFlashHuntTreasure(selectedCityId) {
    const vc = this.ensureViralContests();
    const fh = vc.flashHunt;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!fh.active || fh.status !== 'open') return { ok: false, error: 'ended' };
    fh.claims = Array.isArray(fh.claims) ? fh.claims : [];
    fh.attempts = fh.attempts || {};
    if (fh.claims.some((c) => c && c.uid === u.uid) || fh.attempts[u.uid]) {
      return { ok: false, error: 'already_tried' };
    }
    if (fh.claims.length >= Number(fh.maxClaims || 20)) {
      return { ok: false, error: 'empty' };
    }
    const isCorrect = selectedCityId === fh.targetCityId;
    fh.attempts[u.uid] = { cityId: selectedCityId, correct: isCorrect, ts: Date.now() };
    if (isCorrect) {
      const reward = Number(fh.rewardCoins || 300);
      fh.claims.push({ uid: u.uid, name: u.name, cityId: u.homeCity, reward, ts: Date.now() });
      this.addCoins(u.uid, reward, 25);
      this.addCityScore(fh.targetCityId, 30);
      if (fh.claims.length >= Number(fh.maxClaims || 20)) {
        fh.status = 'concluded';
      }
    }
    fh.updatedAt = Date.now();
    this._notifyContestUpdate('flash_hunt_claimed');
    return { ok: true, correct: isCorrect, reward: isCorrect ? Number(fh.rewardCoins || 300) : 0 };
  },

  adminStopFlashHunt() {
    const vc = this.ensureViralContests();
    vc.flashHunt = Object.assign(getDefaultViralContests().flashHunt, { updatedAt: Date.now() });
    this._notifyContestUpdate('flash_hunt_stopped');
  },

  /* ═══════════════════════════════════════════════════════════════════════
     7 UNIQUE REMO WORLD SYSTEMS (100% Admin Controlled, EN/FR Bilingual)
     ═══════════════════════════════════════════════════════════════════════ */
  ensureWorldSystems() {
    const defs = getDefaultUniqueWorldSystems();
    if (!this.state.worldSystems || typeof this.state.worldSystems !== 'object') {
      this.state.worldSystems = defs;
    } else {
      Object.keys(defs).forEach((k) => {
        if (!this.state.worldSystems[k] || typeof this.state.worldSystems[k] !== 'object') {
          this.state.worldSystems[k] = defs[k];
        } else {
          this.state.worldSystems[k] = Object.assign({}, defs[k], this.state.worldSystems[k]);
        }
      });
    }
    return this.state.worldSystems;
  },

  _calcCityDistKm(cityAId, cityBId) {
    const cA = typeof getCityById === 'function' ? getCityById(cityAId) : null;
    const cB = typeof getCityById === 'function' ? getCityById(cityBId) : null;
    if (!cA || !cB) return 1250;
    const R = 6371;
    const dLat = ((Number(cB.lat || 0) - Number(cA.lat || 0)) * Math.PI) / 180;
    const dLng = ((Number(cB.lng || 0) - Number(cA.lng || 0)) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((Number(cA.lat || 0) * Math.PI) / 180) *
        Math.cos((Number(cB.lat || 0) * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(15, Math.round(R * c));
  },

  // ── 🔥 1. 4D WORLD TORCH RELAY™ ──
  adminLaunchTorchRelay(opts = {}) {
    const ws = this.ensureWorldSystems();
    const startCity = opts.startCityId || 'montreal';
    ws.torchRelay = {
      active: true,
      status: 'running',
      title_en: (opts.title_en || '4D World Torch Relay™ around the Earth').trim(),
      title_fr: (opts.title_fr || 'Relais de la Flamme Olympique 4D REMO™ autour du Monde').trim(),
      startCityId: startCity,
      currentCityId: startCity,
      currentHolderUid: 'u_admin_founder',
      currentHolderName: 'REMO Founder',
      targetCitiesCount: Math.max(2, Number(opts.targetCitiesCount || 10)),
      jackpotCoins: Math.max(200, Number(opts.jackpotCoins || 5000)),
      perPassCoins: Math.max(10, Number(opts.perPassCoins || 50)),
      totalKm: 0,
      visitedCities: [startCity],
      holdersHistory: [
        {
          uid: 'u_admin_founder',
          name: 'REMO Founder',
          fromCityId: startCity,
          toCityId: startCity,
          km: 0,
          message: '🔥 Planetary Torch Ignited by Founder!',
          ts: Date.now()
        }
      ],
      jackpotPaid: false,
      updatedAt: Date.now()
    };
    this.addCityScore(startCity, 50);
    this._notifyContestUpdate('torch_relay_launched');
    return ws.torchRelay;
  },

  passWorldTorchToCity(nextCityId, message = '') {
    const ws = this.ensureWorldSystems();
    const tr = ws.torchRelay;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!tr.active || tr.status !== 'running') return { ok: false, error: 'not_running' };
    if (!nextCityId || nextCityId === tr.currentCityId) return { ok: false, error: 'same_city' };

    const km = this._calcCityDistKm(tr.currentCityId, nextCityId);
    const prevCity = tr.currentCityId;
    tr.currentCityId = nextCityId;
    tr.currentHolderUid = u.uid;
    tr.currentHolderName = u.name;
    tr.totalKm = Number(tr.totalKm || 0) + km;
    tr.visitedCities = Array.isArray(tr.visitedCities) ? tr.visitedCities : [tr.startCityId || 'montreal'];
    if (!tr.visitedCities.includes(nextCityId)) {
      tr.visitedCities.push(nextCityId);
    }
    tr.holdersHistory = Array.isArray(tr.holdersHistory) ? tr.holdersHistory : [];
    tr.holdersHistory.push({
      uid: u.uid,
      name: u.name,
      fromCityId: prevCity,
      toCityId: nextCityId,
      km,
      message: String(message || '').trim().slice(0, 140),
      ts: Date.now()
    });

    const reward = Number(tr.perPassCoins || 50);
    this.addCoins(u.uid, reward, 30);
    this.addCityScore(nextCityId, 45);
    this.addCityScore(prevCity, 20);

    let jackpotTriggered = false;
    if (tr.visitedCities.length >= Number(tr.targetCitiesCount || 10) && !tr.jackpotPaid) {
      this._distributeTorchJackpotInternal(tr);
      jackpotTriggered = true;
    }

    tr.updatedAt = Date.now();
    this._notifyContestUpdate('torch_passed');
    return { ok: true, km, reward, totalKm: tr.totalKm, visitedCount: tr.visitedCities.length, jackpotTriggered };
  },

  _distributeTorchJackpotInternal(tr) {
    if (!tr || tr.jackpotPaid) return 0;
    const uniqueUids = Array.from(
      new Set((tr.holdersHistory || []).map((h) => h && h.uid).filter(Boolean))
    );
    const count = Math.max(1, uniqueUids.length);
    const share = Math.max(50, Math.round(Number(tr.jackpotCoins || 5000) / count));
    uniqueUids.forEach((uid) => {
      this.adminAdjustUserCoins(uid, 'add', share);
    });
    (tr.visitedCities || []).forEach((cid) => {
      this.addCityScore(cid, 100);
    });
    tr.jackpotPaid = true;
    tr.status = 'concluded';
    return share;
  },

  adminConcludeTorchJackpot() {
    const ws = this.ensureWorldSystems();
    const tr = ws.torchRelay;
    const share = this._distributeTorchJackpotInternal(tr);
    tr.updatedAt = Date.now();
    this._notifyContestUpdate('torch_jackpot_concluded');
    return { ok: true, share };
  },

  adminStopTorchRelay() {
    const ws = this.ensureWorldSystems();
    ws.torchRelay = Object.assign(getDefaultUniqueWorldSystems().torchRelay, { updatedAt: Date.now() });
    this._notifyContestUpdate('torch_relay_stopped');
  },

  // ── 🌍 2. GLOBAL SYNC FLASH™ (Simultaneous Planetary Live Window) ──
  adminLaunchGlobalSync(opts = {}) {
    const ws = this.ensureWorldSystems();
    const durationMin = Math.max(5, Number(opts.durationMinutes || 25));
    ws.globalSync = {
      active: true,
      status: 'open',
      prompt_en: (opts.prompt_en || 'Show the sky or your view in your city right now!').trim(),
      prompt_fr: (opts.prompt_fr || 'Montrez le ciel ou votre vue dans votre ville en cet instant !').trim(),
      rewardCoins: Math.max(25, Number(opts.rewardCoins || 100)),
      endsAt: Date.now() + durationMin * 60000,
      moments: [],
      participants: {},
      updatedAt: Date.now()
    };
    this._notifyContestUpdate('global_sync_launched');
    return ws.globalSync;
  },

  submitGlobalSyncMoment(opts = {}) {
    const ws = this.ensureWorldSystems();
    const gs = ws.globalSync;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!gs.active || gs.status !== 'open') return { ok: false, error: 'not_open' };
    if (gs.endsAt && Date.now() > gs.endsAt) {
      gs.status = 'concluded';
      gs.updatedAt = Date.now();
      this._notifyContestUpdate('global_sync_expired');
      return { ok: false, error: 'expired' };
    }
    gs.participants = gs.participants || {};
    if (gs.participants[u.uid]) return { ok: false, error: 'already_synced' };

    const cityId = opts.cityId || u.homeCity || 'montreal';
    const wStatus = typeof REMO_WEATHER !== 'undefined' && REMO_WEATHER.getCityLiveStatus
      ? REMO_WEATHER.getCityLiveStatus(cityId)
      : { timeStr: '12:00', tempC: 20, icon: '☀️' };

    const item = {
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      uid: u.uid,
      authorName: u.name,
      cityId,
      caption: String(opts.caption || '').trim().slice(0, 180) || '⚡ Live from my city!',
      mediaUrl: String(opts.mediaUrl || '').trim(),
      localTime: wStatus.timeStr || '12:00',
      tempC: wStatus.tempC !== undefined ? wStatus.tempC : 20,
      weatherIcon: wStatus.icon || '☀️',
      ts: Date.now()
    };

    gs.moments = Array.isArray(gs.moments) ? gs.moments : [];
    gs.moments.unshift(item);
    gs.participants[u.uid] = true;

    const reward = Number(gs.rewardCoins || 100);
    this.addCoins(u.uid, reward, 35);
    this.addCityScore(cityId, 40);

    gs.updatedAt = Date.now();
    this._notifyContestUpdate('global_sync_submitted');
    return { ok: true, reward, item };
  },

  adminStopGlobalSync() {
    const ws = this.ensureWorldSystems();
    ws.globalSync = Object.assign(getDefaultUniqueWorldSystems().globalSync, { updatedAt: Date.now() });
    this._notifyContestUpdate('global_sync_stopped');
  },

  // ── 🏛️ 3. WORLD CITY MAYOR & ROYAL KEY™ ──
  adminToggleMayorElections(active = true) {
    const ws = this.ensureWorldSystems();
    ws.mayorElections.active = !!active;
    ws.mayorElections.status = active ? 'open' : 'idle';
    ws.mayorElections.updatedAt = Date.now();
    this._notifyContestUpdate('mayor_elections_toggled');
    return ws.mayorElections;
  },

  nominateOrVoteCityMayor(cityId, candidateUidOrSelf = '', manifesto = '') {
    const ws = this.ensureWorldSystems();
    const me = ws.mayorElections;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!me.active) return { ok: false, error: 'inactive' };
    const cid = cityId || u.homeCity || 'montreal';
    me.candidates = me.candidates || {};
    me.candidates[cid] = Array.isArray(me.candidates[cid]) ? me.candidates[cid] : [];
    me.voters = me.voters || {};

    const targetUid = candidateUidOrSelf || u.uid;
    let cand = me.candidates[cid].find((c) => c && c.uid === targetUid);
    if (!cand) {
      const targetUser = (this.state.users || []).find((x) => x.uid === targetUid) || u;
      cand = {
        uid: targetUser.uid,
        name: targetUser.name || 'Citizen',
        manifesto: String(manifesto || 'For the glory of our 4D City!').trim().slice(0, 140),
        votes: 0
      };
      me.candidates[cid].push(cand);
    } else if (manifesto && targetUid === u.uid) {
      cand.manifesto = String(manifesto).trim().slice(0, 140);
    }

    const voteKey = `${cid}_${u.uid}`;
    if (me.voters[voteKey]) {
      return { ok: false, error: 'already_voted' };
    }
    me.voters[voteKey] = targetUid;
    cand.votes = Number(cand.votes || 0) + 1;

    // Sort candidates by votes descending and update cityMayor if top
    me.candidates[cid].sort((a, b) => Number(b.votes || 0) - Number(a.votes || 0));
    const leader = me.candidates[cid][0];
    if (leader && leader.uid) {
      this.state.cityMayors = this.state.cityMayors || {};
      this.state.cityMayors[cid] = leader.uid;
    }

    const reward = Number(me.voteRewardCoins || 15);
    this.addCoins(u.uid, reward, 15);
    this.addCityScore(cid, 20);
    me.updatedAt = Date.now();
    this._notifyContestUpdate('mayor_vote_cast');
    return { ok: true, candidate: cand, reward };
  },

  adminCrownCityMayorDirect(cityId, citizenNameOrUid, customDecree = '') {
    const ws = this.ensureWorldSystems();
    const me = ws.mayorElections;
    const cid = cityId || 'montreal';
    const q = String(citizenNameOrUid || '').trim().toLowerCase();
    let targetUser = (this.state.users || []).find(
      (u) => u && (u.uid.toLowerCase() === q || (u.name && u.name.toLowerCase() === q))
    );
    if (!targetUser) {
      targetUser = {
        uid: q ? 'u_mayor_' + q.replace(/[^a-z0-9]/g, '_') : 'u_admin_founder',
        name: citizenNameOrUid || 'REMO Founder'
      };
    }
    this.state.cityMayors = this.state.cityMayors || {};
    this.state.cityMayors[cid] = targetUser.uid;

    me.candidates = me.candidates || {};
    me.candidates[cid] = Array.isArray(me.candidates[cid]) ? me.candidates[cid] : [];
    let cand = me.candidates[cid].find((c) => c && c.uid === targetUser.uid);
    if (!cand) {
      cand = { uid: targetUser.uid, name: targetUser.name, manifesto: customDecree || 'Appointed by Founder Royal Key 🔑', votes: 100 };
      me.candidates[cid].unshift(cand);
    } else {
      cand.votes = Math.max(Number(cand.votes || 0) + 50, 100);
    }

    if (customDecree) {
      me.cityDecrees = me.cityDecrees || {};
      me.cityDecrees[cid] = {
        authorUid: targetUser.uid,
        authorName: targetUser.name,
        text_en: customDecree,
        text_fr: customDecree,
        approved: true,
        updatedAt: Date.now()
      };
    }
    me.active = true;
    me.status = 'open';
    me.updatedAt = Date.now();
    this._notifyContestUpdate('admin_mayor_crowned');
    return { ok: true, mayor: targetUser, cityId: cid };
  },

  submitMayorCityDecree(cityId, text) {
    const ws = this.ensureWorldSystems();
    const me = ws.mayorElections;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    const cid = cityId || u.homeCity || 'montreal';
    const currentMayorUid = (this.state.cityMayors && this.state.cityMayors[cid]) || '';
    const isAdmin = this.isAdminUnlocked() || u.uid === 'u_admin_founder';
    if (currentMayorUid !== u.uid && !isAdmin) {
      return { ok: false, error: 'not_mayor' };
    }
    const cleanText = String(text || '').trim().slice(0, 220);
    if (!cleanText) return { ok: false, error: 'empty' };
    me.cityDecrees = me.cityDecrees || {};
    me.cityDecrees[cid] = {
      authorUid: u.uid,
      authorName: u.name,
      text_en: cleanText,
      text_fr: cleanText,
      approved: isAdmin, // Admin decrees auto-approved; citizen mayors await Admin 1-click approval
      updatedAt: Date.now()
    };
    me.updatedAt = Date.now();
    this._notifyContestUpdate('mayor_decree_submitted');
    return { ok: true, approved: isAdmin };
  },

  adminApproveMayorDecree(cityId, approve = true) {
    const ws = this.ensureWorldSystems();
    const me = ws.mayorElections;
    me.cityDecrees = me.cityDecrees || {};
    if (me.cityDecrees[cityId]) {
      if (approve) {
        me.cityDecrees[cityId].approved = true;
      } else {
        delete me.cityDecrees[cityId];
      }
      me.updatedAt = Date.now();
      this._notifyContestUpdate('mayor_decree_moderated');
    }
    return { ok: true };
  },

  // ── 🤝 4. SISTER CITIES 2X ALLIANCE™ (48h Twin-City Treaties) ──
  adminCreateSisterAlliance(cityA, cityB, durationHours = 48, waveRewardCoins = 40) {
    if (!cityA || !cityB || cityA === cityB) return { ok: false, error: 'same_city' };
    const ws = this.ensureWorldSystems();
    const sa = ws.sisterAlliances;
    sa.active = true;
    sa.treaties = Array.isArray(sa.treaties) ? sa.treaties : [];
    const existingIdx = sa.treaties.findIndex(
      (t) => t && ((t.cityA === cityA && t.cityB === cityB) || (t.cityA === cityB && t.cityB === cityA))
    );
    const treaty = {
      id: 'ally_' + cityA + '_' + cityB + '_' + Date.now(),
      cityA,
      cityB,
      bonusMultiplier: 2,
      waveRewardCoins: Math.max(10, Number(waveRewardCoins || 40)),
      wavesCount: 0,
      wavedBy: {},
      recentWaves: [],
      endsAt: Date.now() + Math.max(1, Number(durationHours || 48)) * 3600000
    };
    if (existingIdx >= 0) {
      sa.treaties[existingIdx] = treaty;
    } else {
      sa.treaties.unshift(treaty);
    }
    sa.updatedAt = Date.now();
    this._notifyContestUpdate('sister_alliance_created');
    return { ok: true, treaty };
  },

  sendSisterAllianceWave(treatyId, greeting = '') {
    const ws = this.ensureWorldSystems();
    const sa = ws.sisterAlliances;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!sa.active || !Array.isArray(sa.treaties)) return { ok: false, error: 'inactive' };
    const t = sa.treaties.find((x) => x && x.id === treatyId);
    if (!t) return { ok: false, error: 'not_found' };
    if (t.endsAt && Date.now() > t.endsAt) return { ok: false, error: 'expired' };
    t.wavedBy = t.wavedBy || {};
    if (t.wavedBy[u.uid]) return { ok: false, error: 'already_waved' };

    t.wavedBy[u.uid] = Date.now();
    t.wavesCount = Number(t.wavesCount || 0) + 1;
    t.recentWaves = Array.isArray(t.recentWaves) ? t.recentWaves : [];
    t.recentWaves.unshift({
      uid: u.uid,
      name: u.name,
      homeCity: u.homeCity || t.cityA,
      greeting: String(greeting || '🤝 Long live our Sister Cities Alliance!').trim().slice(0, 120),
      ts: Date.now()
    });
    if (t.recentWaves.length > 15) t.recentWaves.length = 15;

    const reward = Number(t.waveRewardCoins || 40);
    this.addCoins(u.uid, reward, 30);
    // 2X Alliance Bonus to BOTH sister cities!
    this.addCityScore(t.cityA, 50);
    this.addCityScore(t.cityB, 50);

    sa.updatedAt = Date.now();
    this._notifyContestUpdate('sister_alliance_wave');
    return { ok: true, reward, treaty: t };
  },

  adminRemoveSisterAlliance(treatyId) {
    const ws = this.ensureWorldSystems();
    const sa = ws.sisterAlliances;
    if (treatyId === 'ALL') {
      sa.treaties = [];
      sa.active = false;
    } else {
      sa.treaties = (sa.treaties || []).filter((t) => t && t.id !== treatyId);
      if (sa.treaties.length === 0) sa.active = false;
    }
    sa.updatedAt = Date.now();
    this._notifyContestUpdate('sister_alliance_removed');
    return { ok: true };
  },

  // ── 🎨 5. REMO WORLD PIXEL CANVAS™ (Collaborative City Flags & Monuments Fresco) ──
  adminTogglePixelCanvas(active = true, opts = {}) {
    const ws = this.ensureWorldSystems();
    const pc = ws.pixelCanvas;
    pc.active = !!active;
    if (opts.title_en) pc.title_en = opts.title_en.trim();
    if (opts.title_fr) pc.title_fr = opts.title_fr.trim();
    if (opts.pixelRewardCoins) pc.pixelRewardCoins = Math.max(1, Number(opts.pixelRewardCoins));
    pc.updatedAt = Date.now();
    this._notifyContestUpdate('pixel_canvas_toggled');
    return pc;
  },

  placeWorldPixel(x, y, color = '#fbbf24') {
    const ws = this.ensureWorldSystems();
    const pc = ws.pixelCanvas;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!pc.active) return { ok: false, error: 'inactive' };
    const ix = Math.max(0, Math.min(Number(pc.width || 24) - 1, Math.floor(Number(x || 0))));
    const iy = Math.max(0, Math.min(Number(pc.height || 14) - 1, Math.floor(Number(y || 0))));
    const key = `${ix}_${iy}`;

    pc.pixels = pc.pixels || {};
    pc.pixels[key] = {
      color: String(color || '#fbbf24').slice(0, 16),
      uid: u.uid,
      name: u.name,
      cityId: u.homeCity || 'montreal'
    };
    pc.totalPixelsPlaced = Number(pc.totalPixelsPlaced || 0) + 1;
    pc.contributors = pc.contributors || {};
    pc.contributors[u.uid] = {
      name: u.name,
      cityId: u.homeCity || 'montreal',
      count: Number((pc.contributors[u.uid] && pc.contributors[u.uid].count) || 0) + 1
    };

    const reward = Number(pc.pixelRewardCoins || 5);
    this.addCoins(u.uid, reward, 5);
    this.addCityScore(u.homeCity || 'montreal', 5);
    pc.updatedAt = Date.now();
    this._notifyContestUpdate('pixel_placed');
    return { ok: true, key, reward };
  },

  adminPresetCityFlagOnCanvas(preset = 'remo_gold') {
    const ws = this.ensureWorldSystems();
    const pc = ws.pixelCanvas;
    pc.pixels = pc.pixels || {};
    const W = Number(pc.width || 24);
    const H = Number(pc.height || 14);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let col = '';
        if (preset === 'tricolor_md_ro') {
          col = x < W / 3 ? '#2563eb' : x < (2 * W) / 3 ? '#fbbf24' : '#ef4444';
        } else if (preset === 'montreal_quebec') {
          col = (x === Math.floor(W / 2) || y === Math.floor(H / 2)) ? '#ffffff' : '#1d4ed8';
        } else {
          // REMO Crown & Heart emblem
          const isBorder = x === 0 || x === W - 1 || y === 0 || y === H - 1;
          const isCenterCrown = y >= 4 && y <= 9 && x >= 7 && x <= 16 && ((x + y) % 2 === 0);
          col = isBorder ? '#fbbf24' : isCenterCrown ? '#38bdf8' : '#0f172a';
        }
        if (col) {
          pc.pixels[`${x}_${y}`] = { color: col, uid: 'u_admin_founder', name: 'REMO Founder', cityId: 'montreal' };
        }
      }
    }
    pc.active = true;
    pc.totalPixelsPlaced = Number(pc.totalPixelsPlaced || 0) + W * H;
    pc.updatedAt = Date.now();
    this._notifyContestUpdate('pixel_canvas_preset');
    return { ok: true };
  },

  adminClearPixelCanvas() {
    const ws = this.ensureWorldSystems();
    ws.pixelCanvas.pixels = {};
    ws.pixelCanvas.updatedAt = Date.now();
    this._notifyContestUpdate('pixel_canvas_cleared');
    return { ok: true };
  },

  adminMintCanvasAs4DCard() {
    const ws = this.ensureWorldSystems();
    const pc = ws.pixelCanvas;
    pc.mintedCardsCount = Number(pc.mintedCardsCount || 0) + 1;
    // Reward all contributors +100 bonus coins!
    Object.keys(pc.contributors || {}).forEach((uid) => {
      this.adminAdjustUserCoins(uid, 'add', 100);
    });
    pc.updatedAt = Date.now();
    this._notifyContestUpdate('pixel_canvas_minted');
    return { ok: true, edition: pc.mintedCardsCount };
  },

  // ── ⏳ 6. CITY MONUMENT TIME-VAULT™ (Sealed Future Capsules) ──
  adminLaunchMonumentVault(opts = {}) {
    const ws = this.ensureWorldSystems();
    const mv = ws.monumentVault;
    mv.active = true;
    mv.sealed = opts.sealed !== undefined ? !!opts.sealed : true;
    mv.title_en = (opts.title_en || 'City Monument Time-Vault™ — Sealed Wishes & Predictions').trim();
    mv.title_fr = (opts.title_fr || 'Monument Capsule Temporelle des Villes™ — Vœux & Prédictions Scellés').trim();
    mv.unsealTargetLabel_en = (opts.unsealTargetLabel_en || 'Official Founder Gala Opening').trim();
    mv.unsealTargetLabel_fr = (opts.unsealTargetLabel_fr || 'Grande Ouverture Gala du Fondateur').trim();
    mv.depositRewardCoins = Math.max(10, Number(opts.depositRewardCoins || 25));
    if (opts.resetCapsules) mv.capsules = [];
    mv.updatedAt = Date.now();
    this._notifyContestUpdate('monument_vault_launched');
    return mv;
  },

  depositMonumentCapsule(opts = {}) {
    const ws = this.ensureWorldSystems();
    const mv = ws.monumentVault;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!mv.active) return { ok: false, error: 'inactive' };
    mv.capsules = Array.isArray(mv.capsules) ? mv.capsules : [];
    if (mv.capsules.some((c) => c && c.uid === u.uid)) {
      return { ok: false, error: 'already_deposited' };
    }
    const message = String(opts.message || '').trim().slice(0, 260);
    if (!message) return { ok: false, error: 'empty' };

    const cap = {
      id: 'cap_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      uid: u.uid,
      authorName: u.name,
      cityId: opts.cityId || u.homeCity || 'montreal',
      message,
      mediaUrl: String(opts.mediaUrl || '').trim(),
      ts: Date.now()
    };
    mv.capsules.unshift(cap);
    const reward = Number(mv.depositRewardCoins || 25);
    this.addCoins(u.uid, reward, 20);
    this.addCityScore(cap.cityId, 30);

    mv.updatedAt = Date.now();
    this._notifyContestUpdate('monument_capsule_deposited');
    return { ok: true, reward, capsule: cap };
  },

  adminUnsealMonumentVault() {
    const ws = this.ensureWorldSystems();
    const mv = ws.monumentVault;
    mv.active = true;
    mv.sealed = false;
    // Bonus +50 coins to every citizen who deposited a capsule!
    (mv.capsules || []).forEach((c) => {
      if (c && c.uid) this.adminAdjustUserCoins(c.uid, 'add', 50);
    });
    mv.updatedAt = Date.now();
    RemoAudio.play('fanfare');
    this._notifyContestUpdate('monument_vault_unsealed');
    return { ok: true, count: (mv.capsules || []).length };
  },

  adminStopMonumentVault() {
    const ws = this.ensureWorldSystems();
    ws.monumentVault.active = false;
    ws.monumentVault.updatedAt = Date.now();
    this._notifyContestUpdate('monument_vault_stopped');
  },

  // ── 📈 7. CREATOR SHARES & FAN DIVIDENDS™ (Creator Stock Exchange) ──
  adminToggleCreatorBourse(active = true) {
    const ws = this.ensureWorldSystems();
    ws.creatorBourse.active = !!active;
    ws.creatorBourse.updatedAt = Date.now();
    this._notifyContestUpdate('creator_bourse_toggled');
    return ws.creatorBourse;
  },

  adminAddFeaturedCreatorStock(creatorName, cityId = 'montreal', initialPrice = 50) {
    const ws = this.ensureWorldSystems();
    const cb = ws.creatorBourse;
    const cleanName = String(creatorName || '').trim().replace(/^@/, '');
    if (!cleanName) return { ok: false, error: 'empty' };
    cb.stocks = Array.isArray(cb.stocks) ? cb.stocks : [];
    const existing = cb.stocks.find((s) => s && s.creatorName.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      existing.cityId = cityId || existing.cityId;
      existing.sharePrice = Math.max(10, Number(initialPrice || existing.sharePrice));
    } else {
      const matchedUser = (this.state.users || []).find(
        (u) => u && u.name && u.name.toLowerCase() === cleanName.toLowerCase()
      );
      cb.stocks.push({
        creatorUid: (matchedUser && matchedUser.uid) || 'u_creator_' + Date.now(),
        creatorName: (matchedUser && matchedUser.name) || cleanName,
        cityId: cityId || (matchedUser && matchedUser.homeCity) || 'montreal',
        sharePrice: Math.max(10, Number(initialPrice || 50)),
        totalShares: 5,
        shareholders: {},
        lastDividendCoins: 0,
        dividendsPaidCount: 0
      });
    }
    cb.active = true;
    cb.updatedAt = Date.now();
    this._notifyContestUpdate('creator_stock_added');
    return { ok: true };
  },

  buyCreatorShare(creatorUid) {
    const ws = this.ensureWorldSystems();
    const cb = ws.creatorBourse;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    if (!cb.active) return { ok: false, error: 'inactive' };
    const stock = (cb.stocks || []).find((s) => s && s.creatorUid === creatorUid);
    if (!stock) return { ok: false, error: 'not_found' };
    const price = Math.max(10, Number(stock.sharePrice || 50));
    if (Number(u.coins || 0) < price) return { ok: false, error: 'insufficient_coins', price };

    u.coins = Number(u.coins || 0) - price;
    stock.shareholders = stock.shareholders || {};
    stock.shareholders[u.uid] = Number(stock.shareholders[u.uid] || 0) + 1;
    stock.totalShares = Number(stock.totalShares || 0) + 1;
    stock.sharePrice = price + 5; // Demand drives creator share price up!

    // Creator receives +10 🪙 royalty when a fan invests in their stock
    if (stock.creatorUid && stock.creatorUid !== u.uid) {
      this.adminAdjustUserCoins(stock.creatorUid, 'add', 10);
    }
    this.addCityScore(stock.cityId || 'montreal', 15);
    cb.updatedAt = Date.now();
    this._notifyContestUpdate('creator_share_bought');
    return { ok: true, pricePaid: price, newPrice: stock.sharePrice, owned: stock.shareholders[u.uid] };
  },

  sellCreatorShare(creatorUid) {
    const ws = this.ensureWorldSystems();
    const cb = ws.creatorBourse;
    const u = this.getCurrentUser();
    if (!u || u.role === 'guest') return { ok: false, error: 'auth_required' };
    const stock = (cb.stocks || []).find((s) => s && s.creatorUid === creatorUid);
    if (!stock || !stock.shareholders || Number(stock.shareholders[u.uid] || 0) <= 0) {
      return { ok: false, error: 'no_shares' };
    }
    const sellValue = Math.max(10, Math.round(Number(stock.sharePrice || 50) * 0.9));
    stock.shareholders[u.uid] = Number(stock.shareholders[u.uid]) - 1;
    if (stock.shareholders[u.uid] <= 0) delete stock.shareholders[u.uid];
    stock.totalShares = Math.max(1, Number(stock.totalShares || 1) - 1);
    stock.sharePrice = Math.max(20, Number(stock.sharePrice || 50) - 3);
    this.addCoins(u.uid, sellValue, 5);
    cb.updatedAt = Date.now();
    this._notifyContestUpdate('creator_share_sold');
    return { ok: true, sellValue, newPrice: stock.sharePrice };
  },

  adminPayCreatorDividend(creatorUid, dividendPerShare = 30) {
    const ws = this.ensureWorldSystems();
    const cb = ws.creatorBourse;
    const stock = (cb.stocks || []).find((s) => s && s.creatorUid === creatorUid);
    if (!stock) return { ok: false, error: 'not_found' };
    const divPer = Math.max(5, Number(dividendPerShare || cb.dividendPerShareDefault || 30));
    let totalPaid = 0;
    let holdersCount = 0;
    Object.entries(stock.shareholders || {}).forEach(([holderUid, shares]) => {
      const sh = Number(shares || 0);
      if (sh > 0) {
        const payout = sh * divPer;
        this.adminAdjustUserCoins(holderUid, 'add', payout);
        totalPaid += payout;
        holdersCount++;
      }
    });
    // Also reward the creator themselves!
    this.adminAdjustUserCoins(stock.creatorUid, 'add', divPer * 2);
    stock.lastDividendCoins = divPer;
    stock.dividendsPaidCount = Number(stock.dividendsPaidCount || 0) + 1;
    cb.updatedAt = Date.now();
    RemoAudio.play('fanfare');
    this._notifyContestUpdate('creator_dividend_paid');
    return { ok: true, totalPaid, holdersCount, creatorName: stock.creatorName };
  },

  sanitizeAuctionItem(a) {
    if (!a || !a.cardSpec) return null;
    const cs = a.cardSpec;
    let photoUrl = cs.customPhotoDataUrl || '';
    if (photoUrl.startsWith('data:') && photoUrl.length > 150000 && Array.isArray(this.state?.posts)) {
      const p = this.state.posts.find((x) =>
        x && (x.id === cs.postId || x.mintedCardId === cs.id || (x.mintedCard && x.authorName && cs.ownerName && x.authorName.toLowerCase() === cs.ownerName.toLowerCase()))
      );
      if (p && p.mediaUrl && /^https?:\/\//i.test(p.mediaUrl)) {
        photoUrl = p.mediaUrl;
      }
    }
    return {
      id: a.id || ('auc_' + Date.now()),
      sellerUid: a.sellerUid || cs.ownerUid || '',
      sellerName: a.sellerName || cs.ownerName || 'Citizen',
      currentBid: Number(a.currentBid || 250),
      highestBidder: a.highestBidder || '—',
      createdAt: Number(a.createdAt || Date.now()),
      endsAt: Number(a.endsAt || (Date.now() + 24 * 3600 * 1000)),
      cardSpec: {
        id: cs.id || ('card_' + Date.now()),
        postId: cs.postId || '',
        cityId: cs.cityId || 'montreal',
        title: cs.title || '',
        subtitle: cs.subtitle || '',
        serial: cs.serial || '0001',
        maxSupply: Number(cs.maxSupply || 1000),
        rarity: cs.rarity || 'Legendary Gold',
        themeId: cs.themeId !== undefined ? Number(cs.themeId) : 0,
        verifiedGps: Boolean(cs.verifiedGps),
        coinValue: Number(cs.coinValue || 9500),
        customPhotoDataUrl: photoUrl,
        ownerUid: cs.ownerUid || a.sellerUid || '',
        ownerName: cs.ownerName || a.sellerName || 'Citizen'
      }
    };
  },

  mergeCloudAuctions(cloudAuctions) {
    if (!this.deletedAuctionIds) this.deletedAuctionIds = new Set();
    const localList = Array.isArray(this.state.auctions) ? this.state.auctions : [];
    const cloudList = Array.isArray(cloudAuctions) ? cloudAuctions : [];
    const map = new Map();
    let localUnsyncedAdded = false;

    cloudList.forEach((ca) => {
      if (!ca || !ca.id || this.deletedAuctionIds.has(ca.id)) return;
      const cleanCa = this.sanitizeAuctionItem(ca);
      if (cleanCa) map.set(cleanCa.id, cleanCa);
    });

    localList.forEach((la) => {
      if (!la || !la.id || this.deletedAuctionIds.has(la.id)) return;
      const cleanLa = this.sanitizeAuctionItem(la);
      if (!cleanLa) return;
      if (!map.has(cleanLa.id)) {
        // Keep local auctions created by Admin or Citizen that had not yet synced to Cloud
        if (cleanLa.id !== 'auc_1' && cleanLa.id !== 'auc_2') {
          map.set(cleanLa.id, cleanLa);
          localUnsyncedAdded = true;
        }
      } else {
        const existing = map.get(cleanLa.id);
        if (Number(cleanLa.currentBid || 0) > Number(existing.currentBid || 0)) {
          existing.currentBid = cleanLa.currentBid;
          existing.highestBidder = cleanLa.highestBidder;
        }
        if (!existing.cardSpec.customPhotoDataUrl && cleanLa.cardSpec.customPhotoDataUrl) {
          existing.cardSpec.customPhotoDataUrl = cleanLa.cardSpec.customPhotoDataUrl;
        }
      }
    });

    this.state.auctions = Array.from(map.values());
    if (localUnsyncedAdded) {
      this.syncToFirestore('auction_resync', true);
    }
  },

  deleteAuctionFromCloud(aucId) {
    if (!aucId) return;
    if (!this.deletedAuctionIds) this.deletedAuctionIds = new Set();
    this.deletedAuctionIds.add(aucId);
    try {
      localStorage.setItem('remo_deleted_auctions', JSON.stringify([...this.deletedAuctionIds]));
    } catch (e) {}
    this.state.auctions = (this.state.auctions || []).filter((x) => x && x.id !== aucId);
    this.save(true, 'auction_delete');
    this.syncToFirestore('auction_delete', true);
  },

  syncToFirestore(reason = 'update', immediate = false) {
    if (!this.fbDb) return;
    clearTimeout(this._fbSyncDebounce);
    const doSync = () => {
      try {
        const cleanAuctions = (this.state.auctions || [])
          .filter((a) => a && a.id && (!this.deletedAuctionIds || !this.deletedAuctionIds.has(a.id)))
          .map((a) => this.sanitizeAuctionItem(a))
          .filter(Boolean)
          .slice(0, 25);
        const docRef = this.fbDb.collection('remo_ecosystem').doc('live_state');
        docRef.set({
          cityScores: this.state.cityScores || {},
          cityMayors: this.state.cityMayors || {},
          duels: (this.state.duels || []).slice(0, 15),
          settings: this.state.settings || {},
          bottles: (this.state.bottles || []).slice(0, 30),
          jukeboxTracks: (this.state.jukeboxTracks || []).slice(0, 30),
          auctions: cleanAuctions,
          geoVaults: (this.state.geoVaults || []).slice(0, 35),
          stories: (this.state.stories || []).slice(0, 15),
          viralContests: this.state.viralContests || getDefaultViralContests(),
          worldSystems: this.state.worldSystems || getDefaultUniqueWorldSystems(),
          deletedPostIds: [...(this.deletedPostIds || [])].slice(-100),
          deletedUserIds: [...(this.deletedUserIds || [])].slice(-100),
          deletedDuelIds: [...(this.deletedDuelIds || [])].slice(-100),
          deletedAuctionIds: [...(this.deletedAuctionIds || [])].slice(-100),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch((err) => {
          console.log('Firestore background sync info:', err.message);
        });
      } catch (e) {}
    };
    if (immediate) {
      doSync();
    } else {
      this._fbSyncDebounce = setTimeout(doSync, 1200);
    }
  }
};

REMO_STORE.getDefaultVipShopItems = getDefaultVipShopItems;
window.getDefaultVipShopItems = getDefaultVipShopItems;

REMO_STORE.init();

window.RemoAudio = RemoAudio;
window.RemoMediaDB = RemoMediaDB;
window.REMO_HTML_TEMPLATES = REMO_HTML_TEMPLATES;
window.REMO_TRANSLATOR = REMO_TRANSLATOR;
window.REMO_WEATHER = REMO_WEATHER;
window.REMO_STORE = REMO_STORE;
window.generateCityPostVisualDataUrl = generateCityPostVisualDataUrl;
