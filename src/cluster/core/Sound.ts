import Assets from "./Assets";

/**
 * AUDIO OBJECT
 * TODO
 * extend this to have two separate channels sfx channel music channel both connected to a master channel to control all the relevant sfx & music sounds independently and globally
 */
class Audio {
  private static _hasWebAudio = !!window.AudioContext;
  private static _context: AudioContext;
  private static _master: GainNode;

  private static _getContext(): AudioContext {
    if (!Audio._context && Audio._hasWebAudio) {
      Audio._context = new AudioContext();
      Audio._master = Audio._context.createGain();
      Audio._master.gain.value = 1;
      Audio._master.connect(Audio._context.destination);
    }
    return Audio._context;
  }

  public static get context(): AudioContext {
    return Audio._getContext();
  }

  public static get master(): GainNode {
    if (!Audio._context && Audio._hasWebAudio) {
      Audio._context = Audio._getContext();
    }
    return Audio._master;
  }
}

type SoundConfig = {
  volume?: number;
  delay?: number;
  speed?: number;
  loop?: boolean;
  time?: number;
  filter?: BiquadFilterConfig;
};

type BiquadFilterConfig = {
  type: BiquadFilterType;
  frequency: number;
  gain: number;
  Q: number;
};

const SOUND_DEFAULTS = {
  volume: 1,
  delay: 0,
  speed: 1,
  loop: false,
  time: 0,
  // filter: {},
};

export class Sound {
  private _buffer: AudioBuffer | null = null;
  private _sourceNode: AudioBufferSourceNode | null = null;
  private _filterNode: BiquadFilterNode | null = null;
  private _gainNode: GainNode | null = null;
  private _playing: boolean = false;
  private _options: SoundConfig;

  constructor(url: string, config?: SoundConfig) {
    const options = {
      ...SOUND_DEFAULTS,
      ...config,
    };
    this._options = options;
    this._load(url);

    this._gainNode = Audio.context.createGain();
    this._gainNode.gain.value = options.volume;
    this._gainNode.connect(Audio.master);
  }

  private async _load(url: string) {
    this._buffer = await Assets.soundBuffer(url, Audio.context);
  }

  get playing() {
    return this._playing;
  }

  set volume(value: number) {
    if (this._gainNode) {
      this._gainNode.gain.value = value;
    }
  }

  public play(overrides?: SoundConfig) {
    const options = {
      ...this._options,
      ...overrides,
    };

    this._sourceNode = Audio.context.createBufferSource();
    this._sourceNode.buffer = this._buffer;
    this._sourceNode.loop = options.loop || false;
    this._sourceNode.playbackRate.value = options.speed || 1;
    this._sourceNode.onended = () => {
      this._sourceNode = null;
      this._playing = false;
    };

    if (!this._gainNode) {
      this._gainNode = Audio.context.createGain();
      this._gainNode.connect(Audio.master);
    }
    this._gainNode.gain.value = options.volume || 1;
    this._sourceNode.connect(this._gainNode);

    if (options.filter) {
      this._filterNode = Audio.context.createBiquadFilter();
      this._filterNode.type = options.filter.type;
      this._filterNode.frequency.value = options.filter.frequency;
      this._filterNode.gain.value = options.filter.gain;
      this._filterNode.Q.value = options.filter.Q;
      this._sourceNode.connect(this._filterNode);
      this._filterNode.connect(this._gainNode);
    } else {
      this._sourceNode.connect(this._gainNode);
    }

    this._sourceNode.start();
    this._playing = true;
  }

  public stop() {
    if (!this._sourceNode) return;
    this._sourceNode.stop();
    this._sourceNode = null;
  }
}

/**
 * example of an highpass filter
 * -----------------------------
 */
// function highpassFilter(context) {
//   // https://webaudio.github.io/web-audio-api/#enumdef-biquadfiltertype
//   const filter = context.createBiquadFilter();
//   filter.type = "highpass";
//   filter.frequency.value = 2660;
//   filter.Q.value = 25;
//   return filter;
// }
// const highpass = highpassFilter(Audio.context);

/**
 * example of an oscillator
 * ------------------------
 */
// const { context, master } = Audio;
// const bpm = 60 / 250;
// const note = 25;
// const playNote = (note, startTime, length) => {
//   const oscillator = context.createOscillator();
//   oscillator.type = "sawtooth";
//   oscillator.frequency.value = note;
//   oscillator.connect(master);
//   oscillator.start(startTime);
//   oscillator.stop(startTime + length);
// };
// playNote(note, 0, 1);

/**
 * example of fadeIn function
 * --------------------------
 */
// function fade(to, length) {
//   const now = context.currentTime;
//   master.gain.setValueAtTime(master.gain.value, now);
//   master.gain.linearRampToValueAtTime(to, now + length);
// }

// master.gain.value = 0;
// fade(1, 1);
