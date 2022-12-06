class Sound {
  constructor(src, options = {}) {
    this.src = src;
    this.options = Object.assign({ volume: 1 }, options);

    // ... config audio element
    this.audio = new Audio();
    this.audio.src = src;
    this.audio.addEventListener(
      "error",
      () => {
        throw new Error(`Error loading audio asset from src ${src}`);
      },
      false
    );
  }

  play(overrides = {}) {
    const { audio, options } = this;
    const opts = Object.assign({ time: 0 }, options, overrides);
    audio.volume = opts.volume;
    audio.time = opts.time;
    audio.play();
  }

  stop() {
    const { audio } = this;
    audio.pause();
  }
}

export default Sound;
