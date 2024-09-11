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
    });

    this.add(zindexComponent);
    this.add(transformComponent);
    this.add(spriteComponent);
  }
}
