import { GAME_CONFIG } from "../config/GameConfig";
import { GAME_GLOBALS } from "../globals/GameGlobals";
import {
  Camera,
  Vector,
  State,
  Scene,
  Game,
  Text,
  Rect,
  Dialog,
  Physics,
  Cmath,
} from "../ares";
import Container from "../ares/core/Container";
import PauseDialog from "../dialogs/PauseDialog";

// GUI components into a separate layer
const { width, height, fontStyle } = GAME_CONFIG;
class GUI extends Container {
  private _timerText = new Text({
    text: "",
    align: "center",
    fill: "black",
    font: `20px ${fontStyle}`,
    position: new Vector(width / 2, 32),
  });

  constructor() {
    super();
    this.add(this._timerText);
  }

  public update(dt: number, t: number): void {
    this._timerText.text = `${Math.floor(GAME_GLOBALS.elapsedTime) + 1}`;
  }
}

// gameplay states
enum STATES {
  play,
  pause,
}

class Player extends Rect {
  size = new Vector();
  center = new Vector();
  velocity = new Vector();
  acceleration = new Vector();
  direction = new Vector();
  constructor() {
    super({
      width: 50,
      height: 50,
      fill: "transparent",
      stroke: "red",
      position: new Vector(0, 0),
    });
  }

  public update(dt: number, t: number): void {
    this.center.x = this.position.x + this.width / 2;
    this.center.y = this.position.y + this.height / 2;

    this.size.x = this.width;
    this.size.y = this.height;

    this.direction.copy(this.velocity).normalize();
  }
}

class Obstacle extends Rect {
  constructor(position: Vector) {
    super({
      width: 200,
      height: 500,
      fill: "transparent",
      stroke: "blue",
      position: position,
    });
    this.dead = false;
  }
  public update(dt: number, t: number): void {}
}

type Collision = {
  collision: boolean;
  contact?: Vector | null;
  normal?: Vector | null;
  time?: number | 0;
};

type StaticEntity = {
  position: Vector;
  width: number;
  height: number;
};

const nullCollision: Collision = {
  collision: false,
};

class GamePlay extends Scene {
  static playerSpeedX = 250;
  static playerSpeedY = 250;

  state: State<STATES> = new State(STATES.play);
  dialog: Dialog | null = null;
  camera: Camera;
  player: Player = new Player();
  obstaclesContainer: Container = new Container();
  obstacle = new Obstacle(new Vector(500, 100));

  constructor(
    game: Game,
    transitions: {
      toNext: () => void;
      toFirst: () => void;
    }
  ) {
    const { width, height } = game;
    super(game, transitions);
    this.dialog = null;
    this.camera = new Camera({
      worldSize: { width, height },
      viewSize: { width, height },
    });

    this.obstaclesContainer.add(this.obstacle);
    this.camera.add(new GUI());
    this.camera.add(this.player);
    this.camera.add(this.obstaclesContainer);
    this.add(this.camera);
  }

  _detect(rayOrigin: Vector, rayDirection: Vector, target: Rect): Collision {
    const { position, width, height } = target;

    let tNearX = (position.x - rayOrigin.x) / rayDirection.x;
    let tNearY = (position.y - rayOrigin.y) / rayDirection.y;
    let tFarX = (position.x + width - rayOrigin.x) / rayDirection.x;
    let tFarY = (position.y + height - rayOrigin.y) / rayDirection.y;
    if (tNearX > tFarX) {
      [tNearX, tFarX] = [tFarX, tNearX];
    }
    if (tNearY > tFarY) {
      [tNearY, tFarY] = [tFarY, tNearY];
    }
    if (tNearX > tFarY || tNearY > tFarX) return nullCollision;

    let tHitNear = Math.max(tNearX, tNearY);
    let tHitFar = Math.min(tFarX, tFarY);
    if (tHitFar < 0) return nullCollision;

    // if (tHitNear <= 1) {
    let contact = new Vector(
      rayOrigin.x + rayDirection.x * tHitNear,
      rayOrigin.y + rayDirection.y * tHitNear
    );

    let normal = new Vector(0, 0);
    if (contact.y === target.position.y) {
      normal.y = -1;
    }
    if (contact.y === target.position.y + target.height) {
      normal.y = 1;
    }
    if (contact.x === target.position.x) {
      normal.x = -1;
    }
    if (contact.x === target.position.x + target.width) {
      normal.x = 1;
    }

    return (
      this,
      {
        collision: true,
        contact: contact,
        normal: normal,
        time: tHitNear,
      }
    );
    // }
    // return nullCollision;
  }

