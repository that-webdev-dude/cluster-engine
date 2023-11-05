import Screen from "./Screen";
import cluster from "../cluster";

const { GridHash, Container, Rect, Vector, math } = cluster;
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

    // qc grid
    for (let j = 0; j < game.height / cellSize; j++) {
      for (let i = 0; i < game.width / cellSize; i++) {
        const r = this.add(
          new Rect({
            width: cellSize,
            height: cellSize,
            style: { fill: "transparent", stroke: "white" },
          })
        );
        r.alpha = 0.25;
        r.position = new Vector(i * cellSize, j * cellSize);
      }
    }

    this.firstUpdate = true;
  }

  makeSprite(x, y) {
    const r = new Rect({ width: 16, height: 16, style: { fill: "#607D8B" } });
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
    this.sprites.children.forEach((s) => {
      s.position.x += math.rand(-2, 3);
      s.position.y += math.rand(-2, 3);
      if (useHash) {
        hash.insert(s);
      }
    });
  }

  hashCollision() {}

  update(dt, t) {
    super.update(dt, t);
    this.moveSprites();

    if (useHash) {
      // check via hash
      Object.values(hash.entities).forEach((set) => {
        const entities = [...set];
        for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
            const a = entities[i];
            const b = entities[j];
            if (a !== b) {
              cluster.entity.hit(a, b, () => {
                a.alpha = 0.1;
                b.alpha = 0.1;
              });
            }
          }
        }
      });
    } else {
      // check via brute force
    }

    if (this.firstUpdate) {
      this.firstUpdate = false;
      //   ...
    }
  }
}

export default GameTest;
