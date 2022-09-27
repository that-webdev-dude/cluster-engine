import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Ball from "../cluster/entities/Ball";
import math from "../cluster/utils/math";

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

class Phy {
  static collisionDetection_cc(a, b) {
    const minDistance = a.radius + b.radius;
    return math.distance(a.position, b.position) <= minDistance;
  }

  static penetrationResolution_cc(a, b) {
    let distanceVec = a.position.clone().subtract(b.position);
    let penetrationDepth = a.radius + b.radius - distanceVec.magnitude;
    let penetrationResolution = distanceVec.normalize().scale(penetrationDepth / 2);
    a.position.add(penetrationResolution);
    b.position.add(penetrationResolution.scale(-1));
  }

  static collisionResolution_cc() {
    // conservation of momentum
    // conservation of kinetic energy
  }
}

class GamePlayScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();

    const gameW = game.width;
    const gameH = game.height;
    const balls = new Container();
    for (let i = 0; i < 15; i++) {
      const bx = math.rand(0, gameW);
      const by = math.rand(0, gameH);
      const br = math.rand(16, 64);
      const b = new Ball({
        position: new Vector(bx, by),
        style: { fill: "#564BFF", stroke: "black" },
        radius: br,
      });
      balls.add(b);
    }

    this.balls = this.add(balls);
    this.player = this.balls.add(
      new Ball({
        position: new Vector(100, 100),
        style: { fill: "#FF564B", stroke: "black" },
        input: input,
        radius: 64,
      })
    );

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
  }

  update(dt, t) {
    super.update(dt, t);

    let balls = this.balls.children;
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const b = balls[j];
        // collision detection && penetration resolution
        if (Phy.collisionDetection_cc(a, b)) {
          Phy.penetrationResolution_cc(a, b);
        }
      }
    }

    // debug
    this.updateDebug();
  }
}

export default GamePlayScreen;
