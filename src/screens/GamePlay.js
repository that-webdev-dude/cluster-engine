import cluster from "../cluster/index";
const { Container, Capsule, Circle, Line, Text, Vector, Physics, Logger, math } = cluster;

const PLAYER_ACCELERATION = 2000;
const PLAYER_FRICTION = 800;
const PLAYER_MAXVEL = 400;
const PLAYER_ANGULAR_MAXVEL = 5;
const PLAYER_ANGULAR_VELOCITY = 0.5;
const PLAYER_ANGULAR_FRICTION = 0.9;
class Player extends Capsule {
  constructor(input) {
    super({
      width: 100,
      height: 50,
      radius: 25,
      style: { fill: "transparent", stroke: "black" },
    });

    const { key } = input;
    this.keyInput = key;
    this.angle = 0;
    this.position = new Vector(100, 200);
    this.velocity = new Vector();
    this.acceleration = new Vector();
    this.angularVelocity = 0;
    this.mass = 1;
  }

  get center() {
    return new Vector(this.width / 2, this.height / 2);
  }

  get pivot() {
    return this.center;
  }

  get anchor() {
    return this.center.clone().reverse();
  }

  get length() {
    return this.width - 2 * this.radius;
  }

  get direction() {
    return new Vector(Math.cos(this.angle), Math.sin(this.angle));
  }

  get start() {
    let offset = this.direction.clone().scale(this.length / 2);
    return this.position.clone().subtract(offset);
  }

  get end() {
    let offset = this.direction.clone().scale(this.length / 2);
    return this.position.clone().add(offset);
  }

  get inverseMass() {
    return this.mass === 0 ? 0 : 1 / this.mass;
  }

  update(dt, t) {
    // const { keyInput, velocity, position, direction } = this;
    // // up & down movement
    // if (keyInput.y && velocity.magnitude < PLAYER_MAXVEL) {
    //   let force = direction.clone().scale(PLAYER_ACCELERATION);
    //   Physics.World.applyForce(this, force);
    // }
    // // rotation
    // if (keyInput.x && Math.abs(this.angularVelocity) < PLAYER_ANGULAR_MAXVEL) {
    //   this.angularVelocity += PLAYER_ANGULAR_VELOCITY * keyInput.x * dt;
    // }
    // if (!keyInput.x && Math.abs(this.angularVelocity) <= 0.0001) {
    //   this.angularVelocity = 0;
    // }
    // // friction
    // Physics.World.applyFriction(this, PLAYER_FRICTION);
    // // angularFriction
    // this.angularVelocity *= PLAYER_ANGULAR_FRICTION;
    // // reposition
    // this.position.add(Physics.World.getDisplacement(this, dt));
    // this.angle += this.angularVelocity;
    // if (this.angle >= math.deg2rad(359)) {
    //   this.angle = 0;
    // }
    // // avoid sliding effect
    // if (velocity.magnitude < 10) velocity.set(0, 0);
  }
}

// class Enemy extends Capsule {
//   constructor() {
//     super({
//       width: 200,
//       height: 50,
//       radius: 25,
//       style: { fill: "transparent", stroke: "red" },
//     });

//     this.angle = math.deg2rad(0);
//     this.position = new Vector(400, 100);
//     this.mass = 10;
//   }

//   get center() {
//     return new Vector(this.width / 2, this.height / 2);
//   }

//   get pivot() {
//     return this.center;
//   }

//   get anchor() {
//     return this.center.clone().reverse();
//   }

//   get length() {
//     return this.width - 2 * this.radius;
//   }

//   get direction() {
//     return new Vector(Math.cos(this.angle), Math.sin(this.angle));
//   }

//   get start() {
//     let offset = this.direction.clone().scale(this.length / 2);
//     return this.position.clone().subtract(offset);
//   }

//   get end() {
//     let offset = this.direction.clone().scale(this.length / 2);
//     return this.position.clone().add(offset);
//   }

//   get inverseMass() {
//     return this.mass === 0 ? 0 : 1 / this.mass;
//   }
// }

class Ball extends Circle {
  constructor(radius, input = null) {
    super({
      radius,
      style: { fill: "transparent", stroke: "black" },
    });
    this.mass = 1;
    this.elasticity = 1;
    this.acceleration = new Vector();
    this.velocity = new Vector();
    this.position = new Vector();
    this.anchor = new Vector(-radius, -radius);
    this.input = input;
  }

