import Vector from "../tools/Vector";

type Ray = {
  origin: Vector;
  direction: Vector;
};

type RectEntity = {
  position: Vector;
  height: number;
  width: number;
  center: Vector;
  direction: Vector;
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
    target: RectEntity
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

  private static _rayVsRect(
    rayOrigin: Vector,
    rayDirection: Vector,
    target: RectEntity
  ): Collision {
    const { position, width, height } = target;

    if (rayDirection.x === 0 && rayDirection.y === 0)
      return AABB.NULL_COLLISION;

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
  }

  public static detect(
    source: RectEntity,
    target: RectEntity,
    resolver: (contact: Vector, normal: Vector, time: number) => void
  ) {
    // this can be cached if needs to be done here
    let targetRect = {
      position: target.position
        .clone()
        .subtract(new Vector(source.width * 0.5, source.height * 0.5)),
      width: target.width + source.width,
      height: target.height + source.height,
      center: target.center,
      direction: target.direction,
    };
    let rayOrigin = source.center;
    let rayDirection = source.direction;

    let { collision, contact, normal, time } = AABB._rayVsRect(
      rayOrigin,
      rayDirection,
      targetRect
    );

    if (collision && contact && normal && time && time < 1) {
      resolver(contact, normal, time);
    }
  }

  // public static rectVsRect(main: DynamicEntity, target: RectEntity): boolean {
  //   return (
  //     main.position.x + main.width > target.position.x &&
  //     main.position.x < target.position.x + target.width &&
  //     main.position.y + main.height > target.position.y &&
  //     main.position.y < target.position.y + target.height
  //   );
  // }

  // public static pointVsRect(point: Vector, rect: RectEntity): boolean {
  //   return (
  //     point.x >= rect.position.x &&
  //     point.x <= rect.position.x + rect.width &&
  //     point.y >= rect.position.y &&
  //     point.y <= rect.position.y + rect.height
  //   );
  // }
}

export default AABB;
