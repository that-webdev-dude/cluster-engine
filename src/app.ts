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
  Line,
} from "./cluster";

type DebugLine = Line & { update: (dt: number, t: number) => void };
class Debugger {
  private static _visualizePoint(
    point: Vector,
    scene: Container,
    style: { fill: string; stroke: string }
  ) {
    scene.add(
      new Circle({
        position: point,
        radius: 5,
        style,
      })
    );
  }

  static visualizePosition(entity: Entity, scene: Container) {
    Debugger._visualizePoint(entity.position, scene, {
      fill: "red",
      stroke: "red",
    });
  }

  static visualizeVelocity(
    entity: Entity,
    scene: Container,
    scalar: number = 1
  ) {
    let debugLine = new Line({
      start: entity.position,
      end: Vector.clone(entity.position).add(entity.velocity).scale(scalar),
      style: { stroke: "red" },
    }) as DebugLine;
    debugLine.update = (dt: number, t: number) => {
      debugLine.end.set(
        entity.position.x + entity.velocity.x * scalar,
        entity.position.y + entity.velocity.y * scalar
      );
    };
    scene.add(debugLine);
  }

  static showGrid(
    scene: Container,
    width: number,
    height: number,
    size: number
  ) {
    for (let i = 0; i < width; i += size) {
      scene.add(
        new Line({
          start: new Vector(i, 0),
          end: new Vector(i, height),
          style: { stroke: "grey" },
        })
      );
    }
    for (let i = 0; i < height; i += size) {
      scene.add(
        new Line({
          start: new Vector(0, i),
          end: new Vector(width, i),
          style: { stroke: "grey" },
        })
      );
    }
  }
}

import {
  DevRect,
  DevCircle,
  DevLine,
  DevContainer,
} from "./cluster/types/cluster.dev";
const devEntities = new DevContainer({ position: new Vector(0, 0) });
const r = new DevRect({
  width: 64,
  height: 64,
  position: new Vector(64, 64),
  style: { fill: "blue", stroke: "red" },
});
const c = new DevCircle({
  radius: 32,
  position: new Vector(128, 128),
  style: {
    fill: "green",
    stroke: "red",
  },
});
const l = new DevLine({
  start: new Vector(0, 0),
  end: new Vector(64, 64),
  style: { stroke: "red" },
});
l.position.set(256, 256);
console.table(l);
devEntities.add(r);
devEntities.add(c);
devEntities.add(l);

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
type TileFrame = { x: number; y: number; walkable?: boolean };

// gameplay scene
class GamePlay extends Container {
  background: Background = new Background();
  zombies: Container = new Container();
  player: Player = new Player(new Vector(100, 100), game.keyboard);
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

    // debug
    Debugger.visualizePosition(this.player, this);
    Debugger.visualizeVelocity(this.player, this);
    Debugger.showGrid(this, GAME_CONFIG.width, GAME_CONFIG.height, 32);

    Debugger.visualizePosition(r, this);
    this.add(devEntities);
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

    // repositioning
    [this.player].forEach((entity) => {
      rectReposition(entity, dt);
      rectWallslide(entity, this.level);
    });

    // collision tests & resolution
    [...this.zombies.children].forEach((zombie) => {
      let collisionInfo = rectCollisionDetection(this.player, zombie as Sprite);
      if (collisionInfo) {
        rectCollisionResolution(this.player, collisionInfo);
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
