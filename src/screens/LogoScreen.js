import Container from "../cluster/core/Container";
import Text from "../cluster/core/Text";

class LogoScreen extends Container {
  constructor(game, onStart = () => {}) {
    super();
    const text = new Text("CLUSTER ENGINE", {
      font: "24px 'Press Start 2p'",
      fill: "red",
      align: "center",
    });
    text.position.x = game.width / 2;
    text.position.y = game.height / 2 - 5;

    this.showLength = 2;
    this.onStart = onStart;
    this.add(text);
  }

  update(dt, t) {
    super.update(dt, t);
    this.showLength -= dt;

    if (this.showLength < 0) {
      this.onStart();
      console.log("switch screen");
    }
  }
}

export default LogoScreen;
