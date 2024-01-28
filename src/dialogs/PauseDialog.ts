import { GAME_CONFIG } from "../config/GameConfig";
import { Game, Dialog, Text, Vector, Rect } from "../ares";

class PauseDialog extends Dialog {
  private _background = new Rect({
    position: new Vector(0, 0),
    width: this.width,
    height: this.height,
    fill: "black",
    alpha: 0.75,
  });
  private _quitText = new Text({
    position: new Vector(this.width / 2, this.height / 2 + 32),
    text: "ESC TO QUIT",
    fill: "white",
  });
  private _pauseText = new Text({
    position: new Vector(this.width / 2, this.height / 2 - 32),
    text: "PAUSED",
    fill: "white",
  });
  private _resumeText = new Text({
    position: new Vector(this.width / 2, this.height / 2),
    text: "ENTER TO RESUME",
    fill: "white",
  });

  game: Game;

  constructor(game: Game) {
    super({
      width: GAME_CONFIG.width,
      height: GAME_CONFIG.height,
      onUpdate: () => {},
      onClose: () => {},
    });
    this.game = game;
    this.add(this._background);
    this.add(this._pauseText);
    this.add(this._resumeText);
    this.add(this._quitText);
    this.position.set(
      GAME_CONFIG.width / 2 - this.width / 2,
      GAME_CONFIG.height / 2 - this.height / 2
    );
  }
}

export default PauseDialog;
