class Sound {
  constructor(src, options = {}) {
    this.src = src;
    this.options = Object.assign({ volume: 1 }, options);
    this.playing = false;

    // config audio element
    this.audio = new Audio();
    this.audio.src = src;

    // audio element listeners
    this.audio.addEventListener(
      "error",
      () => {
        throw new Error(`Error loading audio asset from src ${src}`);
      },
      false
    );
    this.audio.addEventListener(
      "ended",
      () => {
        console.log(this.playing);
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
    const { audio, options } = this;
    const opts = Object.assign({ time: 0 }, options, overrides);
    audio.volume = opts.volume;
    audio.time = opts.time;
    audio.play();
    this.playing = true;
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
