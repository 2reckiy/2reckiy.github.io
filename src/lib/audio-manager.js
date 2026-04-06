export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.unlocked = false;
    this.closed = false;
    this.musicVolume = 0.3;

    this.sounds = {
      eat: this.createBeep(440, 0.1),
      accelerate: this.createBeep(880, 0.1),
      levelUp: this.createBeep(660, 0.1),
      miss: this.createBeep(220, 0.25),
      catch: this.createBeep(440, 0.1),
      gameOver: this.createBeep(120, 0.5),
    };
  }

  unlockAudioContext() {
    if (!this.unlocked || this.closed) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
      this.masterGain.gain.value = 0.2;
      this.unlocked = true;
      this.closed = false;
    }
  }

  createBeep(frequency, duration) {
    return () => {
      this.unlockAudioContext();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "square";
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
      this.unlockAudioContext();

      this.sounds[name]();
    }
  }

  async playMusic(url = "/music/bg0.mp3", loop = true) {
    if (this.muted) return;

    this.unlockAudioContext();

    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource.disconnect();
      this.musicSource = null;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await this.audioCtx.decodeAudioData(arrayBuffer);

      this.musicSource = this.audioCtx.createBufferSource();
      this.musicSource.buffer = buffer;
      this.musicSource.loop = loop;

      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.audioCtx.destination);

      this.musicSource.connect(this.musicGain);
      this.musicSource.start();
    } catch (err) {
      console.warn("Music failed:", err.message);
    }
  }

  async playSound(url = "/music/bg0.mp3", loop = true) {
    if (this.muted) return;

    this.unlockAudioContext();

    // if (this.musicSource) {
    //   this.musicSource.stop();
    //   this.musicSource.disconnect();
    //   this.musicSource = null;
    // }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await this.audioCtx.decodeAudioData(arrayBuffer);

      this.souundSource = this.audioCtx.createBufferSource();
      this.souundSource.buffer = buffer;
      this.souundSource.loop = loop;

      this.souundGain = this.audioCtx.createGain();
      this.souundGain.gain.value = this.musicVolume;
      this.souundGain.connect(this.audioCtx.destination);

      this.souundSource.connect(this.souundGain);
      this.souundSource.start();
    } catch (err) {
      console.warn("Sound failed:", err.message);
    }
  }

  resumeContext() {
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  close() {
    this.audioCtx?.close();
    this.closed = true;
  }
}
