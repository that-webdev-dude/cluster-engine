import entity from "../utils/entity";

/**
 * wallslide():
 *
 * @param {Entity} targetEntity - the entity to test for collisions
 * @param {TileMap} level - the tilemap describing the environment
 * @param {Number} dx - intentional amount of x movement
 * @param {Number} dy - intentional amount of y movement
 * @returns {Object} the amount of x & y the targetEntity is allowed to move
 */
const wallslide = (targetEntity, level, dx, dy) => {
  const bounds = entity.hitBounds(targetEntity);
  const hits = {
    up: false,
    down: false,
    right: false,
    left: false,
  };
  let xo = dx;
  let yo = dy;
  let hit = false;

  // vertical check
  if (dy !== 0) {
    const tiles = level.tilesAtCorners(bounds, 0, yo);
    const [tl, tr, bl, br] = tiles.map((tile) => tile && tile.frame.walkable);
    if (dy < 0 && !(tl && tr)) {
      // hit your head if (tl & tr) are not walkable
      // compute the exact distance between the targetEntity top bound and the bottom edge of the tile
      hit = true;
      hits.up = true;
      const tileEdge = tiles[0].position.y + tiles[0].height;
      yo = tileEdge - bounds.y;
    }

    if (dy > 0 && !(bl && br)) {
      // hit your feet if (bl & br) are not walkable
      // compute the exact distance between the targetEntity bottom bound and the top edge of the tile
      hit = true;
      hits.down = true;
      const tileEdge = tiles[2].position.y - 1;
      yo = tileEdge - (bounds.y + bounds.height);
    }
  }

  // horizontal check
  if (dx !== 0) {
    const tiles = level.tilesAtCorners(bounds, xo, yo);
    const [tl, tr, bl, br] = tiles.map((tile) => tile && tile.frame.walkable);
    if (dx < 0 && !(tl && bl)) {
      // hit your left
      // compute the exact distance between the targetEntity left bound and the right edge of the tile
      hit = true;
      hits.left = true;
      const tileEdge = tiles[0].position.x + tiles[0].width;
      xo = tileEdge - bounds.x;
    }

    if (dx > 0 && !(tr && br)) {
      // hit your right
      // compute the exact distance between the targetEntity right bound and the left edge of the tile
      hit = true;
      hits.right = true;
      const tileEdge = tiles[1].position.x - 1;
      xo = tileEdge - (bounds.x + bounds.width);
    }
  }

  return { x: xo, y: yo, hits, hit };
};

export default wallslide;
