import { store } from "../../store";
import * as Cluster from "../../../cluster";
import * as Components from "../../components";

/** UIScore entity
 * @components Transform, Text, Zindex
 */
export class UIScore extends Cluster.Entity {
  constructor() {
    super();

    const transform = new Components.TransformComponent({
      position: new Cluster.Vector(32, 64),
    });

    const text = new Components.TextComponent({
      text: `Score: ${store.get("scores")}`,
      font: "16px 'Press Start 2P'",
      fill: "white",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 2,
    });

    const scores = new Components.ScoresComponent();

    this.components.set("Transform", transform);
    this.components.set("Text", text);
    this.components.set("Zindex", zindex);
    this.components.set("Scores", scores);
  }
}

/** UILives entity
 * @components Transform, Text, Zindex
 */
export class UILives extends Cluster.Entity {
  constructor() {
    super();

    const transform = new Components.TransformComponent({
      position: new Cluster.Vector(0, 20),
    });

    const text = new Components.TextComponent({
      text: "Lives: 3",
      font: "16px Arial",
      fill: "white",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 2,
    });

    this.components.set("Transform", transform);
    this.components.set("Text", text);
    this.components.set("Zindex", zindex);
  }
}

/** UIHealth entity
 * @components Transform, Text, Zindex
 */
export class UIHealth extends Cluster.Entity {
  constructor() {
    super();

    const transform = new Components.TransformComponent({
      position: new Cluster.Vector(0, 40),
    });

    const text = new Components.TextComponent({
      text: "Health: 100",
      font: "16px Arial",
      fill: "white",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 2,
    });

    this.components.set("Transform", transform);
    this.components.set("Text", text);
    this.components.set("Zindex", zindex);
  }
}
