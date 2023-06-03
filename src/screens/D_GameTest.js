import Rect from "../cluster/shapes/Rect";
import Vector from "../cluster/utils/Vector";
import Container from "../cluster/core/Container";
import TileMap from "../cluster/core/TileMap";
import entity from "../cluster/utils/entity";

class Level extends TileMap {
  constructor() {
    // prettier-ignore
    const levelMap= [
        '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
        '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
    ]
    const tileSize = 32;
    const mapW = 26;
    const mapH = 20;
    const tiles = levelMap.map((symbol, index) => {
      const tile = new Rect({ width: 32, height: 32, style: { fill: "transparent" } });
      tile.hitbox = {
        x: 0,
        y: 0,
        width: tileSize,
        height: tileSize,
      };
      switch (symbol) {
        case "#":
          tile.walkable = false;
          break;
        default:
          tile.walkable = true;
          break;
      }
      return tile;
    });

    super(tiles, mapW, mapH, tileSize, tileSize);
  }

  update(dt, t) {
    const { children } = this;
    children.map((tile) => {
      tile.style.fill = tile.walkable ? "transparent" : "blue";
    });
  }
}

class Player extends Rect {
  constructor(input) {
    super({
      width: 8,
      height: 8,
      style: { fill: "black" },
    });

    this.input = input;
    this.speed = 400;
    this.position = new Vector(100, 100);
    this.hitbox = {
      x: 0,
      y: 0,
      width: 8,
      height: 8,
    };
  }

  get bounds() {
    const { position, width, height } = this;
    return {
      x: position.x,
      y: position.y,
      width,
      height,
    };
  }

  update(dt, t) {
    const { input, speed, position } = this;
    let dx = 0;
    let dy = 0;
    if (input.key.x) dx = speed * dt * input.key.x;
    if (input.key.y) dy = speed * dt * input.key.y;
    position.add(new Vector(dx, dy));
  }
}

class GameTest extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.onExit = transitions?.onExit || function () {};
    this.onEnter = transitions?.onEnter || function () {};
    this.updates = 0;
    this.input = input;
    this.game = game;

    // ...
    this.level = this.add(new Level());
    this.player = this.add(new Player(input));
  }

  update(dt, t) {
    super.update(dt, t);

    const { player, level } = this;
    const tilesAtPlayerCorners = level.tilesAtCorners(player.bounds);
    for (const tile of tilesAtPlayerCorners) {
      let hit = false;
      if (!tile.walkable) {
        entity.hit(player, tile, () => {
          player.position.set(100, 100);
          hit = true;
        });
      }
      if (hit) break;
    }
  }
}

export default GameTest;
