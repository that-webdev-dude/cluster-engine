import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Vector } from "../../tools/Vector";
import { Components } from "../index";

const OFFSCREEN_BEHAVIOR = {
  CONTAIN: "contain",
  BOUNCE: "bounce",
  STOP: "stop",
  WRAP: "wrap",
  DIE: "die",
};

// cache the entities that have a screen component
let systemEntities: Container<Entity>;
// let offscreenVector: Vector; // 1,0 or -1,0 or 0,1 or 0,-1

export class ScreenSystem extends System {
  private _getEntityWidth(entity: Entity): number {
    const transform = entity.getComponent(Components.Transform);
    const size = entity.getComponent(Components.Size);
    if (transform && size) {
      return size.width * transform.scale.x + transform.anchor.x;
    }
    return 0;
  }

  private _getEntityHeight(entity: Entity): number {
    const transform = entity.getComponent(Components.Transform);
    const size = entity.getComponent(Components.Size);
    if (transform && size) {
      return size.height * transform.scale.y + transform.anchor.y;
    }
    return 0;
  }

  // private _screenCollision(entity: Entity): Vector | null {
  //   const transform = entity.getComponent(Components.Transform);
  //   const screen = entity.getComponent(Components.Screen);
  //   if (transform && screen) {
  //     const entityWidth = this._getEntityWidth(entity);
  //     const entityHeight = this._getEntityHeight(entity);
  //     if (transform.position.x < 0) {
  //       offscreenVector.x = -1;
  //     } else if (transform.position.x + entityWidth > screen.width) {
  //       offscreenVector.x = 1;
  //     } else {
  //       offscreenVector.x = 0;
  //     }

  //     if (transform.position.y < 0) {
  //       offscreenVector.y = -1;
  //     } else if (transform.position.y + entityHeight > screen.height) {
  //       offscreenVector.y = 1;
  //     } else {
  //       offscreenVector.y = 0;
  //     }

  //     return offscreenVector;
  //   }

  //   return null;
  // }

  private _horizontalScreenCollision(entity: Entity): boolean {
    const transform = entity.getComponent(Components.Transform);
    const screen = entity.getComponent(Components.Screen);
    if (transform && screen) {
      const entityWidth = this._getEntityWidth(entity);
      return (
        transform.position.x < 0 ||
        transform.position.x + entityWidth > screen.width
      );
    }
    return false;
  }

  private _verticalScreenCollision(entity: Entity): boolean {
    const transform = entity.getComponent(Components.Transform);
    const screen = entity.getComponent(Components.Screen);
    if (transform && screen) {
      const entityHeight = this._getEntityHeight(entity);
      return (
        transform.position.y < 0 ||
        transform.position.y + entityHeight > screen.height
      );
    }
    return false;
  }

  private _contain(entity: Entity): void {
    const transform = entity.getComponent(Components.Transform);
    const screen = entity.getComponent(Components.Screen);
    if (transform && screen) {
      const entityHeight = this._getEntityHeight(entity);
      const entityWidth = this._getEntityWidth(entity);
      transform.position.x = Math.max(
        0,
        Math.min(transform.position.x, screen.width - entityWidth)
      );
      transform.position.y = Math.max(
        0,
        Math.min(transform.position.y, screen.height - entityHeight)
      );
    }
  }

  private _bounce(entity: Entity): void {
    const transform = entity.getComponent(Components.Transform);
    const velocity = entity.getComponent(Components.Velocity);
    const screen = entity.getComponent(Components.Screen);
    if (transform && velocity && screen) {
      const entityHeight = this._getEntityHeight(entity);
      const entityWidth = this._getEntityWidth(entity);
      if (transform.position.x < 0) {
        transform.position.x = 0;
        velocity.velocity.x *= -1;
      } else if (transform.position.x + entityWidth > screen.width) {
        transform.position.x = screen.width - entityWidth;
        velocity.velocity.x *= -1;
      }

      if (transform.position.y < 0) {
        transform.position.y = 0;
        velocity.velocity.y *= -1;
      } else if (transform.position.y + entityHeight > screen.height) {
        transform.position.y = screen.height - entityHeight;
        velocity.velocity.y *= -1;
      }
    }
  }

  private _stop(entity: Entity): void {
    if (this._horizontalScreenCollision(entity)) {
      this._contain(entity);
      const velocity = entity.getComponent(Components.Velocity);
      if (velocity) {
        velocity.velocity.x = 0;
      }
    }
    if (this._verticalScreenCollision(entity)) {
      this._contain(entity);
      const velocity = entity.getComponent(Components.Velocity);
      if (velocity) {
        velocity.velocity.y = 0;
      }
    }
  }

  private _wrap(entity: Entity): void {
    const transform = entity.getComponent(Components.Transform);
    const screen = entity.getComponent(Components.Screen);
    if (transform && screen) {
      const entityHeight = this._getEntityHeight(entity);
      const entityWidth = this._getEntityWidth(entity);
      if (transform.position.x + entityWidth < 0) {
        transform.position.x = screen.width;
      } else if (transform.position.x > screen.width) {
        transform.position.x = -entityWidth;
      }

      if (transform.position.y + entityHeight < 0) {
        transform.position.y = screen.height;
      } else if (transform.position.y > screen.height) {
        transform.position.y = -entityHeight;
      }
    }
  }

  private _die(entity: Entity): void {
    const transform = entity.getComponent(Components.Transform);
    const screen = entity.getComponent(Components.Screen);
    if (transform && screen) {
      const entityHeight = this._getEntityHeight(entity);
      const entityWidth = this._getEntityWidth(entity);
      if (
        transform.position.x + entityWidth < 0 ||
        transform.position.x > screen.width ||
        transform.position.y + entityHeight < 0 ||
        transform.position.y > screen.height
      ) {
        // entity.dead = true;
      }
    }
  }

  public update(entities: Container<Entity>): void {
    if (!entities.size) return;

    systemEntities = entities.filter((entity) =>
      entity.hasComponent(Components.Screen)
    );
    if (!systemEntities.size) return;

    systemEntities.forEach((entity) => {
      const screen = entity.getComponent(Components.Screen);
      if (screen) {
        switch (screen.offscreenBehavior) {
          case OFFSCREEN_BEHAVIOR.CONTAIN:
            this._contain(entity);
            break;
          case OFFSCREEN_BEHAVIOR.BOUNCE:
            this._bounce(entity);
            break;
          case OFFSCREEN_BEHAVIOR.WRAP:
            this._wrap(entity);
            break;
          case OFFSCREEN_BEHAVIOR.DIE:
            this._die(entity);
            break;
          case OFFSCREEN_BEHAVIOR.STOP:
            this._stop(entity);
            break;
          default:
            console.warn(
              `[ScreenSystem] Unknown offscreen behavior: ${screen.offscreenBehavior}`
            );
        }
      }
    });

    systemEntities.clear();
  }
}
