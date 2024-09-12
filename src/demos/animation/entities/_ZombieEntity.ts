import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Constants from "../constants";
import * as Images from "../images";

export class ZombieEntity extends Cluster.Entity {
  constructor() {
    super();

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(0, 0),
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

    this.add(zindexComponent);
    this.add(transformComponent);
    this.add(spriteComponent);
  }
}
