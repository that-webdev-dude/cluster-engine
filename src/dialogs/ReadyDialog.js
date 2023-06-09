import cluster from "../cluster/index";
// prettier-ignore
const { 
  Container,
  Text,
  Rect,
} = cluster;

class ReadyDialog extends Container {
  constructor(width = 0, height = 0, onClose = () => {}) {
    super();
    this.width = width;
    this.height = height;
    this.onClose = onClose;
    this.counter = 0;
    this.elapsed = 0;
    this.duration = 5;
    this.dead = false;

    this.background = this.add(
      new Rect({
        width: width,
        height: height,
        style: { fill: "rgba(255, 0, 0, 0.25)" },
      })
    );

    this.getReadyText = this.add(
      new Text("GET READY", {
        fill: "white",
        font: '16px "Press Start 2P"',
      })
    );
    this.getReadyText.position.set(width / 2, height / 2 - 24);

    this.counterText = this.add(
      new Text("3", {
        fill: "white",
        font: '24px "Press Start 2P"',
      })
    );
    this.counterText.position.set(width / 2, height / 2 + 24);
  }

  close() {
    this.dead = true;
    this.onClose();
  }

  update(dt, t, data) {
    this.elapsed += dt;
    let currentTime = Math.floor(this.elapsed % this.duration);

    if (currentTime > this.counter) {
      this.counter++;
      const updatedText = this.duration - this.counter - 2;
      this.counterText.text = updatedText > 0 ? updatedText : "GO";
      if (this.counter === 4) {
        this.close();
      }
    }
  }
}

export default ReadyDialog;