  private _updateGamePlay(dt: number, t: number): void {
    super.update(dt, t);
    const { player } = this;
    const { keyboard, mouse } = this.game;

    // Assuming there are constants for maxSpeed and friction
    const MAX_SPEED = 300; // Max speed
    const FRICTION = 0.95; // Friction factor, should be < 1

    player.acceleration.x += keyboard.x * 1000;
    player.acceleration.y += keyboard.y * 1000;

    // Apply friction to the velocity to simulate resistance
    player.velocity.x *= FRICTION;
    player.velocity.y *= FRICTION;

    // Update velocity with acceleration
    player.velocity.x += player.acceleration.x * dt;
    player.velocity.y += player.acceleration.y * dt;

    // Clamp the velocity to prevent it from exceeding max speed
    player.velocity.x = Math.max(
      Math.min(player.velocity.x, MAX_SPEED),
      -MAX_SPEED
    );
    player.velocity.y = Math.max(
      Math.min(player.velocity.y, MAX_SPEED),
      -MAX_SPEED
    );

    // Collision detection logic...
    // Predict the new position
    let predictedPosition = {
      x: player.position.x + player.velocity.x * dt,
      y: player.position.y + player.velocity.y * dt,
    };
    // Get the player's center and direction for raycasting
    let rOrigin = player.center; // Assuming player has a center property
    let rDirection = player.direction; // Assuming player.velocity has a unit method
    let { collision, contact, normal, time } = this._detect(
      rOrigin,
      rDirection,
      this.obstacle
    );
    // If a collision is detected and it will occur within this time step
    if (collision && contact && normal && time && time <= 1) {
      // Resolve the collision
      // Move the player to the point of contact
      player.position.x = contact.x;
      player.position.y = contact.y;

      // Reflect the velocity off the collision normal
      // Assuming there is a reflect method that reflects the velocity vector
      player.velocity.set(0, 0);
      // player.velocity = player.velocity.reflect(normal);

      // Optionally apply some restitution (bounciness)
      // const restitution = 0.8; // Restitution coefficient
      // player.velocity.x *= restitution;
      // player.velocity.y *= restitution;
    } else {
      // If no collision, update the player position normally
      player.position.x = predictedPosition.x;
      player.position.y = predictedPosition.y;
    }

    // Reset acceleration after applying it to the velocity
    player.acceleration.x = 0;
    player.acceleration.y = 0;

    player.position.x = Cmath.clamp(player.position.x, 0, width - player.width);
    player.position.y = Cmath.clamp(
      player.position.y,
      0,
      height - player.height
    );

    // if (keyboard.x || keyboard.y) {
    //   Physics.applyForce(player, {
    //     x: keyboard.x * 8000,
    //     y: keyboard.y * 8000,
    //   });
    // }
    // Physics.applyFriction(player, 10);
    // Physics.updateWithCollisions(
    //   player,
    //   this.obstaclesContainer.children as unknown as [StaticEntity],
    //   dt
    // );

    // game win if hit the goal
    // Entity.hit(this.player, this.goal, () => {
    //   GAME_GLOBALS.isWin = true;
    //   this.transitions.toNext();
    // });

    // // game loose if hit the enemy
    // Entity.hit(this.player, this.enemy, () => {
    //   GAME_GLOBALS.isWin = false;
    //   this.transitions.toNext();
    // });

    GAME_GLOBALS.elapsedTime += dt;
    mouse.update();
  }

  private _updateGamePause(dt: number, t: number): void {
    if (this.game.keyboard.key("Enter")) {
      if (this.dialog) {
        this.dialog.dead = true;
        this.state.set(STATES.play);
        this.game.keyboard.active = false;
      }
    }
    if (this.game.keyboard.key("Escape")) {
      if (this.dialog) {
        this.dialog.dead = true;
        this.transitions.toFirst();
        this.game.keyboard.active = false;
      }
    }
  }

  update(dt: number, t: number): void {
    this.state.update(dt);
    switch (this.state.get()) {
      // PLAYING STATE
      case STATES.play:
        this._updateGamePlay(dt, t);
        if (this.game.keyboard.pause) {
          this.game.keyboard.active = false;
          this.state.set(STATES.pause);
        }
        break;

      // PAUSED STATE
      case STATES.pause:
        if (this.state.first) {
          this.dialog = new PauseDialog(this.game);
          this.camera.add(this.dialog);
        }
        this._updateGamePause(dt, t);
        break;
    }
  }
}

export default GamePlay;
