import entity from "../utils/entity";

export default (player, level, dx, dy) => {
  const bounds = entity.hitBounds(player);
  const tiles = level.tilesAtCorners(bounds, dx, dy);
  const clears = tiles.map((t) => t && t.frame.walkable);
  const solids = clears.some((c) => !c);
  return solids ? { x: 0, y: 0 } : { x: dx, y: dy };
};
