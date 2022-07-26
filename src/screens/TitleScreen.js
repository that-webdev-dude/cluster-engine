import Texture from "../cluster/core/Texture";
import TileSprite from "../cluster/core/TileSprite";
import Container from "../cluster/core/Container";
import Text from "../cluster/core/Text";
import squizzTextureURL from "../images/squizz.png";

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

    const squizzTexture = new Texture(squizzTextureURL);
    const squizz = new TileSprite(squizzTexture, 32, 32);
    squizz.position.x = game.width / 2;
    squizz.position.y = game.height / 2 - 20;
    squizz.anchor.x = -16;
    squizz.anchor.y = -16;
    squizz.animation.add(
      "roll",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      0.1
    );
    squizz.animation.play("roll");

    this.title = title;
    this.onStart = onStart;
    this.controller = controller.reset();

    this.add(title);
    this.add(squizz);
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
