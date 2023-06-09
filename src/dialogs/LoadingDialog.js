import cluster from "../cluster/index";
// prettier-ignore
const { 
  Container,
  Text,
  Rect,
} = cluster;

class LoadingDialog extends Container {
  constructor(width = 0, height = 0, onClose = () => {}) {
    super();
    this.width = width;
    this.height = height;
    this.onClose = onClose;
    this.elapsed = 0;
    this.dead = false;

    this.background = this.add(
      new Rect({
        width: width,
        height: height,
        style: { fill: "rgba(255, 0, 0, 0.25)" },
      })
    );
    this.text = this.add(
      new Text("...", {
        fill: "white",
        font: '16px "Press Start 2P"',
      })
    );
    this.text.position.set(width / 2, height / 2);
  }

  close() {
    this.dead = true;
    this.onClose();
  }

  update(dt, t, data = {}) {
    const { shouldClose } = data;
    this.elapsed += dt;
    if (shouldClose) {
      this.close();
    }
  }
}

export default LoadingDialog;
