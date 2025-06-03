export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.unlocked = false;

    this.sounds = {
      eat: this.createBeep(440, 0.1),
      accelerate: this.createBeep(880, 0.1),
      levelUp: this.createBeep(660, 0.1),
      gameOver: this.createBeep(120, 0.5),
    };
  }

  unlockAudioContext() {
    if (!this.unlocked) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
      this.masterGain.gain.value = 0.2;
      this.unlocked = true;
    }
  }

  createBeep(frequency, duration) {
    return () => {
      this.unlockAudioContext();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    };
  }

  play(name) {
    if (this.sounds[name]) {
      this.sounds[name]();
    }
  }

  resumeContext() {
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }
}
