import { Container, Entity, System, Cmath } from "../cluster";

// system dependencies
const SystemComponents = {};

// system errors
enum SystemErrors {}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

export class Template extends System {
  update(entities: Container<Entity>): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter((entity) => true);

    SystemCache.entities.forEach((entity) => {
      // ...
    });

    SystemCache.entities.clear();
  }
}
