import cluster from "../cluster/index";
const { Container, Text, Vector } = cluster;

class GameOver extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    const gameW = game.width;
    const gameH = game.height;

    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.input = input;

    this.titleText = new Text("Game Over", { fill: "black" });
    this.actionText = new Text("Press Start", { fill: "black" });

    this.titleText.position = new Vector(gameW / 2, gameH / 2 - 16);
    this.actionText.position = this.titleText.position.clone().add(new Vector(0, 24));

    this.add(this.titleText);
    this.add(this.actionText);
  }

  update(dt, t) {
    super.update(dt, t);
    const { key } = this.input;
    if (key.action) {
      key.reset();
      this.onExit();
    }
  }
}

export default GameOver;
