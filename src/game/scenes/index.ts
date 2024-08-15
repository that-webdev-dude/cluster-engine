import * as Cluster from "../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    // systems
    const inputSystem = new Systems.InputSystem();
    const motionSystem = new Systems.MotionSystem();
    const spawnSystem = new Systems.SpawnSystem();
    const boundarySystem = new Systems.BoundarySystem();
    const rendererSystem = new Systems.RendererSystem();

    // initialize
    this.addEntity(new Entities.Background());
    this.addEntity(new Entities.Mothership());
    this.addEntity(new Entities.Spaceship());
    for (let i = 0; i < 20; i++) {
      this.addEntity(new Entities.Star());
    }
    this.addSystem(inputSystem);
    this.addSystem(motionSystem);
    this.addSystem(spawnSystem);
    this.addSystem(boundarySystem);
    this.addSystem(rendererSystem);
  }
}
