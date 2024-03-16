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
} from "./cluster";
import { World } from "./World";
import { Debugger } from "./Debugger";

// game instance
const game = new Game({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
});

const getEntityDisplacement = (
  entity: Entity,
  dt: number
): { dx: number; dy: number } => {
  return {
    dx: entity.velocity.x * dt,
    dy: entity.velocity.y * dt,
  };
};

const entityDestroy = (entity: Entity, done?: Function) => {
  entity.dead = true;
  if (done) done();
};

const rectReposition = (entity: Rect | Sprite, dt: number) => {
  if (entity.velocity.magnitude) {
    entity.position.x += entity.velocity.x * dt;
    entity.position.y += entity.velocity.y * dt;
  }
};

const rectWallslide = (entity: Rect | Sprite, tilemap: TileMap) => {
  let tiles = tilemap.tilesAtBoxCorners(
    entity.position,
    entity.width,
    entity.height,
    0,
    0
  );
  if (tiles[0] && tiles[1]) {
    // top
    entity.position.y = tiles[0].position.y + tiles[0].height;
  }
  if (tiles[2] && tiles[3]) {
    // bottom
    entity.position.y = tiles[2].position.y - entity.height;
  }
  if (tiles[0] && tiles[2]) {
    // left
    entity.position.x = tiles[0].position.x + tiles[0].width;
  }
  if (tiles[1] && tiles[3]) {
    // right
    entity.position.x = tiles[1].position.x - entity.width;
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

// rect collision
const CollisionDirections = {
  TOP: "top",
  BOTTOM: "bottom",
  LEFT: "left",
  RIGHT: "right",
  NONE: "none",
} as const;
type CollisionInfo = {
  direction: (typeof CollisionDirections)[keyof typeof CollisionDirections];
  overlapX: number;
  overlapY: number;
}; // this can be named CollisionData
const rectCollisionDetection = (
  source: Rect | Sprite,
  target: Rect | Sprite
): CollisionInfo | null => {
  const collisionInfo: CollisionInfo = {
    direction: CollisionDirections.NONE,
    overlapX: 0,
    overlapY: 0,
  };

  // Check for collision
  if (
    source.position.x < target.position.x + target.width &&
    source.position.x + source.width > target.position.x &&
    source.position.y < target.position.y + target.height &&
    source.position.y + source.height > target.position.y
  ) {
    // Calculate overlap
    const overlapX =
      Math.min(
        source.position.x + source.width,
        target.position.x + target.width
      ) - Math.max(source.position.x, target.position.x);
    const overlapY =
      Math.min(
        source.position.y + source.height,
        target.position.y + target.height
      ) - Math.max(source.position.y, target.position.y);

    // Determine collision direction
    if (overlapX > overlapY) {
      if (source.position.y < target.position.y) {
        collisionInfo.direction = "bottom";
      } else {
        collisionInfo.direction = "top";
      }
    } else {
      if (source.position.x < target.position.x) {
        collisionInfo.direction = "right";
      } else {
        collisionInfo.direction = "left";
      }
    }

    // Assign overlap values
    collisionInfo.overlapX = overlapX;
    collisionInfo.overlapY = overlapY;
    return collisionInfo;
  }

  return null;
};

const rectCollisionResolution = (
  source: Rect | Sprite,
  collisionInfo: CollisionInfo,
  done?: Function
): void => {
  if (collisionInfo.direction === "none") {
    return;
  }

  // Resolve collision based on collision direction and overlap
  switch (collisionInfo.direction) {
    case "top":
      source.position.y += collisionInfo.overlapY;
      break;
    case "bottom":
      source.position.y -= collisionInfo.overlapY;
      break;
    case "left":
      source.position.x += collisionInfo.overlapX;
      break;
    case "right":
      source.position.x -= collisionInfo.overlapX;
      break;
    default:
      break;
  }

  if (done) done();
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

  constructor() {
    super();
    this.add(this.background);
    this.add(this.level);
    this.add(this.player);
    this.add(this.zombies);
    this.init();

    const c = new Line({
      start: new Vector(32, 32),
      end: new Vector(64, 64),
      style: { stroke: "red" },
    });
    this.add(c);

    const t = new Text({
      text: "Hello World",
      position: new Vector(64, 64),
      style: { fill: "red", align: "left" },
    });
    this.add(t);

    // debug
    Debugger.showGrid(this, GAME_CONFIG.width, GAME_CONFIG.height, 32);
    Debugger.showBoundingBox(this.player, this);
    Debugger.showBoundingBox(c, this);
    Debugger.showBoundingBox(t, this);
  }

  init(): void {
    this.zombies.add(new Zombie(new Vector(200, 200)));
  }

  // wallslide(
  //   entity: Rect | Sprite,
  //   dx: number,
  //   dy: number
  // ): { xo: number; yo: number } {
  //   // // wallslide
  //   let xo = dx;
  //   let yo = dy;
  //   let tiles = this.level.tilesAtBoxCorners(
  //     entity.position,
  //     entity.width,
  //     entity.height,
  //     dx,
  //     dy
  //   );
  //   let [tl, tr, bl, br] = tiles.map((tile) => {
  //     if (tile) {
  //       let { walkable } = tile.frame as TileFrame;
  //       return !walkable;
  //     }
  //   });

  //   if (dy !== 0) {
  //     if (dy < 0 && tl && tr) {
  //       // console.log("hit head");
  //       if (tiles[0]) {
  //         let tileEdge = tiles[0].position.y + tiles[0].height;
  //         yo = tileEdge - entity.position.y - 1;
  //       }
  //     }
  //     if (dy > 0 && bl && br) {
  //       // console.log("hit bottom");
  //       if (tiles[2]) {
  //         let tileEdge = tiles[2].position.y;
  //         yo = tileEdge - (entity.position.y + entity.height);
  //       }
  //     }
  //   }

  //   if (dx !== 0) {
  //     if (dx < 0 && tl && bl) {
  //       // console.log("hit left");
  //       if (tiles[0]) {
  //         let tileEdge = tiles[0].position.x + tiles[0].width;
  //         xo = tileEdge - entity.position.x;
  //       }
  //     }
  //     if (dx > 0 && tr && br) {
  //       // console.log("hit right");
  //       if (tiles[1]) {
  //         let tileEdge = tiles[1].position.x;
  //         xo = tileEdge - (entity.position.x + entity.width);
  //       }
  //     }
  //   }

  //   return { xo, yo };
  // }

  public update(dt: number, t: number): void {
    super.update(dt, t);

    const { player, zombies, level } = this;

    // repositioning
    World.reposition(this, dt);

    // // collision tests & resolution
    [...zombies.children].forEach((zombie) => {
      let { collision, overlap, nx, ny } = World.Collider.detect(
        player as TileSprite,
        zombie as TileSprite
      );
      if (collision) {
        console.log(overlap, nx, ny);
        this.background.style.fill = "red";
      } else {
        this.background.style.fill = "lightBlue";
      }
    });

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
