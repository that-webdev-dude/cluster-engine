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

// system types
export type Resolver = "die" | "slide";

export class ResolutionSystem extends System {
  private _dieResolution(): void {
    // ...
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

      const { resolvers } = collision;
      resolvers.forEach((resolver) => {
        switch (resolver.type) {
          case "slide":
            // implement the slide resolution
            console.log(entity.type, collision.data.get("slide"));
            break;

          case "die":
            const data = collision.data.get("die");
            if (!data) return;

            data.forEach((otherEntity) => {
              const layer =
                otherEntity.getComponent(SystemComponents.Collision)?.layer ||
                0;
              const { mask, actions } = resolver;
              if (mask & layer) {
                entities.remove(entity);
              }

              if (actions?.length) {
                actions.forEach((action) => {
                  store.dispatch(action.name, action.data);
                });
              }
            });
            break;
        }
      });

      // collision.data.forEach((collisionData) => {
      //   const other = collisionData.entity;
      //   if (!other) return;

      //   const { resolvers } = collision;
      //   resolvers.forEach((resolver) => {
      //     const { mask, type, actions } = resolver;
      //     const layer =
      //       other.getComponent(SystemComponents.Collision)?.layer || 0;
      //     if (mask & layer) {
      //       switch (type) {
      //         case "die":
      //           this._dieResolution(entities, entity);
      //           break;
      //       }
      //       actions?.forEach((action) => {
      //         store.dispatch(action.name, action.data);
      //       });
      //     }
      //   });
      // });

      collision.data.clear();
    });

    SystemCache.entities.clear();
  }
}
