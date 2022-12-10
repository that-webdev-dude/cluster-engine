import soundThemeURL from "../sounds/theme.mp3";
import soundPlopURL from "../sounds/plop.mp3";
import cluster from "../cluster/index";
const { Container, Sound, SoundPool, Text } = cluster;

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

    // theme sound
    this.soundTheme = new Sound(soundThemeURL);
    if (!this.soundTheme.playing) {
      this.soundTheme.play({ loop: true, volume: 0.1 });
    }

    // plop sound
    this.soundPlops = new SoundPool(soundPlopURL, {}, 3);
    this.soundRate = 0.3;
    this.soundNext = this.soundRate;

    // populate scene
    this.add(textTitle);
    this.add(textAction);
  }

  update(dt, t) {
    super.update(dt, t);

    // exit the gameplay on action
    // if (this.input.key.action) {
    //   this.soundTheme.stop();
    //   this.onExit();
    // }

    // play polyphonic sound
    if (t > this.soundNext) {
      this.soundNext = t + this.soundRate;
      this.soundPlops.play();
    }

    this.input.mouse.update();
  }
}

export default GameTitle;
