import math from "../utils/math";

class SoundGroup {
  constructor(sounds = []) {
    this.sounds = sounds;
  }

  play(options) {
    const { sounds } = this;
    math.randOneFrom(sounds).play(options);
  }

  stop() {
    const { sounds } = this;
    sounds.forEach((sound) => sound.stop());
  }
}

export default SoundGroup;
