import Screen from "./Screen";
import cluster from "../cluster";

const { GridHash, Container, Rect, Vector, math, entity } = cluster;
const { hit } = entity;
const useHash = true;
const cellSize = 128;
const numSprites = 100;
const hash = new GridHash(cellSize);

class GameTest extends Screen {
  constructor(game, input, globals = {}, transitions = {}) {
    super(game, input, globals, transitions);

    // background
    const background = this.add(
      new Rect({
        width: game.width,
        height: game.height,
        style: { fill: "black" },
      })
    );

    // sprites container
    this.sprites = this.add(new Container());
    for (let i = 0; i < numSprites; i++) {
      this.sprites.add(
        this.makeSprite(math.rand(-16, game.width), math.rand(-16, game.height))
      );
    }

    // player
    this.player = this.add(
      new Rect({ width: 16, height: 16, style: { fill: "blue" } })
    );
    this.player.position = new Vector(0, 0);
    this.player.hitbox = {
      x: 0,
      y: 0,
      width: 16,
      height: 16,
    };

    // qc grid
    this.hashGrid = this.add(new Container());
    for (let j = 0; j < game.height / cellSize; j++) {
      for (let i = 0; i < game.width / cellSize; i++) {
        const r = new Rect({
          width: cellSize,
          height: cellSize,
          style: { fill: "transparent", stroke: "white" },
        });
        r.alpha = 0.25;
        r.position = new Vector(i * cellSize, j * cellSize);
        this.hashGrid.add(r);
      }
    }

    this.input = input;
    this.game = game;
  }

  makeSprite(x, y) {
    const r = new Rect({ width: 16, height: 16, style: { fill: "red" } });
    r.position = new Vector(x, y);
    r.hitbox = {
      x: 0,
      y: 0,
      width: 16,
      height: 16,
    };
    return r;
  }

  moveSprites() {
    const { game } = this;
    this.sprites.children.forEach((s) => {
      s.position.x += math.rand(-2, 3);
      s.position.y += math.rand(-2, 3);
      s.position.set(
        math.clamp(s.position.x, 0, game.width - s.width),
        math.clamp(s.position.y, 0, game.height - s.height)
      );
      if (useHash) {
        hash.insert(s);
      }
    });
  }

  movePlayer(dt) {
    const { input, player, game } = this;
    if (input.keys.x) {
      player.position.x += 100 * dt * input.keys.x;
    }
    if (input.keys.y) {
      player.position.y += 100 * dt * input.keys.y;
    }
    player.position.set(
      math.clamp(player.position.x, 0, game.width - player.width),
      math.clamp(player.position.y, 0, game.height - player.height)
    );
    if (useHash) {
      hash.insert(player);
    }
  }

  update(dt, t) {
    super.update(dt, t);

    // move player
    this.movePlayer(dt);

    // move sprites
    this.moveSprites();

    if (useHash) {
      Object.values(hash.entities).forEach((set) => {
        if (set.has(this.player) && set.size > 1) {
          // console.log("collision detection");
          // collision between player and sprites
          set.forEach((entity) => {
            if (entity !== this.player) {
              hit(this.player, entity, () => {
                hash.remove(entity); // remove from hash here otherwise hash will keep the reference
                entity.dead = true;
              });
            }
          });
        }
      });
    } else {
      // check via brute force
    }
  }
}

export default GameTest;
