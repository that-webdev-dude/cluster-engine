import Screen from "./Screen";
import cluster from "../cluster";
const { Rect, Vector, Text, Timer } = cluster;

class GameOver extends Screen {
  constructor(game, input, globals, transitions) {
    super(game, input, globals, transitions);

    // background
    const background = this.add(
      new Rect({
        width: game.width,
        height: game.height,
        style: { fill: "green" },
      })
    );

    // game over text
    const gameOverText = this.add(
      new Text("GAME OVER", {
        fill: "white",
        font: '48px "Press Start 2P"',
      })
    );

    // press space text
    const pressSpaceText = this.add(
      new Text("press space", {
        fill: "white",
        font: '16px "Press Start 2P"',
      })
    );

    this.background = background;
    this.gameOverText = gameOverText;
    this.pressSpaceText = pressSpaceText;

    this.initialize();
  }

  initialize() {
    const { gameOverText, pressSpaceText, game } = this;
    gameOverText.position = new Vector(
      game.view.width / 2,
      game.view.height / 2 - 48
    );

    pressSpaceText.position = new Vector(
      game.view.width / 2,
      game.view.height / 2 + 32
    );
  }

  update(dt, t) {
    super.update(dt, t);
    // this actually starts a new game
    if (this.input.key.action) {
      this.transitions.onExit();
    }
  }
}

export default GameOver;
