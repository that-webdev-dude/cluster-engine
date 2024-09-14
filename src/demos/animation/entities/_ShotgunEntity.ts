import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Constants from "../constants";
import * as Images from "../images";

export class ShotgunEntity extends Cluster.Entity {
  constructor(owner: Cluster.Entity) {
    super();

    const shotgunComponent = new Components.ShotgunComponent({
      fireRate: 0.5,
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const transformComponent = new Components.TransformComponent({
      anchor: new Cluster.Vector(4, 16),
      pivot: new Cluster.Vector(6, 5),
      angle: 0,
    });

    const spriteComponent = new Components.SpriteComponent({
      image: Images.weaponImage,
      frame: 0,
      width: 36,
      height: 10,
    });

    const trackerComponent = new Components.TrackerComponent({
      subject: owner,
    });

    this.add(shotgunComponent);
    this.add(zindexComponent);
    this.add(transformComponent);
    this.add(spriteComponent);
    this.add(trackerComponent);
  }
}
