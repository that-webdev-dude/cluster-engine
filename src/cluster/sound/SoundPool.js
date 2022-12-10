import Sound from "./Sound";

class SoundPool {
  constructor(src, options = {}, poolSize = 3) {
    this.count = 0;
    this.sounds = [...Array(poolSize)].map(() => {
      return new Sound(src);
    });
  }

  play(overrides = {}) {
    const { sounds } = this;
    const index = this.count++ % sounds.length;
    sounds[index].play(overrides);
  }

  stop() {
    const { sounds } = this;
    sounds.forEach((sound) => sound.stop());
  }
}

export default SoundPool;
