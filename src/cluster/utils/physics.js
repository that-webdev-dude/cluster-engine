import math from "./math";

class Physics {
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
   * apply an impulse (a one-off) to this entity
   * @param {*} entity
   * @param {*} force
   * @param {*} dt
   */
  static applyImpulse(entity, force, dt) {
    this.applyForce(entity, { x: force.x / dt, y: force.y / dt });
  }

  /**
   * reposition the entity based on acceleration and velocity
   * (velocity vertlet intagration)
   * @param {*} entity
   * @param {*} dt
   * @returns
   */
  static reposition(entity, dt) {
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
   * closestPoint_cw
   * @param {*} b
   * @param {*} w
   * @returns
   */
  static closestPoint_cw(c, w) {
    let wallUnit = w.end.clone().subtract(w.start).unit();
    let ballToWallStart = w.start.clone().subtract(c.position);
    if (ballToWallStart.dot(wallUnit) > 0) {
      return ballToWallStart;
    }
    let ballToWallEnd = w.end.clone().subtract(c.position);
    if (ballToWallEnd.dot(wallUnit) < 0) {
      return ballToWallEnd;
    }

    let closestDistance = ballToWallStart.dot(wallUnit);
    let closestVector = wallUnit.scale(closestDistance);
    return ballToWallStart.clone().subtract(closestVector);
  }

  /**
   * circle to wall collision detector
   * @param {*} c
   * @param {*} w
   * @returns Boolean
   */
  static collisionDetection_cw(c, w) {
    /**
     * 1. get the distance circle → wall (currentDist)
     * 2. get the minimum allowed distance (minimumDist),
     * 3. if currentDist < minimumDist there's a collision
     */
    let currentDist = this.closestPoint_cw(c, w).magnitude;
    let minimumDist = c.radius;
    return currentDist < minimumDist;
  }

  /**
   * circle to wall penetration resolver
   * @param {*} c
   * @param {*} w
   */
  static penetrationResolution_cw(c, w) {
    /**
     * 1. get the normal vector circle → wall (normalVec)
     * 2. the difference between c.radius & normal magnitude,
     *    is the penetration amount (depthMag)
     * 3. get the reversed unit of normal (depthDir)
     * 4. compute the resVec along the depthDir
     * 5. add resVec to the circle position
     */

    let normalVec = this.closestPoint_cw(c, w);
    let depthMag = c.radius - normalVec.magnitude;
    let depthDir = normalVec.unit().reverse();
    let resVec = depthDir.scale(depthMag);
    c.position.add(resVec);
  }

  /**
   * circle to wall collision resolver
   * @param {*} c
   * @param {*} w
   */
  static collisionResolution_cw(c, w) {
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
    let normalDir = this.closestPoint_cw(c, w).unit().reverse();
    let normalMag = -c.velocity.dot(normalDir);
    let scaledMag = normalMag * c.elasticity;
    let totalMag = normalMag + scaledMag;
    let resVec = normalDir.scale(totalMag);
    c.velocity.add(resVec);
  }
}

export default Physics;
