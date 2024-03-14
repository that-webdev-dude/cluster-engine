// import { Cluster } from "../cluster/types/cluster.types";

// type RectType = Cluster.EntityType & {
//   width: number;
//   height: number;
// };

// /**
//  * wallslide():
//  *
//  * @param {Entity} entity - the entity to test for collisions
//  * @param {TileMap} level - the tilemap describing the environment
//  * @param {Number} dx - intentional amount of x movement
//  * @param {Number} dy - intentional amount of y movement
//  * @returns {Object} thie amount of x & y the entity is allowed to move
//  */
// const wallslide = (entity: RectType, level, dx, dy) => {
//   const bounds = entity.hitBounds(entity);
//   const hits = {
//     up: false,
//     down: false,
//     right: false,
//     left: false,
//   };
//   let xo = dx;
//   let yo = dy;

//   // vertical check
//   if (dy !== 0) {
//     const tiles = level.tilesAtCorners(bounds, 0, yo);
//     const [tl, tr, bl, br] = tiles.map((tile) => tile && tile.frame.walkable);
//     if (dy < 0 && !(tl && tr)) {
//       // hit your head if (tl & tr) are not walkable
//       // compute the exact distance between the entity top bound and the bottom edge of the tile
//       hits.up = true;
//       const tileEdge = tiles[0].position.y + tiles[0].height;
//       yo = tileEdge - bounds.y;
//     }

//     if (dy > 0 && !(bl && br)) {
//       // hit your feet if (bl & br) are not walkable
//       // compute the exact distance between the entity bottom bound and the top edge of the tile
//       hits.down = true;
//       const tileEdge = tiles[2].position.y - 1;
//       yo = tileEdge - (bounds.y + bounds.height);
//     }
//   }

//   // horizontal check
//   if (dx !== 0) {
//     const tiles = level.tilesAtCorners(bounds, xo, yo);
//     const [tl, tr, bl, br] = tiles.map((tile) => tile && tile.frame.walkable);
//     if (dx < 0 && !(tl && bl)) {
//       // hit your left
//       // compute the exact distance between the entity left bound and the right edge of the tile
//       hits.left = true;
//       const tileEdge = tiles[0].position.x + tiles[0].width;
//       xo = tileEdge - bounds.x;
//     }

//     if (dx > 0 && !(tr && br)) {
//       // hit your right
//       // compute the exact distance between the entity right bound and the left edge of the tile
//       hits.right = true;
//       const tileEdge = tiles[1].position.x - 1;
//       xo = tileEdge - (bounds.x + bounds.width);
//     }
//   }

//   return { x: xo, y: yo, hits };
// };

// export default wallslide;
