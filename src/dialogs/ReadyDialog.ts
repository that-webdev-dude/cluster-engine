import { Dialog, Text, Vector } from "../ares";

class LoadingDialog extends Dialog {
  readyText: Text;
  counterText: Text;
  counterValue: number = 5;
  constructor(onClose: () => void) {
    super({ width: 200, height: 100, onClose, onUpdate: () => {} });
    this.readyText = new Text({
      position: new Vector(this.width / 2, this.height / 2 - 32),
      text: "READY",
      fill: "white",
    });
    this.counterText = new Text({
      position: new Vector(this.width / 2, this.height / 2),
      text: "0",
      fill: "white",
    });
    this.add(this.readyText);
    this.add(this.counterText);
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    this.counterValue -= dt;
    this.counterText.text = Math.floor(this.counterValue - 1).toString();

    if (this.counterValue - 1 < 1) {
      this.counterText.text = "GO!";
    }

    if (this.counterValue - 1 < 0) {
      this.close();
    }
  }
}

export default LoadingDialog;
