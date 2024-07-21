import { Scene, Container, Entity, System, Keyboard } from "../cluster";
import { CollisionSystem } from "../systems/CollisionSystem";
import { ResolutionSystem } from "../systems/ResolutionSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { RenderSystem } from "../systems/RenderSystem";
import { BoundarySystem } from "../systems/BoundarySystem";
import { Player } from "../entities/Character";
import { Enemy } from "../entities/Character";
import { Floor } from "../entities/Tile";
import { store, GameScenes } from "../store";

const createFloor = (): Array<Entity> => {
  const mapWidth = store.get("screenWidth") / 32;

  const tiles = [];
  for (let i = 0; i < mapWidth; i++) {
    const x = i * 32;
    const tile = new Floor(x, store.get("screenHeight") - 32);
    tiles.push(tile);
  }

  return tiles;
};

export class GamePlay extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new Player());
    entities.add(new Enemy());
    entities.add(...createFloor());

    const systems = new Container<System>();
    systems.add(new MovementSystem());
    systems.add(new BoundarySystem());
    systems.add(new CollisionSystem());
    systems.add(new ResolutionSystem());
    systems.add(new RenderSystem());

    super({
      name: "GamePlay",
      entities,
      systems,
    });
  }

  update(dt: number, t: number) {
    if (Keyboard.key("Escape")) {
      store.dispatch("setGameScene", GameScenes.GameMenu);
      Keyboard.active = false;
    }

    super.update(dt, t);
  }
}
