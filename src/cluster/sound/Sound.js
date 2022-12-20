import Assets from "../core/Assets";

class Sound {
  constructor(url, options = {}) {
    this.url = url;
    this.options = Object.assign(
      {
        volume: 1,
        time: 0,
        loop: false,
      },
      options
    );
    this.playing = false;

    // config audio element
    this.audio = Assets.sound(url);

    // audio element listeners
    this.audio.addEventListener(
      "error",
      () => {
        throw new Error(`Error loading audio asset from url ${url}`);
      },
      false
    );
    this.audio.addEventListener(
      "ended",
      () => {
        this.playing = false;
      },
      false
    );
  }

  /**
   * @getter volume
   */
  get volume() {
    return this.audio.volume;
  }

  /**
   * @setter volume
   */
  set volume(volume) {
    this.options.volume = volume;
    this.audio.volume = volume;
  }

  /**
   * play
   * @param {*} overrides
   * @return void
   */
  play(overrides = {}) {
    if (!this.playing) {
      const { audio, options } = this;
      const opts = Object.assign(options, overrides);
      audio.volume = opts.volume;
      audio.time = opts.time;
      audio.loop = opts.loop;
      audio.play();
      this.playing = true;
    }
  }

  /**
   * stop
   * @return void
   */
  stop() {
    const { audio } = this;
    audio.pause();
    this.playing = false;
  }
}

export default Sound;
