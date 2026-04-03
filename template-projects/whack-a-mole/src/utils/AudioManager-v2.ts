type SoundMap = Record<string, string>;

interface IAudioManager {
  loadSounds(sounds: SoundMap): Promise<void>;
  play(name: string, volume?: number): Promise<void>;
  playBg(name: string, volume?: number): Promise<void>;
  pauseBg(): void;
  resumeBg(): void;
  stopBg(): void;
  muteBg(): void;
  unmuteBg(): void;
  unlock(): Promise<void>;
}

// ─────────────── Electron / Web Audio ───────────────
class ElectronAudioManager implements IAudioManager {
  private static instance: ElectronAudioManager;
  private ctx: AudioContext;
  private buffers: Map<string, AudioBuffer> = new Map();

  private bgSource: AudioBufferSourceNode | null = null;
  private bgGain: GainNode | null = null;
  private bgBuffer: AudioBuffer | null = null;
  private bgStartTime = 0;
  private bgOffset = 0;
  private bgVolume = 0.5;

  private constructor() {
    this.ctx = new AudioContext();
  }

  static getInstance() {
    if (!ElectronAudioManager.instance) {
      ElectronAudioManager.instance = new ElectronAudioManager();
    }
    return ElectronAudioManager.instance;
  }

  private async ensureCtxRunning() {
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  async loadSounds(sounds: SoundMap) {
    await Promise.all(
      Object.entries(sounds).map(([key, url]) =>
        new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = async () => {
            try {
              const buffer = await this.ctx.decodeAudioData(xhr.response);
              this.buffers.set(key, buffer);
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          xhr.onerror = reject;
          xhr.send();
        })
      )
    );
  }

  async play(name: string, volume = 0.5) {
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    await this.ensureCtxRunning();

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(0);
  }

  async playBg(name: string, volume = 0.5) {
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    await this.ensureCtxRunning();

    this.bgBuffer = buffer;
    this.bgVolume = volume;

    if (this.bgSource) {
      this.bgSource.stop();
      this.bgSource.disconnect();
    }

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(0, this.bgOffset);

    this.bgSource = source;
    this.bgGain = gain;
    this.bgStartTime = this.ctx.currentTime;
  }

  pauseBg() {
    if (!this.bgSource || !this.bgBuffer) return;
    const elapsed = this.ctx.currentTime - this.bgStartTime;
    this.bgOffset = (this.bgOffset + elapsed) % this.bgBuffer.duration;
    this.bgSource.stop();
    this.bgSource.disconnect();
    this.bgSource = null;
  }

  resumeBg() {
    if (!this.bgBuffer) return;
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = this.bgBuffer;
    source.loop = true;
    gain.gain.value = this.bgVolume;
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(0, this.bgOffset);
    this.bgSource = source;
    this.bgGain = gain;
    this.bgStartTime = this.ctx.currentTime;
  }

  stopBg() {
    if (this.bgSource) {
      this.bgSource.stop();
      this.bgSource.disconnect();
    }
    this.bgSource = null;
    this.bgOffset = 0;
  }

  muteBg() { if (this.bgGain) this.bgGain.gain.value = 0; }
  unmuteBg() { if (this.bgGain) this.bgGain.gain.value = this.bgVolume; }
  async unlock() { await this.ensureCtxRunning(); }
}

// ─────────────── Browser / HTMLAudioElement ───────────────
class BrowserAudioManager implements IAudioManager {
  private static instance: BrowserAudioManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private bgAudio: HTMLAudioElement | null = null;

  private constructor() {}

  static getInstance() {
    if (!BrowserAudioManager.instance) {
      BrowserAudioManager.instance = new BrowserAudioManager();
    }
    return BrowserAudioManager.instance;
  }

  async loadSounds(sounds: SoundMap) {
    await Promise.all(
      Object.entries(sounds).map(([key, url]) =>
        new Promise<void>(resolve => {
          const audio = new Audio(url);
          audio.preload = "auto";
          audio.oncanplaythrough = () => resolve();
          this.sounds.set(key, audio);
        })
      )
    );
  }

  async play(name: string, volume = 0.5) {
    const audio = this.sounds.get(name);
    if (!audio) return;
    const clone = audio.cloneNode(true) as HTMLAudioElement;
    clone.volume = volume;
    await clone.play().catch(() => {});
  }

  async playBg(name: string, volume = 0.5) {
    const audio = this.sounds.get(name);
    if (!audio) return;
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
    }
    this.bgAudio = audio;
    audio.loop = true;
    audio.volume = volume;
    await audio.play().catch(() => {});
  }

  pauseBg() { if (this.bgAudio) this.bgAudio.pause(); }
  resumeBg() { if (this.bgAudio) this.bgAudio.play().catch(() => {}); }
  stopBg() { if (this.bgAudio) { this.bgAudio.pause(); this.bgAudio.currentTime = 0; } }
  muteBg() { if (this.bgAudio) this.bgAudio.volume = 0; }
  unmuteBg() { if (this.bgAudio) this.bgAudio.volume = 0.5; }
  async unlock() { /* no-op */ }
}

// ─────────────── Factory ───────────────
const AudioManager: IAudioManager = (() => {
  if (window.location.protocol === "preview-project:") {
    return ElectronAudioManager.getInstance();
  } else {
    return BrowserAudioManager.getInstance();
  }
})();

export default AudioManager;