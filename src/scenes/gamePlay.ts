import { Scene, Container, Entity, System } from "../cluster";
import { Systems } from "../cluster/ecs";
import { Background } from "../entities/Background";
import { Spaceship } from "../entities/Spaceship";

const entities = new Container<Entity>();
entities.add(new Background());
entities.add(new Spaceship());

const systems = new Container<System>();
systems.add(new Systems.Input(entities));
systems.add(new Systems.Speed(entities));
systems.add(new Systems.Screen(entities));
systems.add(new Systems.Render(entities));
// systems.add(new Systems.Physics(entities));

const gameplay = new Scene({
  name: "gameplay",
  entities,
  systems,
});

export { gameplay };
