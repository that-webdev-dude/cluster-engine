import { GAME_CONFIG } from "./config/GameConfig";
import { Player } from "./entities/Player";
import { Zombie } from "./entities/Zombie";
import { Background } from "./entities/Background";
import {
  Container,
  Game,
  Cmath,
  Vector,
  Entity,
  Rect,
  Sprite,
  TileMap,
  Circle,
  Text,
  Line,
  TileSprite,
  Camera,
} from "./cluster";
import { World } from "./World";
import { Debugger } from "./Debugger";

// game instance
const game = new Game({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
});

type Collidable = Rect | Sprite | TileSprite;
type CollisionInfo = {
  collision: boolean;
  direction: "top" | "bottom" | "left" | "right" | "none";
  overlap: number;
  source: Collidable;
  target: Collidable;
};

// gameplay scene
class GamePlay extends Container {
  background: Background = new Background();
  zombies: Container = new Container();
  player: Player = new Player(new Vector(128, 128), game.keyboard);
  level: TileMap = new TileMap(
    GAME_CONFIG.levels[0].spritesheetURL,
    GAME_CONFIG.levels[0].dictionary,
    GAME_CONFIG.levels[0].layout,
    32,
    32
  );

  camera: Camera;

  constructor() {
    super();
    this.camera = new Camera({
      subject: this.player,
      viewSize: { width: GAME_CONFIG.width, height: GAME_CONFIG.height },
      worldSize: { width: this.level.width, height: this.level.height },
    });

    this.camera.add(this.background);
    this.camera.add(this.level);
    this.camera.add(this.player);
    this.camera.add(this.zombies);
    this.add(this.camera);
    this.init();

    // debug

    Debugger.showBoundingBox(this.player, this.camera);
    this.zombies.children.forEach((z) => {
      Debugger.showBoundingBox(z as Entity, this.camera, "red");
    });
  }

  init(): void {
    for (let i = 0; i < 10; i++) {
      let x = Cmath.randf(32, GAME_CONFIG.width - 64);
      let y = Cmath.randf(32, GAME_CONFIG.height - 64);
      this.zombies.add(new Zombie(new Vector(x, y)));
    }
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);

    const { player, zombies, level } = this;

    // repositioning
    World.reposition(this, dt);

    // collision tests & resolution
    World.Collider.detectOneToMany(
      player as TileSprite,
      zombies.children as TileSprite[]
    ).forEach((collisionInfo) => {
      World.Collider.resolve(collisionInfo as CollisionInfo, (c) => {
        c.target.dead = true;
      });
    });

    World.Collider.detectWallCollision(player, level).forEach(
      (collisionInfo) => {
        World.Collider.resolve(collisionInfo as CollisionInfo, (c) => {
          // ...
        });
      }
    );

    // clamping
    // [this.player, ...this.zombies.children].forEach((entity) => {
    //   rectClampPosition(
    //     entity as Rect,
    //     0,
    //     0,
    //     GAME_CONFIG.width,
    //     GAME_CONFIG.height
    //   );
    // });
  }
}

export default () => {
  game.setScene(new GamePlay());
  game.start();
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
