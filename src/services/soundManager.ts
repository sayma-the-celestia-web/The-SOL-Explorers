/**
 * Scientifically grounded Web Audio API synthesizer for NASA Space Apps visualization.
 * Synthesizes space drone, atmospheric approach rush, telemetry data chirps, and target lock chime.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private spaceDroneOsc1: OscillatorNode | null = null;
  private spaceDroneOsc2: OscillatorNode | null = null;
  private spaceDroneGain: GainNode | null = null;
  private lastChirpTime: number = 0;
  private hasPlayedLockChime: boolean = false;
  private hasPlayedAcquiredPing: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  public getMasterGain(): GainNode | null {
    this.initContext();
    return this.masterGain;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.65, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Start or maintain deep planetary ambient drone for orbital phase
   */
  public updateAmbientDrone(time: number, isPlaying: boolean) {
    if (!isPlaying) {
      this.stopAmbientDrone();
      return;
    }
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (!this.spaceDroneGain) {
      this.spaceDroneGain = this.ctx.createGain();
      this.spaceDroneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.spaceDroneGain.connect(this.masterGain);

      // Deep planetary resonance sub rumble (F0 ~ 43.65 Hz)
      this.spaceDroneOsc1 = this.ctx.createOscillator();
      this.spaceDroneOsc1.type = 'sine';
      this.spaceDroneOsc1.frequency.setValueAtTime(43.65, this.ctx.currentTime);

      // Subtle warm orbital harmonic
      this.spaceDroneOsc2 = this.ctx.createOscillator();
      this.spaceDroneOsc2.type = 'triangle';
      this.spaceDroneOsc2.frequency.setValueAtTime(87.3, this.ctx.currentTime);

      // Warm analog lowpass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.spaceDroneOsc1.connect(filter);
      this.spaceDroneOsc2.connect(filter);
      filter.connect(this.spaceDroneGain);

      this.spaceDroneOsc1.start();
      this.spaceDroneOsc2.start();
    }

    // Dynamic drone volume based on timeline
    const now = this.ctx.currentTime;
    if (time < 2.0) {
      // Deep space orbit
      this.spaceDroneGain.gain.setTargetAtTime(0.18, now, 0.2);
    } else if (time >= 2.0 && time < 4.5) {
      // Descent plunge - slight ramp
      this.spaceDroneGain.gain.setTargetAtTime(0.24, now, 0.2);
    } else if (time >= 4.5 && time < 7.0) {
      // Crater approach
      this.spaceDroneGain.gain.setTargetAtTime(0.12, now, 0.2);
    } else {
      // Interface map transition
      this.spaceDroneGain.gain.setTargetAtTime(0.05, now, 0.3);
    }
  }

  public stopAmbientDrone() {
    if (this.spaceDroneGain && this.ctx) {
      this.spaceDroneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Controlled atmospheric descent whoosh during 2s–4.5s
   */
  public triggerDescentWhoosh() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const bufferSize = this.ctx.sampleRate * 1.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Pinkish noise
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.7));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.2, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(240, this.ctx.currentTime + 1.8);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.6);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
    } catch {
      // Audio fallback safety
    }
  }

  /**
   * Minimal data telemetry chirp
   */
  public playTelemetryChirp() {
    const now = performance.now();
    if (now - this.lastChirpTime < 180) return;
    this.lastChirpTime = now;

    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Crisp subtle teletype frequency
      const freq = 1800 + Math.random() * 600;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio safety
    }
  }

  /**
   * Target Acquired Ping (4.0s - 4.5s)
   */
  public playTargetAcquiredPing() {
    if (this.hasPlayedAcquiredPing) return;
    this.hasPlayedAcquiredPing = true;

    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, this.ctx.currentTime); // C6
      osc.frequency.setValueAtTime(1318.5, this.ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {
      // Audio safety
    }
  }

  /**
   * Subtle acoustic blip when cursor hovers over interactive Mars
   */
  public playHoverBlip() {
    const now = performance.now();
    if (now - this.lastChirpTime < 120) return;
    this.lastChirpTime = now;

    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // Audio safety
    }
  }

  /**
   * Resonant deep space contact chime when Mars is clicked
   */
  public playMarsClickSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Sub boom + high harmonic chime
      const oscLow = this.ctx.createOscillator();
      const oscHigh = this.ctx.createOscillator();
      const gainLow = this.ctx.createGain();
      const gainHigh = this.ctx.createGain();

      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(96, now);
      oscLow.frequency.exponentialRampToValueAtTime(48, now + 0.4);
      gainLow.gain.setValueAtTime(0.25, now);
      gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      oscHigh.type = 'triangle';
      oscHigh.frequency.setValueAtTime(880, now);
      oscHigh.frequency.setValueAtTime(1320, now + 0.06);
      gainHigh.gain.setValueAtTime(0.08, now);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      oscLow.connect(gainLow);
      gainLow.connect(this.masterGain);
      oscHigh.connect(gainHigh);
      gainHigh.connect(this.masterGain);

      oscLow.start(now);
      oscLow.stop(now + 0.5);
      oscHigh.start(now);
      oscHigh.stop(now + 0.4);
    } catch {
      // Audio safety
    }
  }

  /**
   * Target Selection Confirmation Tone
   */
  public playTargetSelectTone() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const frequencies = [784.0, 1046.5, 1567.98]; // G5 -> C6 -> G6
      frequencies.forEach((f, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.32);
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * Precision Lock & Confirmation Chime (6.0s - 6.5s)
   */
  public playTargetLockChime() {
    if (this.hasPlayedLockChime) return;
    this.hasPlayedLockChime = true;

    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Dual harmonic resonant chime (clean NASA scientific lock confirmation)
      [1567.98, 2093.00].forEach((freq, index) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        gain.gain.setValueAtTime(0.12, now + index * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.55);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.6);
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * Quindar/Comms chime for story waypoint advance
   */
  public playWaypointAdvance() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2524, now); // Classic NASA Quindar intro tone frequency

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio safety
    }
  }

  /**
   * Optional browser speech synthesis for automated documentary narration
   */
  public speakNarrative(text: string, enabled: boolean = true) {
    if (!enabled || this.isMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.02;
        utterance.pitch = 0.95;
        // Attempt to find English voice
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
        if (enVoice) {
          utterance.voice = enVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis optional
      }
    }
  }

  public stopNarrative() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Speech safety
      }
    }
  }

  /**
   * Reset flags for replay
   */
  public resetTimelineFlags() {
    this.hasPlayedAcquiredPing = false;
    this.hasPlayedLockChime = false;
  }
}

export const soundManager = new SoundManager();
