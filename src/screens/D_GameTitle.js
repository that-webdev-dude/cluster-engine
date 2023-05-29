import cluster from "../cluster/index";
const { Container, Sound, Rect, Text, Vector, Timer, math } = cluster;

class GameTitle extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();

    this.firstUpdate = true;
    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.input = input;
    this.game = game;

    this.onEnter();

    // black background
    const background = new Rect({
      width: game.view.width,
      height: game.view.height,
      style: { fill: "black" },
    });

    // red smupzTitleText
    const smupzTitleText = new Text("SHMUP-Z", {
      fill: "red",
      font: '48px "Press Start 2P"',
    });
    smupzTitleText.position = new Vector(game.view.width / 2, 0);
    this.add(
      new Timer(
        2,
        (p) => {
          smupzTitleText.position.y = 300 * math.ease.elasticOut(p, 3) - 24;
        },
        () => {},
        0
      )
    );

    // white pressStartText
    const pressStartText = new Text("Press Start", {
      fill: "white",
      font: '16px "Press Start 2P"',
    });
    pressStartText.position = new Vector(game.view.width / 2, game.view.height / 2 + 32);
    pressStartText.alpha = 0;
    this.add(
      new Timer(
        2,
        (p) => {
          pressStartText.alpha = p;
        },
        () => {},
        1
      )
    );

    this.background = this.add(background);
    this.smupzTitleText = this.add(smupzTitleText);
    this.pressStartText = this.add(pressStartText);
  }

  update(dt, t) {
    super.update(dt, t);

    if (this.input.key.start) {
      this.onExit();
    }

    if (this.firstUpdate) {
      this.firstUpdate = false;
    }
  }
}

export default GameTitle;
