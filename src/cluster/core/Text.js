import Vector from "../utils/Vector";

class Text {
  constructor(text = "", style = {}) {
    this.text = text;
    this.style = style;
    this.position = new Vector();
  }
}

export default Text;
