import { Scene, Game, Vector, Text, Timer } from "../ares";
import Background from "../entities/Background";

class GameWin extends Scene {
  timer: Timer;
  gameActionText: Text;

  constructor(
    game: Game,
    transitions?: {
      toNext: () => void;
    }
  ) {
    super(game, transitions);
    const { width, height } = game;

    const background = new Background({ width, height });

    const gameWinText = new Text({
      text: "You Win!",
      align: "center",
      fill: "white",
      font: '52px "Press Start 2P"',
      stroke: "red",
      lineWidth: 8,
      alpha: 0,
      position: new Vector(width / 2, height / 2 - 200),
    });

    const gameActionText = new Text({
      text: "Press Enter to Main Menu",
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

    this.add(background);
    this.add(gameWinText);
    this.add(gameActionText);
    this.add(gameFooterText);

    this.gameActionText = gameActionText;
    this.timer = new Timer({
      duration: 1,
      onTick: (ratio: number) => {
        gameWinText.alpha = ratio;
      },
    });
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
    this.gameActionText.alpha = Math.abs(Math.sin(t * 3));
    if (!this.timer.dead) {
      this.timer.update(dt, t);
    }

    if (this.game.keyboard.key("Enter")) {
      this.game.keyboard.active = false;
      this.transitions.toNext();
    }

    console.log(this.game.keyboard.active);
  }
}

export default GameWin;
