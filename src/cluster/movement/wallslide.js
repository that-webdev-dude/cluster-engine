import entity from "../utils/entity";

export default (targetEntity, level, dx, dy) => {
  const bounds = entity.hitBounds(targetEntity);
  let xo = dx;
  let yo = dy;

  // vertical check
  if (dy !== 0) {
    const tiles = level.tilesAtCorners(bounds, 0, yo);
    const [tl, tr, bl, br] = tiles.map((tile) => tile && tile.frame.walkable);
    if (dy < 0 && !(tl && tr)) {
      // hit your head
      // compute the exact distance between the targetEntity top bound and the bottom edge of the tile
      const tileEdge = tiles[0].position.y + tiles[0].height;
      yo = tileEdge - bounds.y;
    }

    if (dy > 0 && !(bl && br)) {
      // hit your feet
      // compute the exact distance between the targetEntity bottom bound and the top edge of the tile
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
      const tileEdge = tiles[0].position.x + tiles[0].width;
      xo = tileEdge - bounds.x;
    }

    if (dx > 0 && !(tr && br)) {
      // hit your right
      // compute the exact distance between the targetEntity right bound and the left edge of the tile
      const tileEdge = tiles[1].position.x - 1;
      xo = tileEdge - (bounds.x + bounds.width);
    }
  }

  return { x: xo, y: yo };
};
