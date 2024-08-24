import { store } from "../store";
import * as Cluster from "../../cluster";
import * as Components from "../components";

/** UIScore entity
 * @components Transform, Text, Zindex
 */
export class UIScores extends Cluster.Entity {
  constructor() {
    super();

    const transform = new Components.TransformComponent({
      position: new Cluster.Vector(32, 64),
    });

    const text = new Components.TextComponent({
      text: `Scores: ${store.get("scores")}`,
      font: "16px 'Press Start 2P'",
      fill: "white",
      align: "left",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 2,
    });

    this.components.set("Transform", transform);
    this.components.set("Text", text);
    this.components.set("Zindex", zindex);

    store.on("scores-changed", () => {
      text.text = `Scores: ${store.get("scores")}`;
    });
  }
}

/** UILives entity
 * @components Transform, Text, Zindex
 */
export class UILives extends Cluster.Entity {
  constructor() {
    super();

    const transform = new Components.TransformComponent({
      position: new Cluster.Vector(32, 64 + 40),
    });

    const text = new Components.TextComponent({
      text: `Lives: ${store.get("lives")}`,
      font: "16px 'Press Start 2P'",
      fill: "white",
      align: "left",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 2,
    });

    this.components.set("Transform", transform);
    this.components.set("Text", text);
    this.components.set("Zindex", zindex);

    store.on("lives-changed", () => {
      text.text = `Lives: ${store.get("lives")}`;
    });
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

/** UITitle entity
 * @components Transform, Text, Zindex
 */
export class UITitle extends Cluster.Entity {
  constructor() {
    super();

    const transform = new Components.TransformComponent({
      position: new Cluster.Vector(
        store.get("screenWidth") / 2,
        store.get("screenHeight") / 2
      ),
    });

    const text = new Components.TextComponent({
      text: "Cluster",
      font: "32px 'Press Start 2P'",
      fill: "white",
      align: "center",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 2,
    });

    this.components.set("Transform", transform);
    this.components.set("Text", text);
    this.components.set("Zindex", zindex);
  }
}
