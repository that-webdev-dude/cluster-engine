import { Scene, Container, Entity, System } from "../cluster";
import { Systems } from "../cluster/ecs";
import { Spaceship } from "../entities/Spaceship";
import { Spawner } from "../entities/Spawner";
import { GameBackground } from "../entities/UIBackground";
import { UiScore } from "../entities/UiScore";
import { store } from "../store/store";

export class GamePlay extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new GameBackground());
    entities.add(new Spaceship());
    entities.add(new Spawner());
    entities.add(new UiScore());

    const systems = new Container<System>();
    systems.add(new Systems.Input(entities));
    systems.add(new Systems.Speed(entities));
    systems.add(new Systems.Spawn(entities));
    systems.add(new Systems.Screen(entities));
    systems.add(new Systems.Collision(entities));
    systems.add(new Systems.Resolution(entities, store));
    systems.add(new Systems.Render(entities));

    super({
      name: "gamePlay",
      entities,
      systems,
    });
  }

  update(dt: number, t: number) {
    super.update(dt, t);
  }
}
