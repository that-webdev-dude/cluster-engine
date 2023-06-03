import Screen from "./Screen";
import cluster from "../cluster";
const { Rect, Vector, Text, Timer } = cluster;

class GameTitle extends Screen {
  constructor(game, input, globals, transitions) {
    super(game, input, globals, transitions);

    // background
    const background = this.add(
      new Rect({
        width: game.width,
        height: game.height,
        style: { fill: "blue" },
      })
    );

    // press start text
    const pressStartText = this.add(
      new Text("Press Start", {
        fill: "white",
        font: '16px "Press Start 2P"',
      })
    );

    this.background = background;
    this.pressStartText = pressStartText;

    this.initialize();
  }

  initialize() {
    const { pressStartText, game } = this;
    pressStartText.position = new Vector(game.view.width / 2, game.view.height / 2);
    pressStartText.alpha = 0;
    this.add(
      new Timer(1, (p) => {
        pressStartText.alpha = p;
      })
    );
  }

  update(dt, t) {
    super.update(dt, t);
    // this actually starts a new game
    if (this.input.key.start) {
      this.transitions.onExit();
    }
  }
}

export default GameTitle;
