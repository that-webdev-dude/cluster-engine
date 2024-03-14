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
  Circle,
  Line,
  TileSprite,
  // TileMap,
} from "./cluster";

// tilemap stuff

// game instance
const game = new Game({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
});

const entityReposition = (entity: Entity | Container, dt: number) => {
  if (entity.velocity.magnitude) {
    entity.position.x += entity.velocity.x * dt;
    entity.position.y += entity.velocity.y * dt;
  }
  if (entity instanceof Container && entity.children.length > 0) {
    entity.children.forEach((child) => {
      entityReposition(child as Container, dt);
    });
  }
};

const entityDestroy = (entity: Entity, done?: Function) => {
  entity.dead = true;
  if (done) done();
};

const rectUpdatePosition = (entity: Rect | Sprite, dt: number) => {
  if (entity.velocity.magnitude) {
    entity.position.x += entity.velocity.x * dt;
    entity.position.y += entity.velocity.y * dt;
  }
};

const rectClampPosition = (
  entity: Rect | Sprite,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
) => {
  entity.position.set(
    Cmath.clamp(entity.position.x, minX, maxX - entity.width),
    Cmath.clamp(entity.position.y, minY, maxY - entity.height)
  );
};

const rectCollision = (source: Rect | Sprite, target: Rect | Sprite) => {
  return (
    source.position.x < target.position.x + target.width &&
    source.position.x + source.width > target.position.x &&
    source.position.y < target.position.y + target.height &&
    source.position.y + source.height > target.position.y
  );
};

// gameplay scene
class GamePlay extends Container {
  background: Background = new Background();
  zombies: Container = new Container();
  player: Player = new Player(new Vector(100, 100), game.keyboard);
  // level: TileMap = new TileMap(
  //   GAME_CONFIG.levels[0].spritesheetURL,
  //   GAME_CONFIG.levels[0].dictionary,
  //   GAME_CONFIG.levels[0].layout,
  //   32,
  //   32
  // );

  constructor() {
    super();
    this.add(this.background);
    // this.add(this.level);
    this.add(this.player);
    this.add(this.zombies);
    this.init();

    // debug grid
    // for (let i = 0; i < GAME_CONFIG.width; i += 32) {
    //   this.add(
    //     new Line({
    //       start: new Vector(i, 0),
    //       end: new Vector(i, GAME_CONFIG.height),
    //       style: { stroke: "grey" },
    //     })
    //   );
    // }
    // for (let i = 0; i < GAME_CONFIG.height; i += 32) {
    //   this.add(
    //     new Line({
    //       start: new Vector(0, i),
    //       end: new Vector(GAME_CONFIG.width, i),
    //       style: { stroke: "grey" },
    //     })
    //   );
    // }
  }

  init(): void {
    this.zombies.add(new Zombie(new Vector(200, 200)));
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);

    // repositioning
    [this.player, ...this.zombies.children].forEach((entity) => {
      rectUpdatePosition(entity as Rect, dt);
    });

    // collision tests & resolution
    [...this.zombies.children].forEach((zombie) => {
      if (rectCollision(this.player as Sprite, zombie as Sprite)) {
        entityDestroy(zombie as Entity, () => {
          console.log("zombie destroyed");
        });
      }
    });

    // clamping to screen (more of a resolution)
    [this.player, ...this.zombies.children].forEach((entity) => {
      rectClampPosition(
        entity as Rect,
        0,
        0,
        GAME_CONFIG.width,
        GAME_CONFIG.height
      );
    });
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
