import { Game } from "./cluster";
import { Scene } from "./cluster";
import { Entity } from "./cluster";
import { System } from "./cluster";
import { Container } from "./cluster";
import { Systems } from "./cluster/ecs";
import { Circle } from "./entities/Circle";

class GamePlay extends Scene {
  constructor() {
    const N_CIRCLES = 1;

    const entities = new Container<Entity>();
    for (let i = 0; i < N_CIRCLES; i++) {
      entities.add(new Circle());
    }

    const systems = new Container<System>();
    systems.add(new Systems.Physics(entities));
    systems.add(new Systems.Screen(entities));
    systems.add(new Systems.Render(entities));

    super({
      name: "GamePlay",
      entities,
      systems,
    });
  }
}

export default () => {
  const game = new Game({
    width: 800,
    height: 600,
    scenes: new Map([["GamePlay", () => new GamePlay()]]),
  });

  game.setScene("GamePlay");
  game.start();
};
