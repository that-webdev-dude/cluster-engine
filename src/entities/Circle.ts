import { Cmath } from "../cluster";
import { Entity } from "../cluster";
import { Vector } from "../cluster";
import { Components } from "../cluster/ecs";

export class Circle extends Entity {
  constructor() {
    super();

    const transformComponent = new Components.Transform({
      position: new Vector(Cmath.rand(300, 400), Cmath.rand(300, 400)),
    });
    const velocityComponent = new Components.Velocity({
      velocity: new Vector(Cmath.rand(-500, 500), Cmath.rand(-500, 500)),
    });
    const radiusComponent = new Components.Radius({
      radius: Cmath.rand(10, 20),
    });
    const colourComponent = new Components.Colour({
      fill: "red",
      stroke: "black",
    });

    // to be fixed in case of Circle
    const screenComponent = new Components.Screen({
      width: 800,
      height: 600,
      entityWidth: radiusComponent.value * 2,
      entityHeight: radiusComponent.value * 2,
      offscreenBehavior: "contain",
    });

    this.attachComponent(transformComponent);
    this.attachComponent(velocityComponent);
    this.attachComponent(radiusComponent);
    this.attachComponent(colourComponent);
    this.attachComponent(screenComponent);
  }
}
