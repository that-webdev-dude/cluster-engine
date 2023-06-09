import Vector from "../utils/Vector";

class Text {
  constructor(text = "", style = {}) {
    this.font = "";
    this.text = text;
    this.style = style;
    this.align = "center";
    this.position = new Vector();
  }
}

export default Text;
