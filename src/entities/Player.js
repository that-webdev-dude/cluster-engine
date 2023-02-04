import charactersImageURL from "../images/characters.png";
import wallslide from "../cluster/movement/wallslide";
import Weapon from "./Weapon";
import cluster from "../cluster";

const PLAYER_ACCELERATION = 2500;
const PLAYER_FRICTION = PLAYER_ACCELERATION / 2;
const PLAYER_VELOCITY = PLAYER_ACCELERATION / 6;
const PLAYER_GRAVITY = 2800;

const states = {
  SLEEPING: 1,
  WALKING: 2,
  JUMPING: 3,
  FALLING: 4,
};

const { Container, Texture, TileSprite, Vector, Physics, State } = cluster;

class PlayerSkin extends TileSprite {
  constructor() {
    const width = 32;
    const height = 32;

    super(new Texture(charactersImageURL), width, height);

    this.animation.add(
      "idle",
      [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      0.25
    );
    this.animation.add(
      "walk",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      0.05
    );
  }
}

class Player extends Container {
  constructor(input, level) {
    super();
    this.character = this.add(new PlayerSkin(input));
    this.weapon = this.add(new Weapon(new Vector(32, 14)));
    this.state = new State(states.FALLING);
    this.level = level;
    this.input = input;
    this.scale = new Vector(1, 1);
    this.anchor = new Vector(-16, 0);
    this.hitbox = {
      x: 0,
      y: 0,
      width: 32,
      height: 31,
    };

    this.direction = 1;
    this.position = new Vector(100, 150);
    this.velocity = new Vector();
    this.acceleration = new Vector();
  }

  lookRight() {
    const { scale, anchor } = this;
    scale.set(1, 1);
    anchor.set(-16, 0);
    this.direction = 1;
  }

  lookLeft() {
    const { scale, anchor } = this;
    scale.set(-1, 1);
    anchor.set(16, 0);
    this.direction = -1;
  }

  walk(direction) {
    const { velocity } = this;
    if (direction === 1) this.lookRight();
    if (direction === -1) this.lookLeft();
    if (Math.abs(velocity.x) < PLAYER_VELOCITY) {
      Physics.World.applyForce(this, { x: direction * PLAYER_ACCELERATION, y: 0 });
    }
  }

  jump(dt) {
    Physics.World.applyImpulse(this, { x: 0, y: -1000 }, dt);
  }

  fire(dt) {
    const { weapon, position, direction } = this;
    return weapon.fire(position, direction, dt);
  }

  update(dt, t) {
    super.update(dt, t);

    // prettier-ignore
    const { 
      state, 
      input, 
      level, 
      velocity, 
      position, 
    } = this;
    state.update(dt, t);

    Physics.World.applyFriction(this, PLAYER_FRICTION);
    Physics.World.applyGravity(this, PLAYER_GRAVITY);

    switch (state.get()) {
      case states.SLEEPING:
        // init
        if (state.first) {
          // console.log("SLEEPING");
          this.character.animation.play("idle");
        }
        // → transition walking
        if (input.key.x !== 0) {
          state.set(states.WALKING);
        }
        // → transition jumping
        if (input.key.y === -1) {
          state.set(states.JUMPING);
        }
        break;

      case states.JUMPING:
        // init
        if (state.first) {
          // console.log("JUMPING");
          this.jump(dt);
          this.character.animation.play("walk");
        }
        // action
        if (input.key.x !== 0) {
          this.walk(input.key.x);
        }
        // → falling
        if (velocity.y > 0) {
          state.set(states.FALLING);
        }
        break;

      case states.WALKING:
        // init
        if (state.first) {
          // console.log("WALKING");
          this.character.animation.play("walk");
        }
        // action
        if (input.key.x !== 0) {
          this.walk(input.key.x);
        }
        // → transition jumping
        if (input.key.y === -1) {
          state.set(states.JUMPING);
        }
        // → transition falling
        if (velocity.y > 50) {
          state.set(states.FALLING);
        }
        // → transition sleeping
        if (!input.key.x && velocity.x === 0) {
          state.set(states.SLEEPING);
        }
        break;

      case states.FALLING:
        // init
        if (state.first) {
          // console.log("FALLING");
          this.character.animation.play("walk");
        }
        // action
        if (input.key.x !== 0) {
          this.walk(input.key.x);
        }
        // → transition sleeping
        if (velocity.y === 0) {
          state.set(states.SLEEPING);
        }
        break;

      default:
        console.warn("Player needs another state?");
        break;
    }

    const { x: dx, y: dy } = Physics.World.getDisplacement(this, dt);
    const r = wallslide(this, level, dx, dy);
    if (r.hits.down || r.hits.up) {
      velocity.set(velocity.x, 0);
    }
    if (r.hits.left || r.hits.right) {
      velocity.set(0, velocity.y);
    }
    if (this.velocity.magnitude <= 10) {
      velocity.set(0, 0);
    }
    position.add(r);
  }
}

export default Player;
