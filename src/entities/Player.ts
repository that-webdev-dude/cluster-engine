import { TileSprite, Vector, Keyboard, State, Cmath } from "../cluster";
import spritesheetImageURL from "../images/spritesheet.png";

const GRAVITY = (9.8 * 1000) / 8;
enum States {
  IDLE = "IDLE",
  WALK = "WALK",
  JUMP = "JUMP",
  FALL = "FALL",
}

export class Player extends TileSprite {
  keyboard: Keyboard;
  state: State<States>;

  constructor(position: Vector, keyboard: Keyboard) {
    super({
      imageURL: spritesheetImageURL,
      position: position,
      tileWidth: 32,
      tileHeight: 32,
    });
    this.state = new State(States.FALL);
    this.keyboard = keyboard;
    this.animation.add(
      "idle",
      [
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      0.25
    );
    this.animation.play("idle");
  }

  hitTheGround() {
    this.velocity.y = 0;
    // if (this.velocity.x !== 0) {
    //   this.state.set(States.WALK);
    // } else {
    this.state.set(States.IDLE);
    // }
  }

  hitTheCeiling() {
    this.state.set(States.FALL);
  }

  hitTheWall() {
    this.velocity.x = 0;
    if (this.velocity.y === 0) {
      this.state.set(States.IDLE);
    } else {
      this.state.set(States.FALL);
    }
  }

  hitMapTile(direction: string) {
    // console.log("Player ~ hitMapTile ~ direction:", direction);
    switch (direction) {
      case "bottom":
        this.hitTheGround();
        break;
      case "top":
        this.hitTheCeiling();
        break;
      case "left":
      case "right":
        this.hitTheWall();
        break;
    }
  }

  applyFriction() {
    this.acceleration.x += -this.velocity.x * 8;
  }

  applyGravity() {
    this.acceleration.y += GRAVITY;
  }

  applyForceX(x: number) {
    this.acceleration.x += x;
  }

  public update(dt: number): void {
    super.update(dt);
    const { keyboard } = this;

    switch (this.state.get()) {
      case States.FALL:
        this.applyGravity();
        if (keyboard.x) {
          this.applyForceX(1800 * keyboard.x);
        }
        break;

      case States.IDLE:
        // this.velocity.set(0, 0);
        // this.acceleration.set(0, 0);
        if (keyboard.action) {
          this.state.set(States.JUMP);
        }
        if (keyboard.x) {
          this.state.set(States.WALK);
        }
        break;

      case States.WALK:
        // this.applyGravity();
        // if (keyboard.x) {
        //   this.applyForceX(1800 * keyboard.x);
        // } else {
        //   this.applyFriction();
        //   if (this.velocity.x > -20 && this.velocity.x < 20) {
        //     this.state.set(States.IDLE);
        //   }
        // }
        // this.velocity.x = Cmath.clamp(this.velocity.x, -400, 400);
        if (keyboard.action) {
          this.state.set(States.JUMP);
        }
        this.applyGravity();
        if (keyboard.x) {
          this.applyForceX(1800 * keyboard.x);
        } else {
          this.applyFriction();
          if (this.velocity.x > -20 && this.velocity.x < 20) {
            this.velocity.x = 0;
            this.state.set(States.IDLE);
          }
        }

        break;

      case States.JUMP:
        if (this.state.first) {
          // this.velocity.y = -1000;
          this.acceleration.y = -500 / dt;
        }
        this.applyGravity();
        this.acceleration.x += keyboard.x * 1800;
        // this.velocity.x = Cmath.clamp(this.velocity.x, -400, 400);
        // this.acceleration.y += GRAVITY;
        if (this.velocity.y > 0) {
          this.state.set(States.FALL);
        }
        // console.log(this.velocity.y);
        break;
    }

    console.log(this.velocity.x, this.velocity.y, this.state.get());

    this.state.update(dt);

    if (keyboard.x) {
      this.scale.x = keyboard.x;
      this.anchor.x = keyboard.x < 0 ? -keyboard.x * 32 : 0;
    }

    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }
}
