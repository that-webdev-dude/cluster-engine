import Screen from "./Screen";
import cluster from "../cluster";
import Background from "../entities/Background";
import backgroundImageURL from "../images/background.png";

const { Text, Vector, Texture, Timer, math } = cluster;

class GameOver extends Screen {
  constructor(game, input, globals = {}, transitions = {}) {
    super(game, input, globals, transitions);

    // background
    this.add(
      new Background({
        texture: new Texture(backgroundImageURL),
        displayW: game.width,
        displayH: game.height,
        velocity: new Vector(-100, 0),
      })
    );

    // gameOver text
    this.gameOverText = this.add(
      new Text("GAME OVER", {
        fill: "RED",
        font: '48px "Press Start 2P"',
      })
    );
    this.gameOverText.alpha = 0;
    this.gameOverText.position = new Vector(
      game.width / 2,
      game.height / 2 - 96
    );
    this.add(
      new Timer(
        1,
        (p) => {
          this.gameOverText.alpha = p;
        },
        () => {},
        0.125
      )
    );

    // press start text
    this.pressStartText = this.add(
      new Text("Press Start", {
        fill: "red",
        font: '16px "Press Start 2P"',
      })
    );
    this.pressStartText.alpha = 0;
    this.pressStartText.position = new Vector(
      game.width / 2,
      game.height / 2 - 24
    );
    this.add(
      new Timer(
        1,
        (p) => {
          this.pressStartText.alpha = p;
        },
        () => {},
        0.125
      )
    );
  }

  update(dt, t) {
    super.update(dt, t);
    if (this.input.keys.action) {
      this.transitions.onPlay();
    }
  }
}

export default GameOver;
