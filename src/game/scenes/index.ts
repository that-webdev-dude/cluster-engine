import * as Cluster from "../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    // entities
    this.addEntity(new Entities.Background());
    this.addEntity(new Entities.Mothership());
    this.addEntity(new Entities.Spaceship());
    for (let i = 0; i < 20; i++) {
      this.addEntity(new Entities.Star());
    }

    // systems
    this.addSystem(new Systems.InputSystem());
    this.addSystem(new Systems.MotionSystem());
    this.addSystem(new Systems.SpawnSystem());
    this.addSystem(new Systems.BoundarySystem());
    this.addSystem(new Systems.CollisionSystem());
    this.addSystem(new Systems.ResolutionSystem());
    this.addSystem(new Systems.RendererSystem());
  }
}
