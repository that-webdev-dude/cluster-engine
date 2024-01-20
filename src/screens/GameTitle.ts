import { Scene, Game, Vector, Text, Timer } from "../ares";
import Background from "../entities/Background";

class GameTitle extends Scene {
  private _timer: Timer;
  private _gameActionText: Text;

  constructor(
    game: Game,
    transitions: {
      toNext: () => void;
    }
  ) {
    const { width, height } = game;

    const background = new Background({
      width,
      height,
    });

    const gameTitleText = new Text({
      text: game.title,
      align: "center",
      fill: "white",
      font: '52px "Press Start 2P"',
      stroke: "red",
      lineWidth: 8,
      alpha: 0,
      position: new Vector(width / 2, height / 2 - 200),
    });

    const gameActionText = new Text({
      text: "Press Enter to Start",
      align: "center",
      fill: "white",
      font: '20px "Press Start 2P"',
      position: new Vector(width / 2, height / 2 + 150),
    });

    const gameFooterText = new Text({
      text: "@that.webdev.dude 2023",
      align: "center",
      fill: "white",
      alpha: 0.5,
      font: '10px "Press Start 2P"',
      position: new Vector(width / 2, height - 100),
    });

    super(game, transitions);
    this.add(background);
    this.add(gameTitleText);
    this.add(gameActionText);
    this.add(gameFooterText);

    this._gameActionText = gameActionText;
    this._timer = new Timer({
      duration: 1,
      onTick: (ratio: number) => {
        gameTitleText.alpha = ratio;
      },
    });
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
    this._gameActionText.alpha = Math.abs(Math.sin(t * 3));
    if (!this._timer.dead) {
      this._timer.update(dt);
    }

    if (this.game.keyboard.key("Enter")) {
      this.game.keyboard.active = false;
      this.transitions.toNext();
    }
  }
}

export default GameTitle;
