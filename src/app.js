import { Display } from "./cluster";
import { Engine } from "./cluster";

class Container {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.children = [];
  }

  add(child) {
    this.children.push(child);
    return child;
  }

  remove(child) {
    this.children = this.children.filter((c) => c !== child);
    return child;
  }

  update(dt, t) {
    this.children.forEach((c) => {
      if (c.update()) {
        c.update(dt, t);
      }
    });
  }
}

class Text {
  constructor(text = "", style = {}) {
    this.position = { x: 0, y: 0 };
    this.style = style;
    this.text = text;
  }
}

export default () => {
  // display
  const display = new Display({
    canvas: document.querySelector("#display"),
  });

  // message actor
  const message = new Text("Cluster Engine v1.0", {
    font: "Press Start 2p",
    fill: "blue",
    align: "center",
  });

  message.position.y = display.height / 2;
  message.position.x = display.width / 2;

  // scene
  const scene = new Container();
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
