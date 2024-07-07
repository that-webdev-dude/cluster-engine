import { Game } from "./cluster";
import { Scene } from "./cluster";
import { Entity } from "./cluster";
import { System } from "./cluster";
import { Container } from "./cluster";
import { Systems } from "./cluster/ecs";
import { Rect } from "./entities/Rect";
import { Player } from "./entities/Player";
import { store } from "./store";

class GamePlay extends Scene {
  constructor() {
    const nRects = 4;

    const entities = new Container<Entity>();
    for (let i = 0; i < nRects; i++) {
      entities.add(new Rect());
    }
    entities.add(new Player());

    const systems = new Container<System>();
    systems.add(new Systems.Input(entities));
    systems.add(new Systems.Movement());
    systems.add(new Systems.Screen());
    systems.add(new Systems.Render());

    super({
      name: "GamePlay",
      entities,
      systems,
    });
  }
}

export default () => {
  const game = new Game({
    width: store.get("screenWidth"),
    height: store.get("screenHeight"),
    scenes: new Map([["GamePlay", () => new GamePlay()]]),
  });

  game.setScene("GamePlay");
  game.start();
};
