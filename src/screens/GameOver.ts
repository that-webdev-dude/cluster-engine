import { Container, Game, Text, Vector } from "../cluster";
import { GAME_CONFIG } from "../config/GameConfig";
import { Background } from "../entities/Background";

export class GameOver extends Container {
  background: Background;
  menuText: Text;
  titleText: Text;
  game: Game;
  constructor(game: Game) {
    super();
    this.game = game;
    this.background = new Background();
    this.titleText = new Text({
      position: new Vector(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 64),
      text: "Game Over",
      style: {
        fill: "transparent",
        stroke: "white",
        font: `64px ${GAME_CONFIG.fontStyle}`,
        align: "center",
      },
    });
    this.menuText = new Text({
      position: new Vector(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 56),
      text: "[SPACE] for main menu",
      style: {
        fill: "white",
        font: `16px ${GAME_CONFIG.fontStyle}`,
        align: "center",
      },
    });

    this.add(this.background);
    this.add(this.titleText);
    this.add(this.menuText);
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    this.menuText.alpha = Math.abs(Math.sin(t * 2));
    if (this.game.keyboard.action) {
      this.game.keyboard.active = false;
      this.game.setScene("gameTitle");
    }
  }
}
