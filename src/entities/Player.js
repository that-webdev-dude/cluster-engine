import charactersImageURL from "../images/characters.png";
import Weapon from "./Weapon";
import cluster from "../cluster";

const { Container, Texture, TileSprite, Vector, Physics } = cluster;
const PLAYER_ACCELERATION = 2500;
const PLAYER_FRICTION = PLAYER_ACCELERATION / 2;
const PLAYER_VELOCITY = PLAYER_ACCELERATION / 6;
const GRAVITY = 4800;

class PlayerSkin extends TileSprite {
  constructor(input) {
    super(new Texture(charactersImageURL), 32, 32);
    this.input = input;
    this.position = new Vector(0, 0);
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
  constructor(input) {
    super();
    this.character = this.add(new PlayerSkin(input));
    this.weapon = this.add(new Weapon());

    this.input = input;
    this.scale = new Vector(1, 1);
    // this.anchor = new Vector(-16, -16);
    this.position = new Vector(100, 100);
    this.velocity = new Vector();
    this.acceleration = new Vector();
  }

  lookRight() {
    const { scale, anchor, direction } = this;
    scale.set(1, 1);
    // anchor.set(-16, -16);
  }

  lookLeft() {
    const { scale, anchor, direction } = this;
    scale.set(-1, 1);
    // anchor.set(16, -16);
  }

  update(dt, t) {
    super.update(dt, t);
    const { input, velocity } = this;

    // player movement based on keypress
    // ----------------------------------
    if (input.key.x) {
      if (input.key.x > 0) this.lookRight();
      if (input.key.x < 0) this.lookLeft();
      if (Math.abs(velocity.x) < PLAYER_VELOCITY) {
        Physics.World.applyForce(this, { x: input.key.x * PLAYER_ACCELERATION, y: 0 });
      }
    }

    if (input.key.y) {
      if (Math.abs(velocity.y) < PLAYER_VELOCITY) {
        Physics.World.applyForce(this, { y: input.key.y * PLAYER_ACCELERATION, x: 0 });
      }
    }

    // world friction handling
    // ----------------------------------
    if (this.velocity.magnitude >= 10) {
      Physics.World.applyFriction(this, PLAYER_FRICTION);
    } else {
      velocity.set(0, 0);
    }

    // update position
    // ----------------------------------
    Physics.World.reposition(this, dt);

    this.input.mouse.update();
  }
}

export default Player;
