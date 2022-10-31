// import math from "./math";

class PhysicsWorld {
  // TODO
  // - applyGravity
  // - add world friction & gravity constants
  // - rotational forces?

  /**
   * apply a force to entity
   * @param {*} entity
   * @param {*} force
   */
  static applyForce(entity, force) {
    const { acceleration: acc, mass = 1 } = entity;
    acc.x += force.x / mass;
    acc.y += force.y / mass;
  }

  /**
   * apply friction to entity
   * @param {Entity} entity
   * @param {Number} friction
   */
  static applyFriction(entity, friction) {
    this.applyForce(entity, entity.velocity.clone().unit().reverse().scale(friction));
  }

  /**
   * apply an impulse (a one-off) to this entity
   * @param {*} entity
   * @param {*} force
   * @param {*} dt
   */
  static applyImpulse(entity, force, dt) {
    this.applyForce(entity, { x: force.x / dt, y: force.y / dt });
  }

  /**
   * getDisplacement
   * @param {*} entity
   * @param {*} dt
   * @returns
   */
  static getDisplacement(entity, dt) {
    const { position: pos, velocity: vel, acceleration: acc } = entity;
    const vx = vel.x + acc.x * dt;
    const vy = vel.y + acc.y * dt;
    const x = ((vel.x + vx) / 2) * dt;
    const y = ((vel.y + vy) / 2) * dt;
    vel.set(vx, vy);
    acc.set(0, 0);
    return { x, y };
  }

  /**
   * reposition
   * @param {*} entity
   * @param {*} dt
   */
  static reposition(entity, dt) {
    entity.position.add(this.getDisplacement(entity, dt));
  }
}

class Physics {
  /**
   * World
   */
  static World = PhysicsWorld;

  /**
   * point to point distance data
   * @param {Vector} sourcePoint source point
   * @param {Vector} targetPoint target point
   * @returns {{distance: Vector}} data object
   */
  static distance_pp(sourcePoint, targetPoint) {
    return {
      distance: sourcePoint.to(targetPoint),
    };
  }

  /**
   * circle to circle collision detection
   * @param {Circle} source source circle
   * @param {Circle} target target circle
   * @returns {*} data object
   */
  static detectCollision_cc(source, target) {
    let { distance } = this.distance_pp(source.position, target.position);
    let minDistance = source.radius + target.radius;
    let collision = distance.magnitude <= minDistance;
    if (collision) {
      let penetrationDepth = minDistance - distance.magnitude;
      let collisionNormal = distance.clone().unit();
      let collisionPointSource = source.position
        .clone()
        .add(collisionNormal.clone().scale(source.radius));
      let collisionPointTarget = target.position
        .clone()
        .subtract(collisionNormal.clone().scale(target.radius));
      return {
        source,
        target,
        collision,
        collisionNormal,
        collisionPointSource,
        collisionPointTarget,
        penetrationDepth,
      };
    } else {
      return false;
    }
  }

  /**
   * circle to cicrle penetration resolution
   * @param {*} collisionData
   */
  static resolvePenetration_cc(collisionData) {
    let { source, target, collisionNormal, penetrationDepth } = collisionData;
    let resolutionVector = collisionNormal
      .clone()
      .scale(penetrationDepth / (source.inverseMass + target.inverseMass));

    source.position.subtract(resolutionVector.clone().scale(source.inverseMass));
    target.position.subtract(resolutionVector.clone().scale(-target.inverseMass));
  }

  /**
   * circle to cicrle collision resolution
   * @param {*} collisionData
   */
  static resolveCollision_cc(collisionData) {
    let { source, target, collisionNormal } = collisionData;
    let relativeVelocity = target.velocity.to(source.velocity);
    let separatingVelocity = relativeVelocity.dot(collisionNormal);
    let separatingVelocityScaled =
      -separatingVelocity * Math.min(source.elasticity, target.elasticity);
    let separatingVelocityDifference = separatingVelocityScaled - separatingVelocity;

    let impulse = separatingVelocityDifference / (source.inverseMass + target.inverseMass);
    let impulseVector = collisionNormal.scale(impulse);

    source.velocity.add(impulseVector.clone().scale(source.inverseMass));
    target.velocity.add(impulseVector.clone().scale(-target.inverseMass));

    // my
    // let resolutionVelocity = collisionNormal.clone().scale(separatingVelocity);
    // source.velocity.subtract(resolutionVelocity);
    // target.velocity.add(resolutionVelocity);
  }

