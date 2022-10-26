import math from "./math";
// TODO
// - applyGravity
// - add world friction & gravity constants
// - rotational forces?

class PhysicsWorld {
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
  static World = PhysicsWorld;

  /**
   * point to point distance data
   * @param {Vector} sourcePoint source point
   * @param {Vector} targetPoint target point
   * @returns {{distanceStart: Vector, distanceEnd: Vector, distance: Vector}} data object
   */
  static distance_pp(sourcePoint, targetPoint) {
    return {
      // distanceStart: sourcePoint,
      // distanceEnd: targetPoint,
      distance: sourcePoint.to(targetPoint),
    };
  }

  /**
   * circle to circle collision detection
   * @param {Circle} source source circle
   * @param {Circle} target target circle
   * @returns {{distanceStart: Vector, distanceEnd: Vector, distance: Vector, collision: Boolean, source: Circle, target: Circle}} data object
   */
  static detectCollision_cc(source, target) {
    let { distance } = this.distance_pp(source.position, target.position);
    let minDistance = source.radius + target.radius;
    let collision = distance.magnitude <= minDistance;
    if (collision) {
      // return { ...data, collision, source: source, target: target };
      // need to return
      // collisionPoint
      // collisionNormal
      // penetrationDistance
      let penetrationDepth = minDistance - distance.magnitude;
      let collisionNormal = distance.clone().unit();
      let collisionPointSource = 0;
      let collisionPointTarget = 0;
      return { collision, penetrationDepth, collisionNormal, collisionPoint };
    } else {
      return false;
    }
  }

  /**
   * circle to cicrle penetration resolution
   * @param {{distanceStart: Vector, distanceEnd: Vector, distance: Vector, collision: Boolean, source: Circle, target: Circle}} collisionData_cc
   */
  static resolvePenetration_cc(collisionData_cc) {
    let { source, target, distance } = collisionData_cc;
    let minDistance = source.radius + target.radius;
    let penetrationDepth = minDistance - distance.magnitude;
    let penetrationResolution = distance
      .clone()
      .unit()
      .scale(penetrationDepth / (source.inverseMass + target.inverseMass));

    source.position.add(penetrationResolution.scale(source.inverseMass));
    target.position.add(penetrationResolution.scale(-target.inverseMass));
  }

  /**
   * resolveCollision_cc
   * @param {*} collisionData_cc
   * @param {*} dt
   */
  static resolveCollision_cc(collisionData_cc, dt) {
    let { source, target } = collisionData_cc;

    let collisionNormal = source.position.clone().subtract(target.position).unit();
    let relativeVelocity = source.velocity.clone().subtract(target.velocity);
    let separatingVelocity = relativeVelocity.dot(collisionNormal);
    let separatingVelocityScaled =
      -separatingVelocity * Math.min(source.elasticity, target.elasticity);
    let separatingVelocityDifference = separatingVelocityScaled - separatingVelocity;

    let impulse = separatingVelocityDifference / (source.inverseMass + target.inverseMass);
    let impulseVector = collisionNormal.scale(impulse);

    source.velocity.add(impulseVector.clone().scale(source.inverseMass));
    target.velocity.add(impulseVector.clone().scale(-target.inverseMass));
  }

  /**
   *
   *
   * physics math utilities
   */

  /**
   * closestPoint_pp - point to point closest distance
   * @param {Vector} sourcePoint point 1
   * @param {Vector} targetPoint point 2
   * @returns {{start: Vector, end: Vector}} closest point data object
   */
  static closestPoint_pp(sourcePoint, targetPoint) {
    /** info
     *
     */
    let closestData = { start: sourcePoint, end: null };
    closestData.end = sourcePoint.to(targetPoint);
    return closestData;
  }

