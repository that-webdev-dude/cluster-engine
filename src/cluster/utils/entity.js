import Rect from "../core/Rect";
import math from "./math";

/**
 * center()
 * @param {*} entity
 * @returns
 */
function center(entity) {
  const { position, width, height } = entity;
  return {
    x: position.x + width / 2,
    y: position.y + height / 2,
  };
}

/**
 * distance()
 * Circle based collision detection
 * @param {*} entity1
 * @param {*} entity2
 * @returns
 */
function distance(entity1, entity2) {
  return math.distance(center(entity1), center(entity2));
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

export default { center, distance, debug, hitBounds, hit, hits };
