import sound1URL from "../sounds/sound1.mp3";
import sound2URL from "../sounds/sound2.mp3";
import sound3URL from "../sounds/sound3.mp3";
import sound4URL from "../sounds/sound4.mp3";
import sound5URL from "../sounds/sound5.mp3";

import cluster from "../cluster/index";
const { Container, Sound } = cluster;

class GameTitle extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.game = game;
    this.input = input;
    this.onExit = transitions?.onExit || function () {};
    this.onEnter = transitions?.onEnter || function () {};
    this.updates = 0;

    const s1 = new Sound(sound1URL);
    const s2 = new Sound(sound2URL);
    const s3 = new Sound(sound3URL);
    const s4 = new Sound(sound4URL);
    const s5 = new Sound(sound5URL);
  }

  update(dt, t) {
    super.update(dt, t);
    console.log("... game title");

    if (this.input.mouse.isPressed) {
      this.onExit();
    }

    this.input.mouse.update();
  }
}

export default GameTitle;
