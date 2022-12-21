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
        delay: 1,
        filter: null,
      },
      options
    );
    this.playing = false;
  }

  play(overrides = {}) {
    if (!this.playing) {
      const { audio, options } = this;
      const opts = Object.assign(options, overrides);
      audio.then((buffer) => {
        const source = Audio.context.createBufferSource();
        source.buffer = buffer;
        source.volume = opts.volume;
        source.playbackRate.value = opts.speed;
        if (opts.filter) {
          const { filter } = opts;
          source.connect(filter);
          filter.connect(opts.output);
        } else {
          source.connect(opts.output);
        }
        source.onended = () => {
          this.playing = false;
        };

        source.start(Audio.context.currentTime + opts.delay);
        // source.start(0, opts.time);
        this.playing = true;
      });
    }
  }
}

export default SoundBuffer;
