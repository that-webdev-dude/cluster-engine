import Vector from "../tools/Vector";

type StaticEntity = {
  position: Vector;
  width: number;
  height: number;
};

type DynamicEntity = StaticEntity & {
  acceleration: Vector;
  velocity: Vector;
  mass?: number;
};

type Collision = {
  collision: boolean;
  contact?: Vector | null;
  normal?: Vector | null;
  time?: number | 0;
};

class AABB {
  private static readonly RAY_LENGTH_LIMIT = 1;
  private static readonly NULL_COLLISION = {
    collision: false,
  };

  public static pointVsRect(point: Vector, rect: StaticEntity): boolean {
    if (
      point.x >= rect.position.x &&
      point.x <= rect.position.x + rect.width &&
      point.y >= rect.position.y &&
      point.y <= rect.position.y + rect.height
    ) {
      return true;
    }
    return false;
  }

  public _rectVsRect(rectA: DynamicEntity, rectB: StaticEntity): boolean {
    return (
      rectA.position.x + rectA.width >= rectB.position.x &&
      rectA.position.x <= rectB.position.x + rectB.width &&
      rectA.position.y + rectA.height >= rectB.position.y &&
      rectA.position.y <= rectB.position.y + rectB.height
    );
  }

  private static _rayVsRectCollisionContact(
    origin: Vector,
    direction: Vector,
    time: number
  ): Vector {
    return new Vector(
      origin.x + time * direction.x,
      origin.y + time * direction.y
    );
  }

  private static _rayVsRectCollisionNormal(
    collisionPoint: Vector,
    target: StaticEntity
  ): Vector {
    let normal = new Vector(0, 0);
    if (collisionPoint.y === target.position.y) {
      normal.y = -1;
    }
    if (collisionPoint.y === target.position.y + target.height) {
      normal.y = 1;
    }
    if (collisionPoint.x === target.position.x) {
      normal.x = -1;
    }
    if (collisionPoint.x === target.position.x + target.width) {
      normal.x = 1;
    }
    return normal;
  }

  // LONE CODER IMPLEMENTATION
  public static _rayVsRectV1(
    rayOrigin: Vector,
    rayDirection: Vector,
    target: StaticEntity
  ): Collision {
    const { position, width, height } = target;

    if (rayDirection.x === 0 && rayDirection.y === 0)
      return AABB.NULL_COLLISION;
    console.log("rayDirection:", rayDirection);

    let tNearX = (position.x - rayOrigin.x) / rayDirection.x;
    let tNearY = (position.y - rayOrigin.y) / rayDirection.y;
    let tFarX = (position.x + width - rayOrigin.x) / rayDirection.x;
    let tFarY = (position.y + height - rayOrigin.y) / rayDirection.y;

    // check for infinity

    if (tNearX > tFarX) {
      [tNearX, tFarX] = [tFarX, tNearX];
    }
    if (tNearY > tFarY) {
      [tNearY, tFarY] = [tFarY, tNearY];
    }
    if (tNearX > tFarY || tNearY > tFarX) return AABB.NULL_COLLISION;

    let tHitNear = Math.max(tNearX, tNearY);
    let tHitFar = Math.min(tFarX, tFarY);
    if (tHitFar < 0) return AABB.NULL_COLLISION;

    // if (tHitNear <= AABB.RAY_LENGTH_LIMIT) {
    let contact = AABB._rayVsRectCollisionContact(
      rayOrigin,
      rayDirection,
      tHitNear
    );

    let normal = AABB._rayVsRectCollisionNormal(contact, target);

    return (
      this,
      {
        collision: true,
        contact: contact,
        normal: normal,
        time: tHitNear,
      }
    );
    // }
    // return AABB.NULL_COLLISION;
  }

  // SOME NERD ONLINE IMPLEMENTATION
  public static _rayVsRectV2(
    rayOrigin: Vector,
    direction: Vector,
    target: StaticEntity
  ): Collision {
    const { position, width, height } = target;

    let minIntersectionTime = 0;
    let maxIntersectionTime = 0;

    let tNearX = (position.x - rayOrigin.x) / -direction.x;
    let tNearY = (position.y - rayOrigin.y) / -direction.y;

    let tFarX = (position.x + width - rayOrigin.x) / -direction.x;
    let tFarY = (position.y + height - rayOrigin.y) / -direction.y;

    // check for infinity

    minIntersectionTime = Math.max(
      Math.min(tNearX, tFarX),
      Math.min(tNearY, tFarY)
    );
    maxIntersectionTime = Math.min(
      Math.max(tNearX, tFarX),
      Math.max(tNearY, tFarY)
    );

    if (
      Math.abs(maxIntersectionTime) <= AABB.RAY_LENGTH_LIMIT &&
      maxIntersectionTime >= minIntersectionTime
    ) {
      let contact = AABB._rayVsRectCollisionContact(
        rayOrigin,
        direction,
        maxIntersectionTime
      );
      let normal = AABB._rayVsRectCollisionNormal(contact, target);

      return {
        collision: true,
        contact,
        normal,
        time: maxIntersectionTime,
      };
    }

    return AABB.NULL_COLLISION;
  }
}

export default AABB;
