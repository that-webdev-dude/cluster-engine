import Rect from "../core/Rect";
import math from "./math";

/**
 * Computes the center's coordinate
 * of the target entity
 * @param {Object} entity entity type object
 * @returns {Object} the x/y coordinates of the entity's center
 */
function center(entity) {
  const { position, width, height } = entity;
  return {
    x: position.x + width / 2,
    y: position.y + height / 2,
  };
}

/**
 * Computes the distance (pixels) between the center of entity1
 * and the center of entity2
 * @param {Object} entity1 entity type object
 * @param {Object} entity2 entity type object
 * @returns {Number} the distance between the entities
 */
function distance(entity1, entity2) {
  return math.distance(center(entity1), center(entity2));
}

/**
 * Computes the angle (radians) between the center of entity1
 * and the center of entity2
 * @param {Object} entity1 entity type object
 * @param {Object} entity2 entity type object
 * @returns {Number} the angle between the entities
 */
function angle(entity1, entity2) {
  return math.angle(center(entity1), center(entity2));
}

/**
 * hitBounds()
 * @param {*} entity
 * @returns
 */
function hitBounds(entity) {
  const { position, hitbox } = entity;
  return {
    x: position.x + hitbox.x,
    y: position.y + hitbox.y,
    width: hitbox.width,
    height: hitbox.height,
  };
}

/**
 * hit()
 * AABB collision detection
 * @param {Entity} mainEntity
 * @param {Entity} targetEntity
 * @param {Function} hitCallback
 */
function hit(mainEntity, targetEntity, hitCallback) {
  const a = hitBounds(mainEntity);
  const b = hitBounds(targetEntity);
  if (
    a.x + a.width >= b.x &&
    a.x <= b.x + b.width &&
    a.y + a.height >= b.y &&
    a.y <= b.y + b.height
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
function hits(mainEntity, targetEntities, hitCallback) {
  targetEntities.forEach((targetEntity) => {
    hit(mainEntity, targetEntity, hitCallback);
  });
}

/**
 * debug()
 * @param {*} entity
 * @returns
 */
function debug(entity) {
  entity.children = entity.children || [];
  const boundingbox = new Rect({
    height: entity.height,
    width: entity.width,
    style: { fill: "rgba(255,255,0,0.25)" },
  });

  const hitbox = new Rect({
    width: entity.hitbox.width,
    height: entity.hitbox.height,
    style: { fill: "rgba(255,0,0,0.25)" },
  });
  hitbox.position.x = entity.hitbox.x;
  hitbox.position.y = entity.hitbox.y;

  entity.children.push(boundingbox);
  entity.children.push(hitbox);
  return entity;
}

export default {
  center,
  distance,
  angle,
  debug,
  hitBounds,
  hit,
  hits,
};
