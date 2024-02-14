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
  center = new Vector();
  velocity = new Vector();
  acceleration = new Vector();
  direction = new Vector();
  prevPosition = new Vector();
  constructor() {
    super({
      width: 50,
      height: 50,
      fill: "transparent",
      stroke: "red",
      position: new Vector(100, 300),
    });
    this.hitbox = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
  get size(): Vector {
    return new Vector(this.width, this.height);
  }

  public update(dt: number, t: number): void {
    this.center.x = this.position.x + this.width / 2;
    this.center.y = this.position.y + this.height / 2;
    this.direction.copy(this.velocity).normalize();
  }
}

class Obstacle extends Rect {
  constructor(position: Vector) {
    super({
      width: 200,
      height: 300,
      fill: "transparent",
      stroke: "blue",
      position: position,
    });
    this.hitbox = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
  get size(): Vector {
    return new Vector(this.width, this.height);
  }
  public update(dt: number, t: number): void {}
}

class GamePlay extends Scene {
  static playerSpeedX = 250;
  static playerSpeedY = 250;
  state: State<STATES> = new State(STATES.play);
  dialog: Dialog | null = null;
  camera: Camera;
  player: Player = new Player();
  obstaclesContainer: Container = new Container();
  obstacle = new Obstacle(new Vector(200, 200));
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
    this.camera.add(new GUI());
    this.camera.add(this.obstacle);
    this.camera.add(this.dbLine1);
    this.camera.add(this.dbLine2);
    this.camera.add(this.dbText);
    this.camera.add(this.dbPoint);
    this.add(this.camera);
  }

  private _updateGamePlay(dt: number, t: number): void {
    super.update(dt, t);
    const { player, obstacle } = this;
    const { keyboard, mouse } = this.game;
    const { dbLine1, dbLine2, dbText, dbPoint } = this;

    if (keyboard.action) {
      dbPoint.position.set(Cmath.randf(0, width), Cmath.randf(0, height));
      keyboard.active = false;
    }

    // dbPoint.position.set(250, 250);
    if (AABB.pointVsRect(dbPoint.position, obstacle)) {
      dbPoint.scale.set(3, 3);
      dbPoint.fill = "lightgreen";
      dbText.text = "hit";
    } else {
      dbPoint.scale.set(1, 1);
      dbPoint.fill = "red";
      dbText.text = "miss";
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
