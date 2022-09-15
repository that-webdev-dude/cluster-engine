import Vector from "./Vector";
import Text from "../core/Text";

class Logger extends Text {
  constructor(position = new Vector(0, 0), text = "") {
    super(text, {
      // font: "16px 'Press Start 2p'",
      font: "16px Arial",
      fill: "blue",
      align: "left",
    });
    this.position = position;
    this.text = text;
  }

  log(text) {
    this.text = text;
  }
}

export default Logger;
