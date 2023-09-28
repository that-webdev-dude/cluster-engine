import cluster from "../cluster/index";

// prettier-ignore
const { 
  Container, 
  Text,
  Rect,
} = cluster;

class Dialog extends Container {
  constructor(
    width = 100,
    height = 100,
    onUpdate = () => {},
    onClose = () => {}
  ) {
    super();
    this.onUpdate = onUpdate;
    this.onClose = onClose;
    this.elapsed = 0;
    this.width = width;
    this.height = height;
  }

  close() {
    this.dead = true;
    this.onClose();
  }

  update(dt, t) {
    this.elapsed += dt;
    this.onUpdate(dt, t);
  }
}

export default Dialog;
