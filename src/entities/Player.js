import charactersImageURL from "../images/characters.png";
import Progress from "./Progress";
import Weapon from "./Weapon";

import cluster from "../cluster";
const { Container, Texture, TileSprite, Vector } = cluster;

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
      0.075
    );
  }
}

class Player extends Container {
  constructor(input) {
    super();
    this.character = this.add(new PlayerSkin(input));
    this.weapon = this.add(new Weapon());

    this.input = input;
    this.speed = new Vector(175, 175);
    this.scale = new Vector(1, 1);
    this.anchor = new Vector(-16, -16);
    this.position = new Vector(0, 0);
    this.direction = new Vector(1, 0);
  }

  lookRight() {
    const { scale, anchor, direction } = this;
    scale.set(1, 1);
    anchor.set(-16, -16);
    direction.set(1, 0);
  }

  lookLeft() {
    const { scale, anchor, direction } = this;
    scale.set(-1, 1);
    anchor.set(16, -16);
    direction.set(-1, 0);
  }

  update(dt, t) {
    super.update(dt, t);
    const { input, character, weapon, speed, position, direction, reloadBar } = this;

    // player animation based on keypress
    // ----------------------------------
    if (input.key.x) {
      character.animation.play("walk");
    } else {
      character.animation.play("idle");
    }

    // player facing direction based on mouse position
    // -----------------------------------------------
    if (input.mouse.position.x <= position.x) {
      this.lookLeft();
    } else if (input.mouse.position.x > position.x) {
      this.lookRight();
    }

    // player position based on keypress
    // ---------------------------------
    position.x += speed.x * dt * input.key.x;
    position.y += speed.y * dt * input.key.y;

    this.input.mouse.update();
  }
}

export default Player;
