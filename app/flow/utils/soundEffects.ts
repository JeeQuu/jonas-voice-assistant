import { Category } from '../types';

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private convolver: ConvolverNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createReverb();
    }
  }

  private async createReverb() {
    if (!this.audioContext) return;

    // Create convolver for reverb
    this.convolver = this.audioContext.createConvolver();

    // Create impulse response for reverb
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2; // 2 second reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    this.convolver.buffer = impulse;
  }

  playHover(category: Category) {
    if (!this.audioContext || !this.convolver) return;

    // Different frequencies for each category
    const frequencies = {
      jobb: 440,    // A4
      familj: 523,  // C5
      hälsa: 587    // D5
    };

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();

    // Soft sine wave
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[category], this.audioContext.currentTime);

    // Very subtle volume
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    // Mix wet/dry for reverb
    wetGain.gain.value = 0.4;
    dryGain.gain.value = 0.6;

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(dryGain);
    gainNode.connect(this.convolver!);
    this.convolver!.connect(wetGain);

    wetGain.connect(this.audioContext.destination);
    dryGain.connect(this.audioContext.destination);

    // Play
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  playClick(category: Category) {
    if (!this.audioContext || !this.convolver) return;

    const frequencies = {
      jobb: 660,    // E5
      familj: 784,  // G5
      hälsa: 880    // A5
    };

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[category], this.audioContext.currentTime);

    // Quick pluck sound
    gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

    wetGain.gain.value = 0.5;

    oscillator.connect(gainNode);
    gainNode.connect(this.convolver!);
    this.convolver!.connect(wetGain);
    wetGain.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  playSwipe() {
    if (!this.audioContext || !this.convolver) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();

    oscillator.type = 'sine';

    // Sweep from low to high
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    wetGain.gain.value = 0.6;

    oscillator.connect(gainNode);
    gainNode.connect(this.convolver!);
    this.convolver!.connect(wetGain);
    wetGain.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }
}

export const soundEffects = new SoundEffects();
