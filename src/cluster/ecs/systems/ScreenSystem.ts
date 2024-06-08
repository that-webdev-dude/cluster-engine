import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Components } from "../index";

const OFFSCREEN_BEHAVIOR = {
  CONTAIN: "contain",
  WRAP: "wrap",
  DIE: "die",
};

/**
 * Represents a system responsible for handling screen-related behaviors.
 */
export class ScreenSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;
  }

  private _contain(entity: Entity, maxWidth: number, maxHeight: number): void {
    const transform = entity.getComponent(Components.Transform);
    if (transform) {
      transform.position.x = Math.max(
        0,
        Math.min(transform.position.x, maxWidth)
      );
      transform.position.y = Math.max(
        0,
        Math.min(transform.position.y, maxHeight)
      );
    }
  }

  private _wrap(entity: Entity, maxWidth: number, maxHeight: number): void {
    const transform = entity.getComponent(Components.Transform);
    if (transform) {
      if (transform.position.x < 0) {
        transform.position.x = maxWidth;
      } else if (transform.position.x > maxWidth) {
        transform.position.x = 0;
      }

      if (transform.position.y < 0) {
        transform.position.y = maxHeight;
      } else if (transform.position.y > maxHeight) {
        transform.position.y = 0;
      }
    }
  }

  private _die(
    entity: Entity,
    screenWidth: number,
    screenHeight: number
  ): void {
    const transform = entity.getComponent(Components.Transform);
    const status = entity.getComponent(Components.Status);
    if (transform && status && !status.dead) {
      if (
        transform.position.x < 0 ||
        transform.position.x > screenWidth ||
        transform.position.y < 0 ||
        transform.position.y > screenHeight
      ) {
        status.dead = true;
        this._entities.delete(entity);
      }
    }
  }

  update(): void {
    if (!this._entities.size) return;

    this._entities.forEach((entity) => {
      const screen = entity.getComponent(Components.Screen);
      if (screen) {
        const maxWidth =
          screen.width -
          (screen.offscreenBehavior === OFFSCREEN_BEHAVIOR.CONTAIN
            ? screen.entityWidth
            : 0);
        const maxHeight =
          screen.height -
          (screen.offscreenBehavior === OFFSCREEN_BEHAVIOR.CONTAIN
            ? screen.entityHeight
            : 0);

        switch (screen.offscreenBehavior) {
          case OFFSCREEN_BEHAVIOR.CONTAIN:
            this._contain(entity, maxWidth, maxHeight);
            break;
          case OFFSCREEN_BEHAVIOR.WRAP:
            this._wrap(entity, screen.width, screen.height);
            break;
          case OFFSCREEN_BEHAVIOR.DIE:
            this._die(entity, screen.width, screen.height);
            break;
          default:
            console.warn(
              `[ScreenSystem] Unknown offscreen behavior: ${screen.offscreenBehavior}`
            );
        }
      }
    });
  }
}
