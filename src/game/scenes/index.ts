import * as Cluster from "../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    // entities
    const background = new Entities.Background();
    const spaceship = new Entities.Spaceship();
    const enemy = new Entities.Enemy({
      position: new Cluster.Vector(64, 128),
      velocity: new Cluster.Vector(0, 0),
    });
    const bullet = new Entities.Bullet({
      position: new Cluster.Vector(128, 128),
      velocity: new Cluster.Vector(0, 0),
    });

    // systems
    const rendererSystem = new Systems.RendererSystem();

    // initialize
    this.addEntity(background);
    this.addEntity(spaceship);
    this.addEntity(enemy);
    this.addEntity(bullet);
    this.addSystem(rendererSystem);
  }
}