  get inverseMass() {
    return this.mass === 0 ? 0 : 1 / this.mass;
  }

  update(dt, t) {
    if (this.input) {
      const { key } = this.input;
      if ((key.x || key.y) && this.velocity.magnitude < PLAYER_MAXVEL) {
        Physics.World.applyForce(this, {
          x: key.x * PLAYER_ACCELERATION,
          y: key.y * PLAYER_ACCELERATION,
        });
      }
    }

    Physics.World.applyFriction(this, PLAYER_FRICTION);
    Physics.World.reposition(this, dt);
    if (this.velocity.magnitude < 10) {
      this.velocity.set(0, 0);
    }
  }
}

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.game = game;
    this.input = input;
    this.updates = 0;
    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};

    this.balls = this.add(new Container());
    this.player = new Ball(50, input);
    this.target = new Ball(100);

    this.player.position.set(100, 100);
    this.target.position.set(300, 400);

    this.balls.add(this.player);
    this.balls.add(this.target);

    // DEBUG
    this.__playerVelocity = this.add(
      new Line({
        start: new Vector(),
        end: new Vector(),
        style: { stroke: "red" },
      })
    );

    // this.__closestToBall = this.add(
    //   new Line({
    //     start: new Vector(),
    //     end: new Vector(),
    //     style: { stroke: "cyan" },
    //   })
    // );

    // this.__closestToWall = this.add(
    //   new Line({
    //     start: new Vector(),
    //     end: new Vector(),
    //     style: { stroke: "blue" },
    //   })
    // );

    // this.__playerToWall = this.add(
    //   new Line({
    //     start: new Vector(),
    //     end: new Vector(),
    //     style: { stroke: "green" },
    //   })
    // );

    // this.__logger = this.add(new Logger(new Vector(10, 10), ""));
    // DEBUG
  }

  updateDebug(dt, t) {
    // velocity indicator
    this.__playerVelocity.start.copy(this.player.position);
    this.__playerVelocity.end.copy(
      this.player.position.clone().add(
        this.player.velocity
          .clone()
          .unit()
          .scale(this.player.radius * 2)
      )
    );
    // closest to wall line
    // let closestToWallData = Physics.closestPoint_pl(this.ball.position, this.wall);
    // this.__closestToWall.start.copy(closestToWallData.start);
    // this.__closestToWall.end.copy(closestToWallData.start.clone().add(closestToWallData.end));
    // closest to staticBall
    // let closestToBallData = Physics.closestPoint_pp(this.ball.position, this.staticBall.position);
    // this.__closestToBall.start.copy(closestToBallData.start);
    // this.__closestToBall.end.copy(closestToBallData.start.clone().add(closestToBallData.end));
    // player to wall
    // let playerToWallData = Physics.closestPoint_ll(this.player, this.wall);
    // this.__playerToWall.start.copy(playerToWallData.start);
    // this.__playerToWall.end.copy(playerToWallData.start.clone().add(playerToWallData.end));
    // let collisionData = Physics.detectCollision_cc(this.ball, this.staticBall);
    // if (collisionData) {
    //   this.__logger.text = "collision!";
    //   Physics.resolvePenetration_cc(collisionData);
    //   Physics.resolveCollision_cc(collisionData);
    // } else {
    //   this.__logger.text = "";
    // }
  }

  update(dt, t) {
    super.update(dt, t);
    // // control the ball
    // const { key } = this.input;
    // if ((key.x || key.y) && this.ball.velocity.magnitude < PLAYER_MAXVEL) {
    //   Physics.World.applyForce(this.ball, {
    //     x: key.x * PLAYER_ACCELERATION,
    //     y: key.y * PLAYER_ACCELERATION,
    //   });
    // }

    // Physics.World.applyFriction(this.ball, PLAYER_FRICTION);
    // this.ball.position.add(Physics.World.getDisplacement(this.ball, dt));
    // if (this.ball.velocity.magnitude < 10) {
    //   this.ball.velocity.set(0, 0);
    // }

    this.updateDebug(dt, t);
  }
}

export default GamePlay;
