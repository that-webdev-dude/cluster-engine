import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Constants from "../constants";
import * as Images from "../images";

export class PlayerEntity extends Cluster.Entity {
  constructor() {
    super();

    const playerComponent = new Components.PlayerComponent({
      speed: 200,
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const transformComponent = new Components.TransformComponent({
      anchor: new Cluster.Vector(-16, 0),
      position: new Cluster.Vector(
        Constants.DISPLAY.width / 2 + 16,
        Constants.DISPLAY.height - 64
      ),
    });

    const spriteComponent = new Components.SpriteComponent({
      image: Images.charactersImage,
      frame: 0,
      width: 32,
      height: 32,
      animations: [
        {
          name: "idle",
          frames: [
            { x: 2, y: 1 },
            { x: 1, y: 1 },
          ],
          rate: 0.25,
        },
        {
          name: "walk",
          frames: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ],
          rate: 0.075,
        },
      ],
    });

    this.add(playerComponent);
    this.add(zindexComponent);
    this.add(transformComponent);
    this.add(spriteComponent);
  }
}
