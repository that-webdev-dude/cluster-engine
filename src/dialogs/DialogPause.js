import Dialog from "./Dialog";
import cluster from "../cluster";
import Vector from "../cluster/utils/Vector";

const { Text, Rect } = cluster;

class DialogPause extends Dialog {
  constructor(
    width = 100,
    height = 100,
    onUpdate = () => {},
    onClose = () => {}
  ) {
    super(width, height, onUpdate, onClose);

    const overlay = this.add(
      new Rect({
        width: this.width,
        height: this.height,
        style: { fill: "red" },
      })
    );
    overlay.alpha = 0.5;

    const message = this.add(
      new Text("PAUSED", {
        align: "center",
        fill: "white",
        font: '24px "Press Start 2P"',
      })
    );
    message.position = new Vector(this.width / 2, this.height / 2);
  }
}

export default DialogPause;
