import entity from "./entity";
const { hitBounds } = entity;

class GridHash {
  constructor(cellSize) {
    this.entities = {};
    this.cellSize = cellSize;
  }

  #add(hash, entity) {
    let cell = this.entities[hash];
    if (!cell) {
      cell = new Set();
      this.entities[hash] = cell;
    }
    cell.add(entity);
  }

  hash(position) {
    return [
      Math.floor(position.x / this.cellSize),
      Math.floor(position.y / this.cellSize),
    ];
  }

  insert(entity) {
    if (!entity.hitbox) {
      console.warn("Entity has no hitbox", entity);
      return;
    } else {
      const bounds = hitBounds(entity);
      const min = this.hash({ x: bounds.x, y: bounds.y });
      const max = this.hash({
        x: bounds.x + bounds.width,
        y: bounds.y + bounds.height,
      });

      // where to add remove entity
      if (entity.hashMin) {
        // entity hasn't changed cell
        if (entity.hashMin[0] === min[0] && entity.hashMin[1] === min[1]) {
          return;
        }
        // entity has changed cell so remove it from old cell
        this.remove(entity);
      }

      // add entity to EVERY cell it touches
      for (let j = min[1]; j <= max[1] + 1; j++) {
        for (let i = min[0]; i <= max[0] + 1; i++) {
          this.#add([i, j], entity);
        }
      }

      entity.hashMin = min;
      entity.hashMax = max;
    }
  }

  remove(entity) {
    const min = entity.hashMin;
    const max = entity.hashMax;
    for (let j = min[1]; j <= max[1] + 1; j++) {
      for (let i = min[0]; i <= max[0] + 1; i++) {
        const hash = [i, j];
        // delete entity from cells
        const cell = this.entities[hash];
        cell && cell.delete(entity);
        if (cell && cell.size === 0) {
          delete this.entities[hash];
        }
      }
    }
    entity.hashMin = null;
    entity.hashMax = null;
  }
}

export default GridHash;
