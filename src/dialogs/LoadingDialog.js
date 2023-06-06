import cluster from "../cluster/index";

// prettier-ignore
const { 
  Container, 
  Vector,
  Text,
  Rect,
} = cluster;

class LoadingDialog extends Container {
  constructor(onClose) {
    super();
    this.onClose = onClose;
    this.elapsed = 0;

    // draw the dialog window
    const bg = this.add(
      new Rect({
        width: 32 * 26,
        height: 32 * 20,
        style: { fill: "rgba(255, 0, 0, 0.5)" },
      })
    );
    bg.position = new Vector(0, 0);

    const text = this.add(
      new Text("LOADING...", { fill: "white", font: '16px "Press Start 2P"' })
    );
    text.position = new Vector(100, 100);
  }

  close() {
    this.dead = true;
    this.onClose();
  }

  update(dt, t) {
    this.elapsed += dt;
  }
}

export default LoadingDialog;
