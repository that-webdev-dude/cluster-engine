import charactersImageURL from "../images/characters.png";
import wallslide from "../cluster/movement/wallslide";
import Weapon from "./Weapon";
import cluster from "../cluster";

// const { wallslide } = cluster; ?

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
    super(new Texture(charactersImageURL), 32, 32);
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
    this.weapon = this.add(new Weapon(new Vector(32, 18)));
    this.state = new State(states.FALLING);
    this.level = level;
    this.input = input;
    this.scale = new Vector(1, 1);
    this.anchor = new Vector(-16, -16);
    this.hitbox = {
      x: -16,
      y: -16,
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
    anchor.set(-16, -16);
    this.direction = 1;
  }

  lookLeft() {
    const { scale, anchor } = this;
    scale.set(-1, 1);
    anchor.set(16, -16);
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

    // player movement based on keypress
    // ----------------------------------
    if (input.key.x) {
      this.walk(input.key.x);
    }

    Physics.World.applyFriction(this, PLAYER_FRICTION);
    Physics.World.applyGravity(this, PLAYER_GRAVITY);

    const { x: dx, y: dy } = Physics.World.getDisplacement(this, dt);
    const r = wallslide(this, level, dx, dy);
    if (r.hits.down || r.hits.up) {
      velocity.set(velocity.x, 0);
    }
    position.add(r);

    switch (state.get()) {
      case states.SLEEPING:
        // animation
        // transition to walking
        // transition to jumping
        this.character.animation.play("idle");
        if (input.key.x) {
          state.set(states.WALKING);
        }
        if (input.key.y === -1) {
          this.jump(dt);
          state.set(states.JUMPING);
        }
        break;

      case states.JUMPING:
        // animation
        // transition to sleeping
        this.character.animation.play("walk");
        if (r.hits.down) {
          state.set(states.SLEEPING);
        }
        break;

      case states.WALKING:
        // animation
        // transition to sleeping
        // transition to jumping
        this.character.animation.play("walk");
        if (!input.key.x) {
          state.set(states.SLEEPING);
        }
        if (input.key.y === -1) {
          this.jump(dt);
          state.set(states.JUMPING);
        }
        break;

      case states.FALLING:
        // animation
        // transition to sleeping
        // transition to jumping
        this.character.animation.play("walk");
        if (r.hits.down) {
          state.set(states.SLEEPING);
        }
        break;

      default:
        console.warn("Player needs another state?");
        break;
    }

    if (this.velocity.magnitude <= 10) {
      velocity.set(0, 0);
    }
  }
}

export default Player;
