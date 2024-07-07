import { Cmath } from "../cluster";
import { Entity } from "../cluster";
import { Vector } from "../cluster";
import { Components } from "../cluster/ecs";
import { store } from "../store";

export class Player extends Entity {
  constructor() {
    super();

    const transformComponent = new Components.Transform({
      position: new Vector(32, 32),
    });
    const velocityComponent = new Components.Velocity({
      velocity: new Vector(0, 0),
    });
    const sizeComponent = new Components.Size({
      width: 50,
      height: 50,
    });
    const colourComponent = new Components.Colour({
      fill: "red",
      stroke: "transparent",
    });
    const screenComponent = new Components.Screen({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
      offscreenBehavior: "bounce",
    });
    const keyboardComponent = new Components.Keyboard();

    this.attachComponent(transformComponent);
    this.attachComponent(velocityComponent);
    this.attachComponent(sizeComponent);
    this.attachComponent(colourComponent);
    this.attachComponent(screenComponent);
    this.attachComponent(keyboardComponent);
  }
}