  // /**
  //  *
  //  *
  //  * physics math utilities
  //  */

  // /**
  //  * closestPoint_pl - point to line closest distance
  //  * @param {Vector} sourcePoint source point
  //  * @param {Line} targetLine target line
  //  * @returns {{start: Vector, end: Vector}} closest point data object
  //  */
  // static closestPoint_pl(sourcePoint, targetLine) {
  //   /** info
  //    * 1. get the line segment direction ('lineDirection' start → end)
  //    * 2. connect the point to the line start ('pointToLineStart' point → line start)
  //    * 3. connect the point to the line end ('pointToLineEnd' point → line end)
  //    * 4. evaluates the |pointToLineStart| dot |lineDirection|
  //    * 5. special cases:
  //    *    - return pointToLineStart if dot is > 0
  //    *    - return pointToLineEnd if dot is < 0
  //    * 6. else, project the pointToLineStart on the lineDirection (closestDistance)
  //    * 7. scale the lineDirection by the closestDistance & return
  //    */
  //   let closestData = { start: sourcePoint, end: null };
  //   let lineDirection = targetLine.start.to(targetLine.end).unit();
  //   let pointToLineStart = sourcePoint.to(targetLine.start);
  //   if (pointToLineStart.dot(lineDirection) > 0) {
  //     closestData.end = pointToLineStart;
  //     return closestData;
  //   }

  //   let pointToLineEnd = sourcePoint.to(targetLine.end);
  //   if (pointToLineEnd.dot(lineDirection) < 0) {
  //     closestData.end = pointToLineEnd;
  //     return closestData;
  //   }

  //   let closestDistance = pointToLineStart.dot(lineDirection);
  //   let closestVector = lineDirection.scale(closestDistance);
  //   closestData.end = closestVector.to(pointToLineStart);
  //   return closestData;
  // }

  // /**
  //  * closestPoint_ll - line to line closest distance
  //  * @param {Line} l1 source line
  //  * @param {Line} l2 target line
  //  * @returns {{start: Vector, end: Vector}} closest point data object
  //  */
  // static closestPoint_ll(sourceLine, targetLine) {
  //   /** info
  //    *
  //    */
  //   let points = ["start", "end"];
  //   let lines = [sourceLine, targetLine];
  //   let data = null;

  //   lines.forEach((line, index) => {
  //     let backIndex = lines.length - (index + 1);
  //     points.forEach((point) => {
  //       let end = this.closestPoint_pl(line[point], lines[backIndex]).end;
  //       let start = line[point];
  //       if (!data || data?.end.magnitude > end.magnitude) {
  //         data = { start, end };
  //       }
  //     });
  //   });

  //   return data;
  // }

  // /**
  //  *
  //  *
  //  * circle → line
  //  */

  // /**
  //  * circle to wall collision detector
  //  * @param {*} c
  //  * @param {*} l
  //  * @returns Boolean
  //  */
  // static collisionDetection_cl(c, l) {
  //   /**
  //    * 1. get the distance circle → wall (currentDist)
  //    * 2. get the minimum allowed distance (minimumDist),
  //    * 3. if currentDist < minimumDist there's a collision
  //    */
  //   let currentDist = this.closestPoint_pl(c, l).magnitude;
  //   let minimumDist = c.radius;
  //   return currentDist < minimumDist;
  // }

