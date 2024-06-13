import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Components } from "../index";

export class CollisionSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;
  }

  private _checkCollision(entity: Entity, other: Entity) {
    const hitbox1 = entity.getComponent(Components.Hitbox);
    const hitbox2 = other.getComponent(Components.Hitbox);

    if (hitbox1 && hitbox2) {
      // handle exclusions
      if (
        hitbox1.exclude.includes(other.type) ||
        hitbox2.exclude.includes(entity.type)
      ) {
        return false;
      }

      return (
        hitbox1.x < hitbox2.x + hitbox2.width &&
        hitbox1.x + hitbox1.width > hitbox2.x &&
        hitbox1.y < hitbox2.y + hitbox2.height &&
        hitbox1.y + hitbox1.height > hitbox2.y
      );
    }

    return false;
  }

  update(): void {
    this._entities.forEach((entity: Entity) => {
      if (entity.hasComponent(Components.Hitbox)) {
        this._entities.forEach((other: Entity) => {
          if (entity !== other && other.hasComponent(Components.Hitbox)) {
            if (this._checkCollision(entity, other)) {
              // console.log("collision");
              // entity.emit("collision", other);
              this._entities.remove(entity, other);
            }
          }
        });
      }
    });
  }
}
