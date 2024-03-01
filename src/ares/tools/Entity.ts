import Cmath from "./Cmath";
import Vector from "./Vector";
import { EntityType, Positionable, Measurable, Collidable } from "../types";

type CollidableEntity = Positionable & Measurable & Collidable;

class Entity {
  /**
   * Computes the center's coordinate
   * of the target entity
   * @param {Object} entity entity type object
   * @returns {Object} the x/y coordinates of the entity's center
   */
  static center(entity: Positionable & Measurable) {
    const { position, width, height } = entity;
    if (!width || !height) {
      throw new Error("Entity must have width and height");
    }
    return new Vector(position.x + width / 2, position.y + height / 2);
  }

  /**
   * Computes the distance (pixels) between the center of entity1
   * and the center of entity2 using CMath.distance
   * @param {Object} entity1 entity type object
   * @param {Object} entity2 entity type object
   * @returns {Number} the distance between the entities
   */
  static distance(
    entity1: Positionable & Measurable,
    entity2: Positionable & Measurable
  ) {
    return Cmath.distance(this.center(entity1), this.center(entity2));
  }

  /**
   * Computes the angle (radians) between the center of entity1
   * and the center of entity2 using CMath.angle
   * @param {Object} entity1 entity type object
   * @param {Object} entity2 entity type object
   * @returns {Number} the angle between the entities
   */
  static angle(
    entity1: Positionable & Measurable,
    entity2: Positionable & Measurable
  ) {
    return Cmath.angle(this.center(entity1), this.center(entity2));
  }

  /**
   * hitBounds() using the hitbox property of the entity
   * @param {*} entity
   * @returns
   */
  static hitBounds(entity: CollidableEntity) {
    const { position, hitbox } = entity;

    if (!hitbox) {
      return {
        x: position.x,
        y: position.y,
        width: entity.width,
        height: entity.height,
      };
    } else {
      return {
        x: position.x + hitbox.x,
        y: position.y + hitbox.y,
        width: hitbox.width,
        height: hitbox.height,
      };
    }
  }

  /**
   * hit()
   * AABB collision detection
   * @param {Entity} mainEntity
   * @param {Entity} targetEntity
   * @param {Function} hitCallback
   */
  static hit(
    mainEntity: CollidableEntity,
    targetEntity: CollidableEntity,
    hitCallback: Function
  ) {
    const mainBounds = this.hitBounds(mainEntity);
    const targetBounds = this.hitBounds(targetEntity);

    if (
      !mainBounds.width ||
      !targetBounds.width ||
      !mainBounds.height ||
      !targetBounds.height
    ) {
      throw new Error("Entity must have width and height");
    }

    if (
      mainBounds.x + mainBounds.width >= targetBounds.x &&
      mainBounds.x <= targetBounds.x + targetBounds.width &&
      mainBounds.y + mainBounds.height >= targetBounds.y &&
      mainBounds.y <= targetBounds.y + targetBounds.height
    ) {
      hitCallback();
    }
  }

  /**
   * hits()
   * AABB collision detection
   * on multiple target entities
   * @param {Entity} mainEntity the main entity (likely the player)
   * @param {Array<Entity>} targetEntities an array of entities
   * @param {Function} hitCallback collision callback
   */
  static hits(
    mainEntity: CollidableEntity,
    targetEntities: CollidableEntity[],
    hitCallback: Function
  ) {
    targetEntities.forEach((targetEntity) => {
      this.hit(mainEntity, targetEntity, hitCallback);
    });
  }
}

export default Entity;