  /**
   * closestPoint_pl - point to line closest distance
   * @param {Vector} sourcePoint source point
   * @param {Line} targetLine target line
   * @returns {{start: Vector, end: Vector}} closest point data object
   */
  static closestPoint_pl(sourcePoint, targetLine) {
    /** info
     * 1. get the line segment direction ('lineDirection' start → end)
     * 2. connect the point to the line start ('pointToLineStart' point → line start)
     * 3. connect the point to the line end ('pointToLineEnd' point → line end)
     * 4. evaluates the |pointToLineStart| dot |lineDirection|
     * 5. special cases:
     *    - return pointToLineStart if dot is > 0
     *    - return pointToLineEnd if dot is < 0
     * 6. else, project the pointToLineStart on the lineDirection (closestDistance)
     * 7. scale the lineDirection by the closestDistance & return
     */
    let closestData = { start: sourcePoint, end: null };
    let lineDirection = targetLine.start.to(targetLine.end).unit();
    let pointToLineStart = sourcePoint.to(targetLine.start);
    if (pointToLineStart.dot(lineDirection) > 0) {
      closestData.end = pointToLineStart;
      return closestData;
    }

    let pointToLineEnd = sourcePoint.to(targetLine.end);
    if (pointToLineEnd.dot(lineDirection) < 0) {
      closestData.end = pointToLineEnd;
      return closestData;
    }

    let closestDistance = pointToLineStart.dot(lineDirection);
    let closestVector = lineDirection.scale(closestDistance);
    closestData.end = closestVector.to(pointToLineStart);
    return closestData;
  }

  /**
   * closestPoint_ll - line to line closest distance
   * @param {Line} l1 source line
   * @param {Line} l2 target line
   * @returns {{start: Vector, end: Vector}} closest point data object
   */
  static closestPoint_ll(sourceLine, targetLine) {
    /** info
     *
     */
    let points = ["start", "end"];
    let lines = [sourceLine, targetLine];
    let data = null;

    lines.forEach((line, index) => {
      let backIndex = lines.length - (index + 1);
      points.forEach((point) => {
        let end = this.closestPoint_pl(line[point], lines[backIndex]).end;
        let start = line[point];
        if (!data || data?.end.magnitude > end.magnitude) {
          data = { start, end };
        }
      });
    });

    return data;
  }

  /**
   *
   *
   * collision circle → circle
   */

  /**
   * collisionDetection_cc
   * @param {*} a
   * @param {*} b
   * @returns
   */
  static collisionDetection_cc(sourceCircle, targetCircle) {
    let minDistance = sourceCircle.radius + targetCircle.radius;
    let sourceToTargetData = this.closestPoint_pp(sourceCircle.position, targetCircle.position);
    return sourceToTargetData.end.magnitude <= minDistance;
  }

  /**
   * penetrationResolution_cc
   * @param {*} a
   * @param {*} b
   */
  // static penetrationResolution_cc(a, b) {
  //   let minDistance = a.radius + b.radius;
  //   let distanceVector = a.position.clone().subtract(b.position);
  //   let penetrationDepth = minDistance - distanceVector.magnitude;
  //   let penetrationResolution = distanceVector
  //     .unit()
  //     .scale(penetrationDepth / (a.inverseMass + b.inverseMass));

  //   a.position.add(penetrationResolution.scale(a.inverseMass));
  //   b.position.add(penetrationResolution.scale(-b.inverseMass));
  // }
  static penetrationResolution_cc(a, b) {
    let minDistance = a.radius + b.radius;
    let distanceVector = a.position.clone().subtract(b.position);
    let penetrationDepth = minDistance - distanceVector.magnitude;
    let penetrationResolution = distanceVector
      .unit()
      .scale(penetrationDepth / (a.inverseMass + b.inverseMass));

    a.position.add(penetrationResolution.scale(a.inverseMass));
    b.position.add(penetrationResolution.scale(-b.inverseMass));
  }

  /**
   * collisionResolution_cc
   * @param {*} a
   * @param {*} b
   */
  static collisionResolution_cc(a, b) {
    let collisionNormal = a.position.clone().subtract(b.position).unit();
    let relativeVelocity = a.velocity.clone().subtract(b.velocity);
    let separatingVelocity = relativeVelocity.dot(collisionNormal);
    let separatingVelocityScaled = -separatingVelocity * Math.min(a.elasticity, b.elasticity);
    let separatingVelocityDifference = separatingVelocityScaled - separatingVelocity;

    let impulse = separatingVelocityDifference / (a.inverseMass + b.inverseMass);
    let impulseVector = collisionNormal.scale(impulse);

    a.velocity.add(impulseVector.scale(a.inverseMass));
    b.velocity.add(impulseVector.scale(-b.inverseMass));
  }

