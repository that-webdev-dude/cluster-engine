import { Container } from "./cluster";
import { Display } from "./cluster";
import { Buffer } from "./cluster";
import { Engine } from "./cluster";

class Text {
  constructor(text = "", style = {}) {
    this.position = { x: 0, y: 0 };
    this.style = style;
    this.text = text;
  }
}

class Renderer extends Buffer {
  constructor() {
    super({ width: 832, height: 640 });
    this.context.textBaseline = "top";
  }

  render(container) {
    const { context } = this;

    function renderRec(container) {
      // render the container children
      container.children.forEach((child) => {
        context.save();
        if (child.children) renderRec(child);
        if (child.position)
          context.translate(
            Math.round(child.position.x),
            Math.round(child.position.y)
          );
        if (child.text) {
          const { font, fill, align } = child.style;
          if (font) context.font = font;
          if (fill) context.fillStyle = fill;
          if (align) context.textAlign = align;
          context.fillText(child.text, 0, 0);
        }
        context.restore();
      });
    }

    context.clearRect(0, 0, this.width, this.height);
    renderRec(container);
  }
}

export default () => {
  // display
  const display = new Display({
    canvas: document.querySelector("#display"),
  });

  // scene
  const scene = new Container();

  // renderer
  const renderer = new Renderer();

  // message actor
  const message = new Text("Cluster Engine v1.0", {
    font: "Press Start 2p",
    fill: "blue",
    align: "center",
  });
  message.position.y = display.height / 2;
  message.position.x = display.width / 2;
  scene.add(message);

  // game loop
  const engine = new Engine(
    function update() {
      display.clear();
      display.context.font = '16px "Press Start 2p"';
    },
    function render() {
      display.context.fillText("Hello world", 10, 50);
    }
  );

  // game start
  engine.start();
  engine.stop();
};
