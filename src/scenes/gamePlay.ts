import { Scene, Container, Entity, System } from "../cluster";
import { Systems } from "../cluster/ecs";
import { GameBackground } from "../entities/Background";
import { Spaceship } from "../entities/Spaceship";
import { Spawner } from "../entities/Spawner";
import { UiScore } from "../entities/UiScore";
import { store } from "../store/store";

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

const gamePlay = new Scene({
  name: "gamePlay",
  entities,
  systems,
  store,
});

export { gamePlay };
