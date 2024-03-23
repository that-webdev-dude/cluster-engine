import { Container, Game, Text, Vector } from "../cluster";
import { GAME_CONFIG } from "../config/GameConfig";
import { Background } from "../entities/Background";

export class GameTitle extends Container {
  background: Background;
  actionText: Text;
  titleText: Text;
  game: Game;
  constructor(game: Game) {
    super();
    this.game = game;
    this.background = new Background();
    this.titleText = new Text({
      position: new Vector(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 64),
      text: GAME_CONFIG.title,
      style: {
        fill: "transparent",
        stroke: "white",
        font: `64px ${GAME_CONFIG.fontStyle}`,
        align: "center",
      },
    });
    this.actionText = new Text({
      position: new Vector(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 56),
      text: "Press [SPACE] to start",
      style: {
        fill: "white",
        font: `16px ${GAME_CONFIG.fontStyle}`,
        align: "center",
      },
    });

    this.add(this.background);
    this.add(this.titleText);
    this.add(this.actionText);
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    this.actionText.alpha = Math.abs(Math.sin(t * 2));
    if (this.game.keyboard.action) {
      this.game.keyboard.active = false;
      this.game.setScene("gamePlay");
    }
  }
}
