import { Cmath } from "../cluster";
import { Entity } from "../cluster";
import { Vector } from "../cluster";
import { Components } from "../cluster/ecs";
import { store } from "../store";

export class Rect extends Entity {
  constructor() {
    super();

    const transformComponent = new Components.Transform({
      position: new Vector(Cmath.rand(300, 400), Cmath.rand(300, 400)),
      scale: new Vector(1, 1),
    });
    const velocityComponent = new Components.Velocity({
      velocity: new Vector(Cmath.rand(-200, 200), Cmath.rand(-200, 200)),
    });
    const sizeComponent = new Components.Size({
      width: 50,
      height: 50,
    });
    const colourComponent = new Components.Colour({
      fill: "lightblue",
      stroke: "transparent",
    });
    const screenComponent = new Components.Screen({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
      offscreenBehavior: "bounce",
    });

    this.attachComponent(transformComponent);
    this.attachComponent(velocityComponent);
    this.attachComponent(sizeComponent);
    this.attachComponent(colourComponent);
    this.attachComponent(screenComponent);
  }
}
