import { GAME_CONFIG } from "../config/GameConfig";
import { GAME_GLOBALS } from "../globals/GameGlobals";
import {
  // Container,
  Camera,
  Vector,
  State,
  Scene,
  Game,
  Text,
  Rect,
  Line,
  Dialog,
  Entity,
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

const obstacle = new Rect({
  width: 100,
  height: 100,
  fill: "transparent",
  stroke: "blue",
  // position: new Vector(width / 2 - 64, height / 2 - 64),
  position: new Vector(400, 400),
});

const rectangle = new Rect({
  width: 32,
  height: 32,
  fill: "transparent",
  stroke: "red",
  position: new Vector(width / 2, height / 2),
});

const line = new Line({
  start: new Vector(20, 500),
  end: new Vector(100, 100),
  stroke: "green",
});

class Ray {
  start: Vector;
  end: Vector;
  constructor(start: Vector, end: Vector) {
    this.start = start;
    this.end = end;
  }
  public get direction(): Vector {
    const dx = this.end.x - this.start.x;
    const dy = this.end.y - this.start.y;
    // const distance = Math.sqrt(dx * dx + dy * dy);
    let dirX = (this.end.x - this.start.x) / 1;
    let dirY = (this.end.y - this.start.y) / 1;
    return new Vector(dirX, dirY);
  }

  public get inverseDirection(): Vector {
    const dx = this.end.x - this.start.x;
    const dy = this.end.y - this.start.y;
    // const distance = Math.sqrt(dx * dx + dy * dy);
    let dirX = (this.start.x - this.end.x) / 1;
    let dirY = (this.start.y - this.end.y) / 1;
    return new Vector(dirX, dirY);
  }
}

class GamePlay extends Scene {
  static playerSpeedX = 250;
  static playerSpeedY = 250;

  state: State<STATES> = new State(STATES.play);
  dialog: Dialog | null = null;
  camera: Camera;
  ray: Ray;
  dbText: Text;

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
    this.camera.add(new GUI());
    this.camera.add(obstacle);
    this.camera.add(line);
    this.add(this.camera);

    this.ray = new Ray(new Vector(35, 150), new Vector(0, 0));
    line.start = this.ray.start;
    line.end = this.ray.end;

    this.dbText = new Text({
      text: "db",
      align: "center",
      fill: "black",
      font: `20px ${fontStyle}`,
      position: new Vector(width / 2, GAME_CONFIG.height - 32),
    });
    this.camera.add(this.dbText);
  }

  pointVsRect(point: { x: number; y: number }, rect: Rect): boolean {
    const { position, width, height } = rect;
    const { x, y } = position;
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }

  rectVsRect(rectA: Rect, rectB: Rect): boolean {
    return (
      rectA.position.x + rectA.width >= rectB.position.x &&
      rectA.position.x <= rectB.position.x + rectB.width &&
      rectA.position.y + rectA.height >= rectB.position.y &&
      rectA.position.y <= rectB.position.y + rectB.height
    );
  }

  rayVsRect(rect: Rect, ray: Ray): boolean {
    let tx1 = (rect.position.x - ray.start.x) / ray.inverseDirection.x;
    let tx2 =
      (rect.position.x + rect.width - ray.start.x) / ray.inverseDirection.x;
    let tmin = Math.min(tx1, tx2);
    let tmax = Math.max(tx1, tx2);
    let ty1 = (rect.position.y - ray.start.y) / ray.inverseDirection.y;
    let ty2 =
      (rect.position.y + rect.height - ray.start.y) / ray.inverseDirection.y;
    tmin = Math.max(tmin, Math.min(ty1, ty2));
    tmax = Math.min(tmax, Math.max(ty1, ty2));
    this.dbText.text = `x: ${tmin.toFixed(4)}, y: ${tmax.toFixed(4)}`;
    return tmax >= tmin && Math.abs(tmax) <= 1;
  }

  private _updateGamePlay(dt: number, t: number): void {
    super.update(dt, t);

    const { mouse } = this.game;
    this.ray.end.x = mouse.position.x;
    this.ray.end.y = mouse.position.y;

    if (this.rayVsRect(obstacle, this.ray)) {
      line.stroke = "red";
    } else {
      line.stroke = "black";
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
    this.game.mouse.update();
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
