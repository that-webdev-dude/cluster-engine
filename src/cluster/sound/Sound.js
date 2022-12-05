class Sound {
  constructor(src, options = {}) {
    this.src = src;
    this.options = Object.assign({ volume: 1 }, options);

    // config audio element
  }

  play() {}

  stop() {}
}

export default Sound;
