import { Container, Entity, System, Cmath } from "../cluster";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
import { Input } from "../components/Input";

// system dependencies
const SystemComponents = {
  Transform,
  Velocity,
  Input,
};

// system errors
enum SystemErrors {}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

export class MovementSystem extends System {
  update(entities: Container<Entity>): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter((entity) => {
      return (
        entity.hasComponent(SystemComponents.Transform) &&
        entity.hasComponent(SystemComponents.Velocity)
      );
    });
    if (!SystemCache.entities.size) return;

    SystemCache.entities.forEach((entity) => {
      // ...
      const input = entity.getComponent(SystemComponents.Input);
      if (input) {
        console.log(input.action);
      }
    });

    SystemCache.entities.clear();
  }
}
