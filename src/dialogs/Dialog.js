import cluster from "../cluster/index";

// prettier-ignore
const { 
  Container, 
  Vector,
  Text,
  Rect,
} = cluster;

class Dialog extends Container {
  constructor(
    width = 0,
    height = 0,
    text = [],
    onUpdate = () => {},
    onClose = () => {}
  ) {
    super();
    // this.height = height;
    // this.width = width;
    // this.text = text;
    this.onUpdate = onUpdate;
    this.onClose = onClose;
    this.elapsed = 0;

    // draw the dialog window
    this.background = this.add(
      new Rect({
        width: width,
        height: height,
        style: { fill: "rgba(255, 0, 0, 0.25)" },
      })
    );

    this.text = this.add(
      new Text(text, { fill: "white", font: '16px "Press Start 2P"' })
    );
    this.text.position.set(width / 2, height / 2);
  }

  setText(text) {
    this.text.text = text;
  }

  close() {
    this.dead = true;
    this.onClose();
  }

  update(dt, t) {
    this.elapsed += dt;
  }
}

export default Dialog;
