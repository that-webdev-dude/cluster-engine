import soundThemeURL from "../sounds/theme.mp3";
import soundSquawk1URL from "../sounds/squawk1.mp3";
import soundSquawk2URL from "../sounds/squawk2.mp3";
import soundSquawk3URL from "../sounds/squawk3.mp3";
import soundSquawk4URL from "../sounds/squawk4.mp3";
import soundSquawk5URL from "../sounds/squawk5.mp3";
import soundPlopURL from "../sounds/plop.mp3";

import cluster from "../cluster/index";
const { Container, Text, Sound, SoundPool, SoundGroup } = cluster;

class GameTitle extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.game = game;
    this.input = input;
    this.onExit = transitions?.onExit || function () {};
    this.onEnter = transitions?.onEnter || function () {};
    this.updates = 0;

    // text title
    const textTitle = new Text("SOUNDBALL", { fill: "red", font: "32px 'Press Start 2p'" });
    const textTitleX = this.game.width / 2;
    const textTitleH = this.game.height / 2 - 64;
    textTitle.position = { x: textTitleX, y: textTitleH };

    // text action
    const textAction = new Text("press start", { fill: "red", font: "16px 'Press Start 2p'" });
    const textActionX = this.game.width / 2;
    const textActionH = this.game.height / 2;
    textAction.position = { x: textActionX, y: textActionH };

    // theme sound in loop
    // this.soundTheme = new Sound(soundThemeURL);
    // if (!this.soundTheme.playing) {
    //   this.soundTheme.play({ loop: true, volume: 0.1 });
    // }

    // plop sound as a pool
    // this.soundPlops = new SoundPool(soundPlopURL, {}, 3);
    // this.soundRate = 0.3;
    // this.soundNext = this.soundRate;

    // some sound as a group played randomly
    this.soundSquawks = new SoundGroup([
      new Sound(soundSquawk1URL),
      new Sound(soundSquawk2URL),
      new Sound(soundSquawk3URL),
      new Sound(soundSquawk4URL),
      new Sound(soundSquawk5URL),
    ]);
    this.soundRate = 0.5;
    this.soundNext = this.soundRate;

    // populate scene
    this.add(textTitle);
    this.add(textAction);
  }

  update(dt, t) {
    super.update(dt, t);

    // play polyphonic sound
    if (t > this.soundNext) {
      this.soundNext = t + this.soundRate;
      // this.soundSquawks.play();
    }

    this.input.mouse.update();
  }
}

export default GameTitle;
