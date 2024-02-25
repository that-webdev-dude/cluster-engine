import { GAME_CONFIG } from "../config/GameConfig";
import { Game, Text, Vector, Rect, Scene } from "../ares";

class GameOver extends Scene {
  private _background = new Rect({
    position: new Vector(0, 0),
    size: new Vector(GAME_CONFIG.width, GAME_CONFIG.height),
    style: {
      fill: "black",
    },
  });
  private _winText = new Text({
    position: new Vector(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 64),
    text: "GAME OVER!",
    fill: "white",
    font: `32px ${GAME_CONFIG.fontStyle}`,
  });
  private _resumeText = new Text({
    position: new Vector(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2),
    text: "ENTER TO MAIN MENU",
    fill: "white",
  });

  constructor(
    game: Game,
    transitions: {
      toNext: () => void;
    }
  ) {
    super(game, transitions);
    this.add(this._background);
    this.add(this._winText);
    this.add(this._resumeText);
  }

  update(dt: number) {
    if (this.game.keyboard.key("Enter")) {
      this.transitions.toNext();
      this.game.keyboard.active = false;
    }
  }
}

export default GameOver;
