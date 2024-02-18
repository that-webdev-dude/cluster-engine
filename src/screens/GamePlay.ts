import {
  Camera,
  Vector,
  State,
  Scene,
  Game,
  Text,
  Rect,
  Dialog,
  Container,
} from "../ares";
import { GAME_CONFIG } from "../config/GameConfig";
import { GAME_GLOBALS } from "../globals/GameGlobals";
import PauseDialog from "../dialogs/PauseDialog";
import Platform from "../entities/Platform";
import Player from "../entities/Player";
import AABB from "../ares/physics/AABB";
import Physics from "../ares/physics/Physics";

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

class GamePlay extends Scene {
  state: State<STATES> = new State(STATES.play);
  dialog: Dialog | null = null;
  camera: Camera;
  staticEntities = new Container();
  physicsEntities = new Container();
  player: Player = new Player();
  ground = new Platform(new Vector(0, 500), new Vector(GAME_CONFIG.width, 10));
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
    // this.camera.add(this.ground);
    // this.camera.add(this.player);
    this.staticEntities.add(this.ground);
    this.physicsEntities.add(this.player);
    this.camera.add(this.staticEntities);
    this.camera.add(this.physicsEntities);
    this.camera.add(new GUI());
    this.add(this.camera);
  }

  private _updateGamePlay(dt: number, t: number): void {
    super.update(dt, t);
    const { player, ground } = this;
    const { keyboard, mouse } = this.game;

    const ACCELERATION = 4000;
    const FRICTION = 5;
    Physics.applyForce(player, {
      x: keyboard.x * ACCELERATION,
      y: keyboard.y * ACCELERATION,
    }).applyFriction(player, FRICTION);

    if (keyboard.action) {
      Physics.applyImpulse(player, { x: 0, y: -1000 }, dt);
      keyboard.active = false;
    }

    // Physics.applyGravity(player, 2000).verletIntegrator(player, dt);
    Physics.updateEntity(player, dt);

    let extObstacle = new Rect({
      width: ground.width + player.width,
      height: ground.height + player.height,
      fill: "transparent",
      stroke: "green",
      position: ground.position
        .clone()
        .subtract(new Vector(player.width / 2, player.height / 2)),
    });
    let { collision, time, normal, contact } = AABB.rayVsRect(
      player.center,
      player.direction,
      extObstacle
    );
    if (collision && normal && contact && time && time < 1) {
      if (normal.x !== 0) {
        player.position.x = contact.x - player.width * 0.5 + normal.x * 0.1;
        player.velocity.x = 0;
      }
      if (normal.y !== 0) {
        player.position.y = contact.y - player.height * 0.5 + normal.y * 0.1;
        player.velocity.y = 0;
      }
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
