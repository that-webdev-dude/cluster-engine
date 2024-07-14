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
      minSpeed: 0,
      maxSpeed: 200,
    });
    const sizeComponent = new Components.Size({
      height: 50,
      width: 50,
    });
    const colourComponent = new Components.Colour({
      stroke: "transparent",
      fill: "red",
    });
    const screenComponent = new Components.Screen({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
      offscreenBehavior: "stop",
    });
    const physicsComponent = new Components.Physics({
      friction: 0.1,
      mass: 1,
      // forces: [
      //   () => {
      //     return new Vector(
      //       keyboardComponent.x * 500,
      //       keyboardComponent.y * 500
      //     );
      //   },
      // ],
      // impulses: [],
    });
    const keyboardComponent = new Components.Keyboard({
      actions: [
        () => {
          velocityComponent.velocity.x = keyboardComponent.x * 200;
          velocityComponent.velocity.y = keyboardComponent.y * 200;
        },
      ],
    });

    this.attachComponent(keyboardComponent);
    this.attachComponent(transformComponent);
    this.attachComponent(sizeComponent);
    this.attachComponent(colourComponent);
    this.attachComponent(physicsComponent);
    this.attachComponent(velocityComponent);
    this.attachComponent(screenComponent);
  }
}
