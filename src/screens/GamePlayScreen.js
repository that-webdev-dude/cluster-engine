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
   * closestPoint_bw
   * @param {*} b
   * @param {*} w
   * @returns
   */
  static closestPoint_bw(b, w) {
    let wallUnit = w.end.clone().subtract(w.start).unit();

    let ballToWallStart = w.start.clone().subtract(b.position);
    if (ballToWallStart.dot(wallUnit) > 0) {
      return ballToWallStart;
    }
    let ballToWallEnd = w.end.clone().subtract(b.position);
    if (ballToWallEnd.dot(wallUnit) < 0) {
      return ballToWallEnd;
    }

    let closestDistance = ballToWallStart.dot(wallUnit);
    let closestVector = wallUnit.scale(closestDistance);
    return ballToWallStart.clone().subtract(closestVector);
  }
}

class GamePlayScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();

    const gameW = game.width;
    const gameH = game.height;

    const wall = new Wall(100, 350, 600, 450);
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

    // for (let i = 0; i < 15; i++) {
    //   const bx = math.rand(0, gameW);
    //   const by = math.rand(0, gameH);
    //   const br = math.rand(16, 64);
    //   const bm = math.rand(1, 5);
    //   const b = new Ball({
    //     position: new Vector(bx, by),
    //     style: { fill: "#564BFF", stroke: "black" },
    //     radius: br,
    //     mass: bm,
    //   });
    //   balls.add(b);
    // }

    this.player = player;
    this.wall = this.add(wall);
    this.balls = this.add(balls);

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
    let aStart = this.debugCircle.position.clone();
    let aEnd = this.debugCircle.position.clone().add(
      this.player.velocity
        .clone()
        .normalize()
        .scale(this.player.velocity.magnitude * 5)
    );
    this.debugVel.path = [aStart, aEnd];

    let b2wStart = this.player.position.clone();
    let b2wEnd = this.player.position.clone().add(Physics.closestPoint_bw(this.player, this.wall));
    this.debugWall.path = [b2wStart, b2wEnd];
  }

  update(dt, t) {
    super.update(dt, t);

    let balls = this.balls.children;
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const b = balls[j];
        // collision detection && penetration resolution
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
