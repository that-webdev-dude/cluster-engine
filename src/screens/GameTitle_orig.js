import Screen from "./Screen";
import cluster from "../cluster";

const { Text, Vector, Timer, Rect, math } = cluster;

class GameTitle extends Screen {
  constructor(game, input, globals = {}, transitions = {}) {
    super(game, input, globals, transitions);

    // background
    this.add(
      new Rect({
        height: game.height,
        width: game.width,
        style: { fill: "black" },
      })
    );

    // title text
    this.titleText = this.add(
      new Text(game.title, {
        fill: "white",
        font: '40px "Press Start 2P"',
      })
    );
    this.titleText.position = new Vector(game.width / 2, -100);
    this.add(
      new Timer(1, (p) => {
        this.titleText.position.y = 320 * math.ease.elasticOut(p) - 96;
      })
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

    // footer text
    this.footerText = this.add(
      new Text("CGames", {
        fill: "white",
        font: '12px "Press Start 2P"',
      })
    );
    this.footerText.alpha = 0.5;
    this.footerText.position = new Vector(game.width / 2, game.height - 32);
  }

  update(dt, t) {
    super.update(dt, t);
    this.pressStartText.alpha = Math.sin(t / 0.25) * 0.5 + 0.5;
    if (this.input.keys.action) {
      this.transitions.onPlay();
    }
  }
}

export default GameTitle;
