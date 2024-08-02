import { Scene, Container, Entity, System, Keyboard } from "../cluster";
import { RenderSystem } from "../systems/RenderSystem";
import { Background } from "../entities/Rectangle";
import { Player } from "../entities/Rectangle";
import { Tile } from "../entities/Rectangle";
import { store, GameScenes } from "../store";

const createTiles = () => {
  const tiles = [];
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 26; j++) {
      const tile = new Tile(j * 32, i * 32);
      tiles.push(tile);
    }
  }
  return tiles;
};

export class GamePlay extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new Background());
    entities.add(new Player());
    entities.add(...createTiles());

    const systems = new Container<System>();
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
