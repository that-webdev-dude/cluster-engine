import charactersImageURL from "../images/characters.png";
import wallslide from "../cluster/movement/wallslide";
import cluster from "../cluster/index";
// prettier-ignore
const { 
  TileSprite,
  Texture,
  Physics,
  Vector,
  State,
  math
} = cluster;

const states = {
  SLEEPING: 1,
  WALKING: 2,
};

const world = {
  FRICTION: 1250, // ACC/2
  GRAVITY: 2800,
};

const attributes = {
  ACCELERATION: 1250,
  MIN_VELOCITY: 2,
  MAX_VELOCITY: math.rand(32, 64),
};

class Zombie extends TileSprite {
  constructor(player, level, position, health) {
    const width = 32;
    const height = 32;
    super(new Texture(charactersImageURL), width, height);
    this.player = player;
    this.level = level;
    this.state = new State(states.SLEEPING);
    this.animation.add(
      "idle",
      [
        { x: 1, y: 3 },
        { x: 2, y: 3 },
      ],
      0.25
    );
    this.animation.add(
      "walk",
      [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 3 },
      ],
      0.25
    );

    this.animation.play("walk");

    this.scale = new Vector(1, 1);
    this.anchor = new Vector(0, 0);
    this.position = position;
    this.velocity = new Vector();
    this.acceleration = new Vector();
    this.direction = 1;
    this.health = math.rand(15, 20);
    this.hitbox = {
      x: 0,
      y: 0,
      width,
      height,
    };

    // ...
    this.firstUpdate = true;
    // this.alpha = 0.5;
  }

  get bounds() {
    const { position, width, height } = this;
    return {
      x: position.x,
      y: position.y,
      width,
      height,
    };
  }

  playerIsClose() {
    const { position, player } = this;
    const zombieToPlayerVector = position.clone().to(player.position);
    const minDistanceX = 32 * 24;
    const minDistanceY = 32 * 6;
    const isClose =
      Math.abs(zombieToPlayerVector.x) < minDistanceX &&
      Math.abs(zombieToPlayerVector.y) < minDistanceY;
    return isClose;
  }

  damage(amount) {
    this.health -= amount;
  }

  lookRight() {
    const { scale, anchor } = this;
    scale.set(1, 1);
    anchor.set(0, 0);
    this.direction = 1;
  }

  lookLeft() {
    const { scale, anchor, width } = this;
    scale.set(-1, 1);
    anchor.set(width, 0);
    this.direction = -1;
  }

  walk() {
    const { velocity, direction, speed } = this;
    if (Math.abs(velocity.x) < attributes.MAX_VELOCITY) {
      Physics.World.applyForce(this, { x: direction * attributes.ACCELERATION, y: 0 });
    }
  }

  update(dt, t) {
    super.update(dt, t);
    // prettier-ignore
    const { 
      state,
      level, 
      player, 
      velocity, 
      position, 
    } = this;
    state.update(dt, t);

    // apply word forces
    Physics.World.applyFriction(this, world.FRICTION);
    Physics.World.applyGravity(this, world.GRAVITY);

    // face the player
    const zombieToPlayerVector = this.position.clone().to(player.position);
    if (zombieToPlayerVector.x < 0 && Math.abs(zombieToPlayerVector.x) > -32) this.lookLeft();
    if (zombieToPlayerVector.x > -1 && Math.abs(zombieToPlayerVector.x) < 32) this.lookRight();

    // set the state
    switch (state.get()) {
      case states.SLEEPING:
        // init
        if (state.first) {
          this.animation.play("idle");
          this.velocity.set(0, 0);
        }
        // → transition walking
        if (this.playerIsClose()) {
          state.set(states.WALKING);
        }
        break;

      case states.WALKING:
        // init
        if (state.first) {
          this.animation.play("walk");
        }
        // action
        this.walk(-player.direction);
        // → transition sleeping
        if (!this.playerIsClose()) {
          state.set(states.SLEEPING);
        }
        break;

      default:
        console.warn("Zombie needs another state?");
        break;
    }

    // update position
    const { x: dx, y: dy } = Physics.World.getDisplacement(this, dt);
    const r = wallslide(this, level, dx, dy);
    if (r.hits.down || r.hits.up) {
      velocity.set(velocity.x, 0);
    }
    if (r.hits.left || r.hits.right) {
      velocity.set(0, velocity.y);
    }
    if (this.velocity.magnitude <= attributes.MIN_VELOCITY) {
      velocity.set(0, 0);
    }
    position.add(r);

    // zombie dead
    if (this.health === 0) this.dead = true;

    // FIRST UPDATE ONLY
    if (this.firstUpdate) {
      this.firstUpdate = false;
    }
  }
}

export default Zombie;
