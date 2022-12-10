class Sound {
  constructor(src, options = {}) {
    this.src = src;
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
    const { audio, options } = this;
    const opts = Object.assign(options, overrides);
    audio.volume = opts.volume;
    audio.time = opts.time;
    audio.loop = opts.loop;
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
