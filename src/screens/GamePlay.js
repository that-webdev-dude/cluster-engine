import cluster from "../cluster/index";
const { Container, Capsule, Line, Text, Vector, Physics, Logger, math } = cluster;

const PLAYER_ACCELERATION = 2000;
const PLAYER_FRICTION = 800;
const PLAYER_MAXVEL = 400;
const PLAYER_ANGULAR_MAXVEL = 5;
const PLAYER_ANGULAR_VELOCITY = 0.5;
const PLAYER_ANGULAR_FRICTION = 0.9;
class Player extends Capsule {
  constructor(input) {
    super({
      width: 200,
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

  update(dt, t) {
    const { keyInput, velocity, position, direction } = this;
    // up & down movement
    if (keyInput.y && velocity.magnitude < PLAYER_MAXVEL) {
      let force = direction.clone().scale(PLAYER_ACCELERATION);
      Physics.World.applyForce(this, force);
    }

    // rotation
    if (keyInput.x && this.angularVelocity < PLAYER_ANGULAR_MAXVEL) {
      this.angularVelocity += PLAYER_ANGULAR_VELOCITY * keyInput.x * dt;
    }
    if (!keyInput.x && this.angularVelocity <= 0.0001) {
      this.angularVelocity = 0;
    }

    // friction
    Physics.World.applyFriction(this, PLAYER_FRICTION);

    // angularFriction
    this.angularVelocity *= PLAYER_ANGULAR_FRICTION;

    // reposition
    this.position.add(Physics.World.getDisplacement(this, dt));
    this.angle += this.angularVelocity;
    if (this.angle >= math.deg2rad(359)) {
      this.angle = 0;
    }

    // avoid sliding effect
    if (velocity.magnitude < 10) velocity.set(0, 0);
  }
}

class Enemy extends Capsule {
  constructor() {
    super({
      width: 200,
      height: 50,
      radius: 25,
      style: { fill: "transparent", stroke: "red" },
    });

    this.angle = math.deg2rad(45);
    this.position = new Vector(400, 100);
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
}

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.gameover = false;
    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.gameW = game.width;
    this.gameH = game.height;
    this.mouse = input.mouse;
    this.key = input.key;

    this.player = this.add(new Player(input));
    this.enemy = this.add(new Enemy());

    // DEBUG
    this.loggerVelocity = this.add(new Logger(new Vector(20, 20), ``));
    this.loggerAngularVelocity = this.add(new Logger(new Vector(20, 40), ``));
    this.loggerCollision = this.add(new Logger(new Vector(20, 60), ``));
    this.playerAxisLine = this.add(
      new Line({
        start: new Vector(),
        end: new Vector(),
        style: { stroke: "black" },
      })
    );

    this.enemyAxisLine = this.add(
      new Line({
        start: new Vector(),
        end: new Vector(),
        style: { stroke: "red" },
      })
    );
    // DEBUG
  }

  updateDebug(dt, t) {
    let playerStart = this.player.start;
    let playerEnd = this.player.end;
    let playerAxis = playerStart.to(playerEnd);
    this.playerAxisLine.start.copy(playerStart);
    this.playerAxisLine.end.copy(playerStart.clone().add(playerAxis));

    let enemyStart = this.enemy.start;
    let enemyEnd = this.enemy.end;
    let enemyAxis = enemyStart.to(enemyEnd);
    this.enemyAxisLine.start.copy(enemyStart);
    this.enemyAxisLine.end.copy(enemyStart.clone().add(enemyAxis));

    this.loggerVelocity.text = `player velocity: ${this.player.velocity.magnitude}`;
    this.loggerAngularVelocity.text = `player angular velocity: ${this.player.angularVelocity}`;
    if (
      Physics.closestPoint_ll(this.player, this.enemy).magnitude <
      this.player.radius + this.enemy.radius
    ) {
      this.loggerCollision.text = `collision!`;
    } else {
      this.loggerCollision.text = ``;
    }
  }

  update(dt, t) {
    super.update(dt, t);
    this.updateDebug(dt, t);
  }
}

export default GamePlay;