  /**
   *
   *
   * circle → line
   */

  /**
   * circle to wall collision detector
   * @param {*} c
   * @param {*} l
   * @returns Boolean
   */
  static collisionDetection_cl(c, l) {
    /**
     * 1. get the distance circle → wall (currentDist)
     * 2. get the minimum allowed distance (minimumDist),
     * 3. if currentDist < minimumDist there's a collision
     */
    let currentDist = this.closestPoint_pl(c, l).magnitude;
    let minimumDist = c.radius;
    return currentDist < minimumDist;
  }

  /**
   * circle to wall penetration resolver
   * @param {*} c
   * @param {*} l
   */
  static penetrationResolution_cl(c, l) {
    /**
     * 1. get the normal vector circle → wall (normalVec)
     * 2. the difference between c.radius & normal magnitude,
     *    is the penetration amount (depthMag)
     * 3. get the reversed unit of normal (depthDir)
     * 4. compute the resVec along the depthDir
     * 5. add resVec to the circle position
     */

    let normalVec = this.closestPoint_pl(c, l);
    let depthMag = c.radius - normalVec.magnitude;
    let depthDir = normalVec.unit().reverse();
    let resVec = depthDir.scale(depthMag);
    c.position.add(resVec);
  }

  /**
   * circle to wall collision resolver
   * @param {*} c
   * @param {*} l
   */
  static collisionResolution_cl(c, l) {
    /**
     * 1. get the normal direction circle → wall (normalDir)
     * 2. project the ball velocity on the normal (normalMag) & reverse it
     * 3. scale the normalMag by the ball elasticity (scaledMag)
     * 4. add the normal and scaled magnitudes (totalMag).
     *    thie is equal to twice the normalMag if elasticity is 1
     *    and will be always a negative scalar.
     * 5. compute the resVec along the normal direction
     * 6. add resVec to the circle velocity
     */
    let normalDir = this.closestPoint_pl(c, l).unit().reverse();
    let normalMag = -c.velocity.dot(normalDir);
    let scaledMag = normalMag * c.elasticity;
    let totalMag = normalMag + scaledMag;
    let resVec = normalDir.scale(totalMag);
    c.velocity.add(resVec);
  }

  /**
   *
   *
   * Capsule → Capsule
   */

  /**
   * capsule to capsule collision detector
   * @param {*} c1
   * @param {*} c2
   * @returns Boolean
   */
  static collisionDetection_cpcp(cp1, cp2) {
    let collisionVector = this.closestPoint_ll(cp1, cp2);
    let collisionStatus = collisionVector.length <= cp1.radius + cp2.radius;
    if (collisionStatus) {
      return new CollisionData(collisionStatus, collisionVector, {
        source: cp1,
        target: cp2,
      });
    } else {
      return false;
    }
  }

  /**
   * capsule to capsule penetration resolver
   * @param {*} c1
   * @param {*} c2
   */
  static penetrationResolution_cpcp(collisionData) {
    let { vector, shapes } = collisionData;
    let { source, target } = shapes;

    let penetrationDepth = source.radius + target.radius - vector.length;
    let penetrationVector = vector.start
      .to(vector.end)
      .unit()
      .scale(penetrationDepth / (source.inverseMass + target.inverseMass));

    source.position.add(penetrationVector.clone().scale(source.inverseMass));
    target.position.add(penetrationVector.clone().scale(-target.inverseMass));

    // let penetrationResolution = distanceVector
    //   .unit()
    //   .scale(penetrationDepth / (cp1.inverseMass + cp2.inverseMass));

    // cp1.position.add(penetrationResolution.scale(cp1.inverseMass));
    // cp2.position.add(penetrationResolution.scale(-cp2.inverseMass));

    // let distanceVector = cp1.position.clone().subtract(cp2.position);
    // let penetrationDepth = minDistance - distanceVector.magnitude;
    // let penetrationResolution = distanceVector
    //   .unit()
    //   .scale(penetrationDepth / (cp1.inverseMass + cp2.inverseMass));

    // cp1.position.add(penetrationResolution.scale(cp1.inverseMass));
    // cp2.position.add(penetrationResolution.scale(-cp2.inverseMass));
  }
}

export default Physics;
