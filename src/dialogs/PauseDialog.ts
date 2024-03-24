import { Dialog, Text, Vector } from "../cluster";

class PauseDialog extends Dialog {
  quitText: Text;
  pauseText: Text;
  resumeText: Text;
  constructor(onClose: () => void) {
    super({ width: 200, height: 100, onClose, onUpdate: () => {} });
    this.pauseText = new Text({
      position: new Vector(this.width / 2, this.height / 2 - 32),
      text: "PAUSED",
      style: {
        fill: "white",
      },
    });
    this.resumeText = new Text({
      position: new Vector(this.width / 2, this.height / 2),
      text: "ENTER TO RESUME",
      style: {
        fill: "white",
      },
    });
    this.quitText = new Text({
      position: new Vector(this.width / 2, this.height / 2 + 32),
      text: "ESC TO QUIT",
      style: {
        fill: "white",
      },
    });
    this.add(this.pauseText);
    this.add(this.resumeText);
    this.add(this.quitText);
  }
}

export default PauseDialog;
