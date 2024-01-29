import { GAME_CONFIG } from "../config/GameConfig";
import { GAME_GLOBALS } from "../globals/GameGlobals";
import { Scene, Game, Vector, Text, Timer, Rect, Container } from "../ares";

// GUI components into a separate layer
const { width, height, title, author, year, fontStyle } = GAME_CONFIG;
class GUI extends Container {
  private _background = new Rect({
    height: height,
    width: width,
    fill: "lightGrey",
  });
  private _gameTitleText = new Text({
    text: title,
    align: "center",
    fill: "black",
    stroke: "white",
    lineWidth: 8,
    font: `52px ${fontStyle}`,
    alpha: 0,
    position: new Vector(width / 2, height / 2 - 104),
  });
  private _gameActionText = new Text({
    text: "NEW GAME",
    align: "center",
    fill: "black",
    font: `20px ${fontStyle}`,
    position: new Vector(width / 2, height / 2),
  });
  private _gameFooterText = new Text({
    text: `@${author} ${year}`,
    align: "center",
    fill: "grey",
    alpha: 0.5,
    font: `12px ${fontStyle}`,
    position: new Vector(width / 2, height - 32),
  });
  private _timer: Timer = new Timer({
    duration: 3,
    delay: 0.5,
    onTick: (ratio: number) => {
      this._gameTitleText.alpha = ratio;
    },
  });

  constructor() {
    super();
    this.add(this._background);
    this.add(this._gameTitleText);
    this.add(this._gameActionText);
    this.add(this._gameFooterText);
  }

  private _updateGameTitleText(dt: number, t: number): void {
    if (!this._timer.dead) {
      this._timer.update(dt);
    }
  }

  private _updateGameActionText(dt: number, t: number): void {
    this._gameActionText.alpha = Math.abs(Math.sin(t * 3));
  }

  public update(dt: number, t: number): void {
    this._updateGameActionText(dt, t);
    this._updateGameTitleText(dt, t);
  }
}

class GameTitle extends Scene {
  constructor(
    game: Game,
    transitions: {
      toNext: () => void;
    }
  ) {
    super(game, transitions);

    this.add(new GUI());
  }

  update(dt: number, t: number): void {
    super.update(dt, t);

    if (this.game.keyboard.key("Enter")) {
      this.game.keyboard.active = false;
      this.transitions.toNext();
    }

    if (this.game.gamepad.buttonStart) {
      this.transitions.toNext();
    }
  }
}

export default GameTitle;
