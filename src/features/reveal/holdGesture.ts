/**
 * Hold Gesture Controller
 *
 * Handles pointer events (mouse, touch, pen) and keyboard holding.
 * Uses requestAnimationFrame for fluid 60fps gauge tracking and smooth decay.
 * Includes Web Audio API procedural sound effects ("퐁!" pop sound) and haptic feedback.
 */

export interface HoldGestureOptions {
  targetElement: HTMLElement;
  durationMs?: number;
  decayDurationMs?: number;
  onStart?: () => void;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

export class HoldGesture {
  private target: HTMLElement;
  private duration: number;
  private decayDuration: number;
  private onStart?: () => void;
  private onProgress?: (progress: number) => void;
  private onComplete?: () => void;
  private onCancel?: () => void;

  private isPressing: boolean = false;
  private isCompleted: boolean = false;
  private progress: number = 0; // 0.0 ~ 1.0
  private lastTime: number = 0;
  private rafId: number | null = null;
  private pointerId: number | null = null;

  // Haptics tracking
  private lastVibeStep: number = 0;

  // Audio synthesis
  private audioCtx: AudioContext | null = null;
  private chargeOscillator: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;

  constructor(options: HoldGestureOptions) {
    this.target = options.targetElement;
    this.duration = options.durationMs ?? 1600; // 1.6s to fill
    this.decayDuration = options.decayDurationMs ?? 600; // 0.6s to decay
    this.onStart = options.onStart;
    this.onProgress = options.onProgress;
    this.onComplete = options.onComplete;
    this.onCancel = options.onCancel;

    this.bindEvents();
  }

  private initAudio(): void {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private startChargeSound(): void {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
      // Frequency ramps up smoothly as gauge charges
      osc.frequency.exponentialRampToValueAtTime(420, this.audioCtx.currentTime + (this.duration / 1000));

      gain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      this.chargeOscillator = osc;
      this.chargeGain = gain;
    } catch {
      // Audio context might fail on restricted environments; fail silently
    }
  }

  private stopChargeSound(): void {
    try {
      if (this.chargeGain && this.audioCtx) {
        this.chargeGain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.1);
      }
      setTimeout(() => {
        if (this.chargeOscillator) {
          try {
            this.chargeOscillator.stop();
            this.chargeOscillator.disconnect();
          } catch {
            // Already stopped
          }
          this.chargeOscillator = null;
        }
      }, 100);
    } catch {
      // Fail silently
    }
  }

  public playBurstSound(): void {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // 1. "Pong!" bubble pop effect
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.22);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.26);

      // 2. Sweet celebratory chime (SeoulTech cheerful chord: F5, A5, C6)
      const freqs = [698.46, 880.0, 1046.5];
      freqs.forEach((freq, idx) => {
        const chimeOsc = this.audioCtx!.createOscillator();
        const chimeGain = this.audioCtx!.createGain();
        chimeOsc.type = 'triangle';
        chimeOsc.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.06);

        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.setValueAtTime(0.12, now + 0.08 + idx * 0.06);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.06);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.audioCtx!.destination);
        chimeOsc.start(now + 0.08 + idx * 0.06);
        chimeOsc.stop(now + 0.9 + idx * 0.06);
      });
    } catch {
      // Ignore audio failure
    }
  }

  private triggerHaptic(level: 'step' | 'complete'): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (level === 'step') {
          navigator.vibrate(20);
        } else if (level === 'complete') {
          navigator.vibrate([40, 60, 120]);
        }
      } catch {
        // Haptic feedback not permitted
      }
    }
  }

  private bindEvents(): void {
    const el = this.target;

    // Pointer Events
    el.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);

    // Keyboard support for accessibility (Space or Enter key)
    el.addEventListener('keydown', this.handleKeyDown);
    el.addEventListener('keyup', this.handleKeyUp);
  }

  public destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.stopChargeSound();

    const el = this.target;
    el.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    el.removeEventListener('keydown', this.handleKeyDown);
    el.removeEventListener('keyup', this.handleKeyUp);
  }

  private handlePointerDown = (e: PointerEvent): void => {
    if (this.isCompleted) return;
    if (e.button !== 0) return; // Only primary button
    this.pointerId = e.pointerId;
    try {
      this.target.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
    this.startPress();
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (this.pointerId !== null && e.pointerId === this.pointerId) {
      this.pointerId = null;
      this.stopPress();
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.isCompleted) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      if (!this.isPressing && !e.repeat) {
        e.preventDefault();
        this.startPress();
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'Enter') {
      if (this.isPressing) {
        e.preventDefault();
        this.stopPress();
      }
    }
  };

  private startPress(): void {
    if (this.isCompleted || this.isPressing) return;
    this.isPressing = true;
    this.lastTime = performance.now();
    this.lastVibeStep = Math.floor(this.progress * 4);

    this.startChargeSound();
    this.onStart?.();

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  private stopPress(): void {
    if (!this.isPressing) return;
    this.isPressing = false;
    this.stopChargeSound();

    if (!this.isCompleted) {
      this.onCancel?.();
    }

    this.lastTime = performance.now();
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  private tick = (currentTime: number): void => {
    const dt = Math.min(currentTime - this.lastTime, 100);
    this.lastTime = currentTime;

    if (this.isPressing && !this.isCompleted) {
      // Progress charging
      this.progress += dt / this.duration;

      // Haptic steps at 25%, 50%, 75%
      const step = Math.floor(this.progress * 4);
      if (step > this.lastVibeStep && step < 4) {
        this.lastVibeStep = step;
        this.triggerHaptic('step');
      }

      if (this.progress >= 1.0) {
        this.progress = 1.0;
        this.isCompleted = true;
        this.isPressing = false;
        this.stopChargeSound();
        this.triggerHaptic('complete');
        this.playBurstSound();

        this.onProgress?.(1.0);
        this.onComplete?.();
        this.rafId = null;
        return;
      }
    } else if (!this.isPressing && !this.isCompleted) {
      // Progress decaying smoothly
      if (this.progress > 0) {
        this.progress -= dt / this.decayDuration;
        if (this.progress <= 0) {
          this.progress = 0;
          this.rafId = null;
          this.onProgress?.(0);
          return;
        }
      } else {
        this.progress = 0;
        this.rafId = null;
        this.onProgress?.(0);
        return;
      }
    }

    this.onProgress?.(this.progress);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
