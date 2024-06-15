import { Scene, Container, Entity, System } from "../cluster";
import { Systems } from "../cluster/ecs";
import { Background } from "../entities/Background";
import { Spaceship } from "../entities/Spaceship";
import { Spawner } from "../entities/Spawner";
import { UiScore } from "../entities/UiScore";

const entities = new Container<Entity>();
entities.add(new Background());
entities.add(new Spaceship());
entities.add(new Spawner());
entities.add(new UiScore());

const systems = new Container<System>();
systems.add(new Systems.Input(entities));
systems.add(new Systems.Speed(entities));
systems.add(new Systems.Spawn(entities));
systems.add(new Systems.Screen(entities));
systems.add(new Systems.Collision(entities));
systems.add(new Systems.Resolution(entities));
systems.add(new Systems.Render(entities));

const gameplay = new Scene({
  name: "gameplay",
  entities,
  systems,
});

export { gameplay };
