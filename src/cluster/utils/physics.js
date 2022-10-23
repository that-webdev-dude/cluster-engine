import math from "./math";

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
   * alias of this.reposition()
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
}

class Physics {
  /**
   * symulation of forces
   * acting in the physycs world
   */
  static World = PhysicsWorld;

  /**
   * circle → circle
   */

  /**
   * collisionDetection_cc
   * @param {*} a
   * @param {*} b
   * @returns
   */
  static collisionDetection_cc(a, b) {
    let minDistance = a.radius + b.radius;
    return math.distance(a.position, b.position) <= minDistance;
  }

  /**
   * penetrationResolution_cc
   * @param {*} a
   * @param {*} b
   */
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
   * circle → line
   */

  /**
   * closestPoint_pl
   * @param {Vector} p
   * @param {Line} l
   * @returns
   */
  static closestPoint_pl(p, l) {
    /**
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
    let lineDirection = l.end.clone().subtract(l.start).unit();
    let pointToLineStart = l.start.clone().subtract(p);
    if (pointToLineStart.dot(lineDirection) > 0) {
      return pointToLineStart;
    }
    let pointToLineEnd = l.end.clone().subtract(p);
    if (pointToLineEnd.dot(lineDirection) < 0) {
      return pointToLineEnd;
    }

    let closestDistance = pointToLineStart.dot(lineDirection);
    let closestVector = lineDirection.scale(closestDistance);
    return pointToLineStart.clone().subtract(closestVector);
  }

  /**
   * circle to wall collision detector
   * @param {*} c
   * @param {*} l
   * @returns Boolean
   */
  static collisionDetection_cw(c, l) {
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
  static penetrationResolution_cw(c, l) {
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
  static collisionResolution_cw(c, l) {
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
   * line → line
   *
   */

  /**
   * closestPoint_ll (line to line)
   * finds the closest vector from one line
   * to another. is using the start/end of the line1
   * within this.closestPoint_pl
   * @param {Line} l1
   * @param {Line} l2
   * @returns {Vector} closest Vector
   */
  static closestPoint_ll(l1, l2) {
    let closestresult1 = null;
    let closestFromStart1 = this.closestPoint_pl(l1.start, l2);
    let closestFromEnd1 = this.closestPoint_pl(l1.end, l2);
    if (closestFromStart1.magnitude <= closestFromEnd1.magnitude) {
      closestresult1 = closestFromStart1;
    } else {
      closestresult1 = closestFromEnd1;
    }

    let closestresult2 = null;
    let closestFromStart2 = this.closestPoint_pl(l2.start, l1);
    let closestFromEnd2 = this.closestPoint_pl(l2.end, l1);
    if (closestFromStart2.magnitude <= closestFromEnd2.magnitude) {
      closestresult2 = closestFromStart2;
    } else {
      closestresult2 = closestFromEnd2;
    }

    if (closestresult1.magnitude <= closestresult2.magnitude) {
      return closestresult1;
    } else {
      return closestresult2;
    }
  }
}

export default Physics;
