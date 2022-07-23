import Container from "../cluster/core/Container";
import Text from "../cluster/core/Text";

class TitleScreen extends Container {
  constructor(game, controller, onStart = () => {}) {
    super();

    const title = new Text("SQUIZZBALL", {
      font: "32px 'Press Start 2p'",
      fill: "red",
      align: "center",
    });
    title.position.x = game.width / 2;
    title.position.y = game.height / 2 - 100;

    const info = new Text("PRESS START", {
      font: "16px 'Press Start 2p'",
      fill: "black",
      align: "center",
    });
    info.position.x = game.width / 2;
    info.position.y = game.height / 2 + 75;

    this.title = title;
    this.onStart = onStart;
    this.controller = controller.reset();

    this.add(title);
    this.add(info);
  }

  update(dt, t) {
    super.update(dt, t);

    const { controller, title } = this;
    title.position.y += Math.sin(t / 0.125) * 0.75;
    if (controller.action) {
      this.onStart();
      this.controller.reset();
    }
  }
}

export default TitleScreen;
