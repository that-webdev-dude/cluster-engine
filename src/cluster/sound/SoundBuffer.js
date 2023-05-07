import Assets from "../core/Assets";
import Audio from "./Audio";

class SoundBuffer {
  constructor(url, options = {}) {
    this.url = url;
    this.audio = Assets.soundBuffer(url, Audio.context);
    this.options = Object.assign(
      {
        output: Audio.master,
        volume: 1,
        time: 0,
        speed: 1,
        delay: 0,
        filter: null,
      },
      options
    );
    this.playing = false;
  }

  play(overrides = {}) {
    // if (!this.playing) {
    const { audio, options } = this;
    const opts = Object.assign(options, overrides);
    const now = Audio.context.currentTime;
    audio.then((buffer) => {
      const source = Audio.context.createBufferSource();
      source.buffer = buffer;
      source.volume = opts.volume;
      source.playbackRate.value = opts.speed;
      source.onended = () => {
        this.playing = false;
      };

      if (opts.filter) {
        const { filter } = opts;
        source.connect(filter);
        filter.connect(opts.output);
      } else {
        source.connect(opts.output);
      }

      source.start(now + opts.delay);
      this.playing = true;
    });
    // }
  }
}

export default SoundBuffer;

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
