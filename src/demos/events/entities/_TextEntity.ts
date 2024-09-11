import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Constants from "../constants";

export class TitleTextEntity extends Cluster.Entity {
  constructor() {
    super();

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(
        Constants.DISPLAY.width / 2,
        Constants.DISPLAY.height / 2
      ),
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const textComponent = new Components.TextComponent({
      text: "Arkanoid",
      font: "48px 'Press Start 2P'",
      fill: "white",
      stroke: "black",
      align: "center",
    });

    this.add(transformComponent);
    this.add(zindexComponent);
    this.add(textComponent);
  }
}

export class ActionTextEntity extends Cluster.Entity {
  constructor() {
    super();

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(
        Constants.DISPLAY.width / 2,
        Constants.DISPLAY.height / 2 + 64
      ),
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const textComponent = new Components.TextComponent({
      text: "PRESS START",
      font: "16px 'Press Start 2P'",
      fill: "white",
      stroke: "black",
      align: "center",
    });

    this.add(transformComponent);
    this.add(zindexComponent);
    this.add(textComponent);
  }
}

export class GameOverTextEntity extends Cluster.Entity {
  constructor() {
    super();

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(
        Constants.DISPLAY.width / 2,
        Constants.DISPLAY.height / 2
      ),
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const textComponent = new Components.TextComponent({
      text: "GAME OVER",
      font: "48px 'Press Start 2P'",
      fill: "white",
      stroke: "black",
      align: "center",
    });

    this.add(transformComponent);
    this.add(zindexComponent);
    this.add(textComponent);
  }
}
