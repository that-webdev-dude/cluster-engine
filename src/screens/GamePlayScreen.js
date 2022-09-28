import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Ball from "../cluster/entities/Ball";
import math from "../cluster/utils/math";
import Wall from "../cluster/entities/Wall";

class Path {
  constructor(
    { path = [], style = { fill: "black" } } = {
      path: [],
      style: { fill: "black" },
    }
  ) {
    this.path = path;
    this.style = style;
  }
}

class Physics {
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
      .normalize()
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
   * collisionDetection_cw
   * @param {*} c
   * @param {*} w
   * @returns Boolean
   */
  static collisionDetection_cw(c, w) {
    let minDistance = c.radius;
    return this.closestPoint_cw(c, w).magnitude < minDistance;
  }

  /**
   * penetrationResolution_cw
   * @param {*} c
   * @param {*} w
   */
  static penetrationResolution_cw(c, w) {
    let closestPoint = this.closestPoint_cw(c, w);
    let resolutionVec = closestPoint
      .clone()
      .unit()
      .reverse()
      .scale(c.radius - closestPoint.magnitude);
    c.position.add(resolutionVec);
  }
}

class GamePlayScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();

    const gameW = game.width;
    const gameH = game.height;

    // add walls
    const walls = new Container();
    const edges = [
      new Wall(0, 0, gameW, 0),
      new Wall(gameW, 0, gameW, gameH),
      new Wall(gameW, gameH, 0, gameH),
      new Wall(0, gameH, 0, 0),
    ];
    edges.forEach((edge) => walls.add(edge));
    const wall = walls.add(new Wall(100, 350, 600, 450));

    // add player & balls
    const balls = new Container();
    const player = balls.add(
      new Ball({
        position: new Vector(100, 100),
        style: {
          stroke: "black",
        },
        input: input,
        radius: 64,
        mass: 1,
      })
    );
    for (let i = 0; i < 5; i++) {
      const bx = math.rand(0, gameW);
      const by = math.rand(0, gameH);
      const br = math.rand(16, 64);
      const bm = math.rand(1, 5);
      const b = new Ball({
        position: new Vector(bx, by),
        style: { fill: "#564BFF", stroke: "black" },
        radius: br,
        mass: bm,
      });
      balls.add(b);
    }

    this.player = player;
    this.balls = this.add(balls);
    this.walls = this.add(walls);

    // DEBUG! ----------------------------------------------------------------------
    this.debugCircle = this.add(
      new Ball({
        position: new Vector(game.width - 50 - 10, game.height - 50 - 10),
        radius: 50,
        style: { fill: "#9999" },
      })
    );
    this.debugVel = this.add(
      new Path({
        style: { stroke: "red" },
      })
    );
    this.debugWall = this.add(
      new Path({
        style: { stroke: "green" },
      })
    );
    // END DEBUG! ------------------------------------------------------------------
  }

  updateDebug() {
    // bottom right indicator
    let aStart = this.debugCircle.position.clone();
    let aEnd = this.debugCircle.position.clone().add(
      this.player.velocity
        .clone()
        .normalize()
        .scale(this.player.velocity.magnitude * 5)
    );
    this.debugVel.path = [aStart, aEnd];

    // player to wall
    // let b2wStart = this.player.position.clone();
    // let b2wEnd = this.player.position.clone().add(Physics.closestPoint_cw(this.player, this.wall));
    // this.debugWall.path = [b2wStart, b2wEnd];
  }

  update(dt, t) {
    super.update(dt, t);

    let balls = this.balls.children;
    let walls = this.walls.children;

    for (let i = 0; i < balls.length; i++) {
      const a = balls[i];
      // circle to wall collision detection
      for (let k = 0; k < walls.length; k++) {
        const w = walls[k];
        if (Physics.collisionDetection_cw(a, w)) {
          Physics.penetrationResolution_cw(a, w);
        }
      }
      // circle to circle collision detection and resolution
      for (let j = i + 1; j < balls.length; j++) {
        const b = balls[j];
        if (Physics.collisionDetection_cc(a, b)) {
          Physics.penetrationResolution_cc(a, b);
          Physics.collisionResolution_cc(a, b);
        }
      }
    }

    // debug
    this.updateDebug();
  }
}

export default GamePlayScreen;