  // /**
  //  * circle to wall penetration resolver
  //  * @param {*} c
  //  * @param {*} l
  //  */
  // static penetrationResolution_cl(c, l) {
  //   /**
  //    * 1. get the normal vector circle → wall (normalVec)
  //    * 2. the difference between c.radius & normal magnitude,
  //    *    is the penetration amount (depthMag)
  //    * 3. get the reversed unit of normal (depthDir)
  //    * 4. compute the resVec along the depthDir
  //    * 5. add resVec to the circle position
  //    */

  //   let normalVec = this.closestPoint_pl(c, l);
  //   let depthMag = c.radius - normalVec.magnitude;
  //   let depthDir = normalVec.unit().reverse();
  //   let resVec = depthDir.scale(depthMag);
  //   c.position.add(resVec);
  // }

  // /**
  //  * circle to wall collision resolver
  //  * @param {*} c
  //  * @param {*} l
  //  */
  // static collisionResolution_cl(c, l) {
  //   /**
  //    * 1. get the normal direction circle → wall (normalDir)
  //    * 2. project the ball velocity on the normal (normalMag) & reverse it
  //    * 3. scale the normalMag by the ball elasticity (scaledMag)
  //    * 4. add the normal and scaled magnitudes (totalMag).
  //    *    thie is equal to twice the normalMag if elasticity is 1
  //    *    and will be always a negative scalar.
  //    * 5. compute the resVec along the normal direction
  //    * 6. add resVec to the circle velocity
  //    */
  //   let normalDir = this.closestPoint_pl(c, l).unit().reverse();
  //   let normalMag = -c.velocity.dot(normalDir);
  //   let scaledMag = normalMag * c.elasticity;
  //   let totalMag = normalMag + scaledMag;
  //   let resVec = normalDir.scale(totalMag);
  //   c.velocity.add(resVec);
  // }

  // /**
  //  *
  //  *
  //  * Capsule → Capsule
  //  */

  // /**
  //  * capsule to capsule collision detector
  //  * @param {*} c1
  //  * @param {*} c2
  //  * @returns Boolean
  //  */
  // static collisionDetection_cpcp(cp1, cp2) {
  //   let collisionVector = this.closestPoint_ll(cp1, cp2);
  //   let collisionStatus = collisionVector.length <= cp1.radius + cp2.radius;
  //   if (collisionStatus) {
  //     return new CollisionData(collisionStatus, collisionVector, {
  //       source: cp1,
  //       target: cp2,
  //     });
  //   } else {
  //     return false;
  //   }
  // }

  // /**
  //  * capsule to capsule penetration resolver
  //  * @param {*} c1
  //  * @param {*} c2
  //  */
  // static penetrationResolution_cpcp(collisionData) {
  //   let { vector, shapes } = collisionData;
  //   let { source, target } = shapes;

  //   let penetrationDepth = source.radius + target.radius - vector.length;
  //   let penetrationVector = vector.start
  //     .to(vector.end)
  //     .unit()
  //     .scale(penetrationDepth / (source.inverseMass + target.inverseMass));

  //   source.position.add(penetrationVector.clone().scale(source.inverseMass));
  //   target.position.add(penetrationVector.clone().scale(-target.inverseMass));

  //   // let penetrationResolution = distanceVector
  //   //   .unit()
  //   //   .scale(penetrationDepth / (cp1.inverseMass + cp2.inverseMass));

  //   // cp1.position.add(penetrationResolution.scale(cp1.inverseMass));
  //   // cp2.position.add(penetrationResolution.scale(-cp2.inverseMass));

  //   // let distanceVector = cp1.position.clone().subtract(cp2.position);
  //   // let penetrationDepth = minDistance - distanceVector.magnitude;
  //   // let penetrationResolution = distanceVector
  //   //   .unit()
  //   //   .scale(penetrationDepth / (cp1.inverseMass + cp2.inverseMass));

  //   // cp1.position.add(penetrationResolution.scale(cp1.inverseMass));
  //   // cp2.position.add(penetrationResolution.scale(-cp2.inverseMass));
  // }
}

export default Physics;
