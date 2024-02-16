import {
  Camera,
  Vector,
  State,
  Scene,
  Game,
  Text,
  Rect,
  Dialog,
  Line,
  Circle,
  Cmath,
} from "../ares";
import { GAME_CONFIG } from "../config/GameConfig";
import { GAME_GLOBALS } from "../globals/GameGlobals";
import Container from "../ares/core/Container";
import PauseDialog from "../dialogs/PauseDialog";
import AABB from "../ares/physics/AABB";

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
  velocity = new Vector();
  acceleration = new Vector();
  prevPosition = new Vector();
  constructor() {
    super({
      width: 50,
      height: 50,
      fill: "black",
      position: new Vector(100, 300),
    });
    this.hitbox = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
  get center(): Vector {
    return new Vector(
      this.position.x + this.width * 0.5,
      this.position.y + this.height * 0.5
    );
  }
  get direction(): Vector {
    return this.velocity.clone().normalize();
  }
  get size(): Vector {
    return new Vector(this.width, this.height);
  }
}

class Obstacle extends Rect {
  walkable = false;
  constructor(position: Vector) {
    super({
      width: 200,
      height: 200,
      fill: "blue",
      position: position,
    });
    this.hitbox = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
  get center(): Vector {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }
  get size(): Vector {
    return new Vector(this.width, this.height);
  }
}

class GamePlay extends Scene {
  static playerSpeedX = 250;
  static playerSpeedY = 250;
  state: State<STATES> = new State(STATES.play);
  dialog: Dialog | null = null;
  camera: Camera;
  player: Player = new Player();
  obstaclesContainer: Container = new Container();
  obstacle = new Obstacle(new Vector(400, 200));
  dbLine1 = new Line({
    stroke: "red",
    start: new Vector(0, 0),
    end: new Vector(0, 0),
  });
  dbLine2 = new Line({
    stroke: "red",
    start: new Vector(0, 0),
    end: new Vector(0, 0),
  });
  dbPoint = new Circle({
    radius: 5,
    fill: "transparent",
    position: new Vector(0, 0),
    anchor: new Vector(-5, -5),
  });
  dbText = new Text({
    text: "aaaa",
    align: "center",
    fill: "black",
    font: `20px ${fontStyle}`,
    position: new Vector(GAME_CONFIG.width / 2, GAME_CONFIG.height - 32),
  });

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
    this.camera.add(this.obstaclesContainer);
    this.camera.add(this.player);
    this.camera.add(new GUI());
    this.add(this.camera);

    this.camera.add(this.dbText);
    this.camera.add(this.dbLine1);
    this.camera.add(
      new Rect({
        width: this.obstacle.width + this.player.width,
        height: this.obstacle.height + this.player.height,
        fill: "transparent",
        stroke: "green",
        position: this.obstacle.position
          .clone()
          .subtract(new Vector(this.player.width / 2, this.player.height / 2)),
      })
    );
    // this.camera.add(this.dbLine2);
    // this.camera.add(this.dbPoint);
  }

  private _updateGamePlay(dt: number, t: number): void {
    super.update(dt, t);
    const { player, obstacle } = this;
    const { keyboard, mouse } = this.game;
    const { dbLine1, dbLine2, dbText, dbPoint } = this;

    const ACCELERATION = 3200;
    const FRICTION = 0.9;

    // euler physics
    // player.velocity.x += keyboard.x * ACCELERATION * dt;
    // player.velocity.y += keyboard.y * ACCELERATION * dt;
    // player.velocity.x *= FRICTION;
    // player.velocity.y *= FRICTION;
    // player.position.x += player.velocity.x * dt;
    // player.position.y += player.velocity.y * dt;
    // player.acceleration.set(0, 0);

    // verlet physics
    player.acceleration.x = keyboard.x * ACCELERATION;
    player.acceleration.y = keyboard.y * ACCELERATION;
    player.velocity.x *= FRICTION;
    player.velocity.y *= FRICTION;
    let vx = player.velocity.x + player.acceleration.x * dt;
    let vy = player.velocity.y + player.acceleration.y * dt;
    let dx = (player.velocity.x + vx) * 0.5 * dt;
    let dy = (player.velocity.y + vy) * 0.5 * dt;
    player.position.x += dx;
    player.position.y += dy;
    player.velocity.x = vx;
    player.velocity.y = vy;
    player.acceleration.set(0, 0);

    dbLine1.start.set(player.center.x, player.center.y);
    dbLine1.end.set(
      player.center.x + player.direction.x * 100,
      player.center.y + player.direction.y * 100
    );
    dbText.text = `${player.direction.x.toPrecision(
      3
    )}, ${player.direction.y.toPrecision(3)}`;

    let extObstacle = new Rect({
      width: obstacle.width + player.width,
      height: obstacle.height + player.height,
      fill: "transparent",
      stroke: "green",
      position: obstacle.position
        .clone()
        .subtract(new Vector(player.width / 2, player.height / 2)),
    });
    let { collision, time, normal, contact } = AABB._rayVsRectV1(
      player.center,
      player.direction,
      extObstacle
    );
    if (collision && normal && contact && time && time < 1) {
      if (normal.x !== 0) {
        player.position.x = contact.x - player.width * 0.5;
      }
      if (normal.y !== 0) {
        player.position.y = contact.y - player.height * 0.5;
      }
      dbText.text = `${contact.x}, ${contact.y}`;
    }

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
