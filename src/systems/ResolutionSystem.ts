import { Container, Entity, System, Cmath } from "../cluster";
import { Collision } from "../components/Collision";
import { store } from "../store";

// system dependencies
const SystemComponents = {
  Collision,
};

// system errors
enum SystemErrors {}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

export class ResolutionSystem extends System {
  private _dieResolution(entities: Container<Entity>, entity: Entity): void {
    entities.remove(entity);
  }

  update(entities: Container<Entity>): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter((entity) => {
      return entity.hasComponents(SystemComponents.Collision);
    });
    if (!SystemCache.entities.size) return;

    SystemCache.entities.forEach((entity) => {
      const collision = entity.getComponent(SystemComponents.Collision);
      if (!collision || !collision.data.size) return;

      collision.data.forEach((collisionData) => {
        const other = collisionData.entity;
        if (!other) return;

        const { resolvers } = collision;
        resolvers.forEach((resolver) => {
          const { mask, type, actions } = resolver;
          const layer =
            other.getComponent(SystemComponents.Collision)?.layer || 0;
          if (mask & layer) {
            switch (type) {
              case "die":
                this._dieResolution(entities, entity);
                break;
            }
            actions?.forEach((action) => {
              store.dispatch(action.name, action.data);
            });
          }
        });
      });

      collision.data.clear();
    });

    SystemCache.entities.clear();
  }
}
