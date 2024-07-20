import { Container, Entity, System, Cmath } from "../cluster";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
import { Boundary } from "../components/Boundary";
import { Size } from "../components/Size";

// system dependencies
const SystemComponents = {
  Transform,
  Velocity,
  Boundary,
  Size,
};

// system behaviors
enum SystemBehaviors {
  CONTAIN = "contain",
  WRAP = "wrap",
  DIE = "die",
  STOP = "stop",
  BOUNCE = "bounce",
}

// system errors
enum SystemErrors {}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

/**
 * BoundarySystem
 * @components Transform, Boundary, Size, Velocity
 */
export class BoundarySystem extends System {
  private _getEntityWidth(entity: Entity): number {
    const transform = entity.getComponent(SystemComponents.Transform);
    const size = entity.getComponent(SystemComponents.Size);
    if (transform && size) {
      return size.width * transform.scale.x + transform.anchor.x;
    }
    return 0;
  }

  private _getEntityHeight(entity: Entity): number {
    const transform = entity.getComponent(SystemComponents.Transform);
    const size = entity.getComponent(SystemComponents.Size);
    if (transform && size) {
      return size.height * transform.scale.y + transform.anchor.y;
    }
    return 0;
  }

  // private _screenCollision(entity: Entity): Vector | null {
  //   const transform = entity.getComponent(SystemComponents.Transform);
  //   const boundary = entity.getComponent(SystemComponents.Boundary);
  //   if (transform && boundary) {
  //     const entityWidth = this._getEntityWidth(entity);
  //     const entityHeight = this._getEntityHeight(entity);
  //     if (transform.position.x < 0) {
  //       offscreenVector.x = -1;
  //     } else if (transform.position.x + entityWidth > boundary.width) {
  //       offscreenVector.x = 1;
  //     } else {
  //       offscreenVector.x = 0;
  //     }

  //     if (transform.position.y < 0) {
  //       offscreenVector.y = -1;
  //     } else if (transform.position.y + entityHeight > boundary.height) {
  //       offscreenVector.y = 1;
  //     } else {
  //       offscreenVector.y = 0;
  //     }

  //     return offscreenVector;
  //   }

  //   return null;
  // }

  private _horizontalScreenCollision(entity: Entity): boolean {
    const transform = entity.getComponent(SystemComponents.Transform);
    const boundary = entity.getComponent(SystemComponents.Boundary);
    if (transform && boundary) {
      const entityWidth = this._getEntityWidth(entity);
      return (
        transform.position.x < 0 ||
        transform.position.x + entityWidth > boundary.width
      );
    }
    return false;
  }

  private _verticalScreenCollision(entity: Entity): boolean {
    const transform = entity.getComponent(SystemComponents.Transform);
    const boundary = entity.getComponent(SystemComponents.Boundary);
    if (transform && boundary) {
      const entityHeight = this._getEntityHeight(entity);
      return (
        transform.position.y < 0 ||
        transform.position.y + entityHeight > boundary.height
      );
    }
    return false;
  }

  private _contain(entity: Entity): void {
    const transform = entity.getComponent(SystemComponents.Transform);
    const boundary = entity.getComponent(SystemComponents.Boundary);
    if (transform && boundary) {
      const entityHeight = this._getEntityHeight(entity);
      const entityWidth = this._getEntityWidth(entity);
      transform.position.x = Math.max(
        0,
        Math.min(transform.position.x, boundary.width - entityWidth)
      );
      transform.position.y = Math.max(
        0,
        Math.min(transform.position.y, boundary.height - entityHeight)
      );
    }
  }

  private _bounce(entity: Entity): void {
    const transform = entity.getComponent(SystemComponents.Transform);
    const velocity = entity.getComponent(SystemComponents.Velocity);
    const boundary = entity.getComponent(SystemComponents.Boundary);
    if (transform && velocity && boundary) {
      const entityHeight = this._getEntityHeight(entity);
      const entityWidth = this._getEntityWidth(entity);
      if (transform.position.x < 0) {
        transform.position.x = 0;
        velocity.value.x *= -1;
      } else if (transform.position.x + entityWidth > boundary.width) {
        transform.position.x = boundary.width - entityWidth;
        velocity.value.x *= -1;
      }

      if (transform.position.y < 0) {
        transform.position.y = 0;
        velocity.value.y *= -1;
      } else if (transform.position.y + entityHeight > boundary.height) {
        transform.position.y = boundary.height - entityHeight;
        velocity.value.y *= -1;
      }
    }
  }

  private _stop(entity: Entity): void {
    if (this._horizontalScreenCollision(entity)) {
      this._contain(entity);
      const velocity = entity.getComponent(SystemComponents.Velocity);
      if (velocity) {
        velocity.value.x = 0;
      }
    }
    if (this._verticalScreenCollision(entity)) {
      this._contain(entity);
      const velocity = entity.getComponent(SystemComponents.Velocity);
      if (velocity) {
        velocity.value.y = 0;
      }
    }
  }

  private _wrap(entity: Entity): void {
    const transform = entity.getComponent(SystemComponents.Transform);
    const boundary = entity.getComponent(SystemComponents.Boundary);
    if (transform && boundary) {
      const entityHeight = this._getEntityHeight(entity);
      const entityWidth = this._getEntityWidth(entity);
      if (transform.position.x + entityWidth < 0) {
        transform.position.x = boundary.width;
      } else if (transform.position.x > boundary.width) {
        transform.position.x = -entityWidth;
      }

      if (transform.position.y + entityHeight < 0) {
        transform.position.y = boundary.height;
      } else if (transform.position.y > boundary.height) {
        transform.position.y = -entityHeight;
      }
    }
  }

  private _die(entities: Container<Entity>, entity: Entity): void {
    const transform = entity.getComponent(SystemComponents.Transform);
    const boundary = entity.getComponent(SystemComponents.Boundary);
    if (transform && boundary) {
      const entityHeight = this._getEntityHeight(entity);
      const entityWidth = this._getEntityWidth(entity);
      if (
        transform.position.x + entityWidth < 0 ||
        transform.position.x > boundary.width ||
        transform.position.y + entityHeight < 0 ||
        transform.position.y > boundary.height
      ) {
        entities.remove(entity);
      }
    }
  }

  update(entities: Container<Entity>): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter((entity) =>
      entity.hasComponents(
        SystemComponents.Transform,
        SystemComponents.Boundary
      )
    );
    if (!SystemCache.entities.size) return;

    SystemCache.entities.forEach((entity) => {
      const boundary = entity.getComponent(SystemComponents.Boundary);
      if (boundary) {
        switch (boundary.behavior) {
          case SystemBehaviors.CONTAIN:
            this._contain(entity);
            break;
          case SystemBehaviors.WRAP:
            this._wrap(entity);
            break;
          case SystemBehaviors.DIE:
            this._die(entities, entity);
            break;
          case SystemBehaviors.STOP:
            this._stop(entity);
            break;
          case SystemBehaviors.BOUNCE:
            this._bounce(entity);
            break;
          default:
            break;
        }
      }
    });

    SystemCache.entities.clear();
  }
}
