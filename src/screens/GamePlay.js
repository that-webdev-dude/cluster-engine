import cluster from "../cluster/index";
const { Container, Capsule, Circle, Line, Text, Vector, Physics, Logger, math } = cluster;

const PLAYER_ACCELERATION = 2000;
const PLAYER_FRICTION = 800;
const PLAYER_MAXVEL = 400;
const PLAYER_ANGULAR_MAXVEL = 5;
const PLAYER_ANGULAR_VELOCITY = 0.5;
const PLAYER_ANGULAR_FRICTION = 0.9;

class Ball extends Circle {
  constructor(radius, input = null, mass = 1) {
    super({
      radius,
      style: { fill: "cyan", stroke: "black" },
    });
    this.mass = mass;
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
    this.player = new Ball(50, input, 2);
    this.target = new Ball(100, null);

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

    this.__sourceCollisionPoint = this.add(
      new Line({
        start: new Vector(),
        end: new Vector(),
        style: { stroke: "cyan" },
      })
    );

    this.__targetCollisionPoint = this.add(
      new Line({
        start: new Vector(),
        end: new Vector(),
        style: { stroke: "green" },
      })
    );
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
  }

  update(dt, t) {
    super.update(dt, t);

    let collisionData = Physics.detectCollision_cc(this.player, this.target);
    if (collisionData) {
      Physics.resolvePenetration_cc(collisionData);
      Physics.resolveCollision_cc(collisionData);
    }

    this.updateDebug(dt, t);
  }
}

export default GamePlay;
