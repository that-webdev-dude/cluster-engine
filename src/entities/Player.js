import charactersImageURL from "../images/characters.png";
import weaponImageURL from "../images/weapon.png";
import cluster from "../cluster";
const { Container, Texture, Sprite, TileSprite, Vector, Rect } = cluster;

class PlayerCharacter extends TileSprite {
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

class PlayerWeapon extends Sprite {
  constructor() {
    super(new Texture(weaponImageURL));
    this.pivot = new Vector(6, 6);
    this.anchor = new Vector(-3, -3);
    this.position = new Vector(16, 16);
  }
}

class PlayerHealth extends Container {
  constructor() {
    super();
    this.indicator = this.add(
      new Rect({
        width: 32,
        height: 8,
        style: {
          fill: "green",
        },
      })
    );
    this.indicator.position = new Vector(0, 0);
    this.position = new Vector(0, 36);
    this.value = 100;
  }
}

class PlayerReload extends Container {
  constructor() {
    super();
    this.indicator = this.add(
      new Rect({
        width: 32,
        height: 4,
        style: {
          fill: "orange",
        },
      })
    );
    this.indicator.position = new Vector(0, 0);
    this.position = new Vector(0, 44);
    this.value = 100;
  }
}

class Player extends Container {
  constructor(input) {
    super();
    this.character = this.add(new PlayerCharacter(input));
    this.health = this.add(new PlayerHealth());
    this.reload = this.add(new PlayerReload());
    this.weapon = this.add(new PlayerWeapon());

    this.input = input;
    this.speed = new Vector(175, 175);
    this.scale = new Vector(1, 1);
    this.anchor = new Vector(-16, -16);
    this.position = new Vector(100, 100);
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
    const { input, character, speed, position, direction, reload } = this;

    // player animation based on keypress
    // ----------------------------------
    if (input.key.x || input.key.y) {
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

    // weapon aim based on mouse position
    // -------------------------------------
    let a = input.mouse.position
      .clone()
      .subtract(position)
      .angleTo({ x: direction.x, y: direction.y });
    if (input.mouse.position.y <= position.y) {
      this.weapon.angle = -a;
    } else if (input.mouse.position.y > position.y) {
      this.weapon.angle = a;
    }

    // shoot allowed when fully reloaded
    // ---------------------------------
    if (input.mouse.isPressed && reload.value === 100) {
      console.log("shoot!");
      reload.value = 0;
      reload.indicator.width = 0;
    }
    if (reload.value < 100) {
      reload.value += 75 * dt;
      reload.indicator.width = (reload.value * 32) / 100;
    }

    this.input.mouse.update();
  }
}

export default Player;
