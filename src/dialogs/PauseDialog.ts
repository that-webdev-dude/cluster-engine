import { GAME_CONFIG } from "../config/GameConfig";
import { Dialog, Text, Vector, Rect } from "../cluster";

export class PauseDialog extends Dialog {
  quitText: Text;
  pauseText: Text;
  resumeText: Text;
  background: Rect;
  constructor(onClose: () => void) {
    super({
      position: new Vector(200, 200),
      width: GAME_CONFIG.width - 400,
      height: GAME_CONFIG.height - 400,
      onClose,
      onUpdate: () => {},
    });
    this.background = new Rect({
      width: this.width,
      height: this.height,
      style: { fill: "rgba(0, 0, 0, 0.5)" },
    });
    this.pauseText = new Text({
      position: new Vector(this.width / 2, this.height / 2 - 64),
      text: "PAUSED",
      style: {
        fill: "transparent",
        font: `32px ${GAME_CONFIG.fontStyle}`,
        stroke: "white",
      },
    });
    this.resumeText = new Text({
      position: new Vector(this.width / 2, this.height / 2),
      text: "[ENTER] to resume",
      style: {
        fill: "white",
        font: `16px ${GAME_CONFIG.fontStyle}`,
      },
    });
    this.quitText = new Text({
      position: new Vector(this.width / 2, this.height / 2 + 32),
      text: "[ESC] to quit",
      style: {
        fill: "white",
        font: `16px ${GAME_CONFIG.fontStyle}`,
      },
    });
    this.add(this.background);
    this.add(this.pauseText);
    this.add(this.resumeText);
    this.add(this.quitText);
  }
}
