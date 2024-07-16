import { Entity, Vector } from "../cluster";
import { Visibility } from "../components/Visibility";
import { Transform } from "../components/Transform";
import { Colour } from "../components/Colour";
import { Text } from "../components/Text";
import { Fade } from "../components/Fade";
import { store } from "../store";

export class TitleText extends Entity {
  constructor() {
    super();

    const transform = new Transform({
      position: new Vector(
        store.get("screenWidth") / 2,
        store.get("screenHeight") / 2 - 64
      ),
    });
    const colour = new Colour({
      fill: "white",
    });
    const text = new Text({
      font: `48px Arial`,
      align: "center",
      string: "Cluster Game",
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(text);
  }
}

export class ActionText extends Entity {
  constructor() {
    super();

    const transform = new Transform({
      position: new Vector(
        store.get("screenWidth") / 2,
        store.get("screenHeight") / 2 + 16
      ),
    });
    const colour = new Colour({
      fill: "white",
    });
    const text = new Text({
      font: `20px Arial`,
      align: "center",
      string: "Press Start",
    });
    const fade = new Fade({
      duration: 2,
      easing: "easeInOut",
      loop: true,
    });
    const visibility = new Visibility({
      opacity: 1,
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(text);
    this.attachComponent(fade);
    this.attachComponent(visibility);
  }
}
