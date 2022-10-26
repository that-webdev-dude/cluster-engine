import cluster from "../cluster/index";
const { Container, Capsule, Circle, Line, Text, Vector, Physics, Logger, math } = cluster;

const PLAYER_ACCELERATION = 2000;
const PLAYER_FRICTION = 800;
const PLAYER_MAXVEL = 400;
const PLAYER_ANGULAR_MAXVEL = 5;
const PLAYER_ANGULAR_VELOCITY = 0.5;
const PLAYER_ANGULAR_FRICTION = 0.9;

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
    this.updates = 0;
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

    this.__playerDistance = this.add(
      new Line({
        start: new Vector(),
        end: new Vector(),
        style: { stroke: "blue" },
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

    // this should go away from player and towards the target
    const distanceData = Physics.distance_pp(this.player.position, this.target.position);
    this.__playerDistance.start.copy(this.player.position);
    this.__playerDistance.end.copy(this.__playerDistance.start.clone().add(distanceData.distance));

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

    let collisionData = Physics.detectCollision_cc(this.player, this.target);
    if (collisionData) {
      console.log(
        "file: GamePlay.js ~ line 157 ~ GamePlay ~ update ~ collisionData",
        collisionData
      );
    }

    this.updateDebug(dt, t);
  }
}

export default GamePlay;
