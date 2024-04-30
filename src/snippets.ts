// // implementation of DBTileMap
// type TileFrame = { x: number; y: number; walkable?: boolean };
// type MapLayout = string[][];
// type MapDictionary = {
//   [key: string]: TileFrame;
// };
// export class DBTileMap extends Container {
//   tileHeight: number;
//   tileWidth: number;
//   mapHeight: number;
//   mapWidth: number;
//   tiles: Map<number, Rect> = new Map();

//   /**
//    * DBTileMap():
//    * creates a tilemap from a given spritesheet and map layout
//    * @param mapDictionary the dictionary of tile frames to use for the tilemap
//    * @param mapLayout the layout of the tilemap
//    * @param tileWidth the width of each tile
//    * @param tileHeight the height of each tile
//    */
//   constructor(
//     mapDictionary: MapDictionary,
//     mapLayout: MapLayout,
//     tileWidth: number,
//     tileHeight: number
//   ) {
//     super();
//     this.tileWidth = tileWidth;
//     this.tileHeight = tileHeight;

//     // check for mapWidth to ensure the map is rectangular
//     this.mapHeight = mapLayout.length;
//     this.mapWidth = mapLayout[0].length;
//     for (let i = 1; i < mapLayout.length; i++) {
//       if (mapLayout[i].length !== this.mapWidth) {
//         throw new Error("Map layout is not rectangular");
//       }
//     }

//     for (let y = 0; y < this.mapHeight; y++) {
//       for (let x = 0; x < this.mapWidth; x++) {
//         const cell = mapLayout[y][x];
//         const frame = mapDictionary[cell];
//         if (frame) {
//           let index = y * this.mapWidth + x;
//           let row = Math.floor(index / this.mapWidth);
//           let col = index % this.mapWidth;
//           let position = new Vector(col * tileWidth, row * tileHeight);
//           let tileSprite = new Rect({
//             position,
//             width: tileWidth,
//             height: tileHeight,
//             style: {
//               fill: "transparent",
//               stroke: "white",
//             },
//           });
//           this.tiles.set(index, tileSprite);
//           this.add(tileSprite);
//         }
//       }
//     }
//   }

//   get width() {
//     return this.mapWidth * this.tileWidth;
//   }

//   get height() {
//     return this.mapHeight * this.tileHeight;
//   }

//   /**
//    * pixelToMapPosition():
//    * converts a pixel position to a map position
//    * @param pixelPosition the pixel position to convert to map position
//    * @returns the map position
//    */
//   pixelToMapPosition(pixelPosition: Cluster.Point): Cluster.Point {
//     const { tileWidth, tileHeight } = this;
//     return {
//       x: Math.floor(pixelPosition.x / tileWidth),
//       y: Math.floor(pixelPosition.y / tileHeight),
//     };
//   }

//   /**
//    * mapToPixelPosition():
//    * converts a map position to a pixel position
//    * @param mapPosition the map position to convert to pixel position
//    * @returns the pixel position
//    */
//   mapToPixelPosition(mapPosition: Cluster.Point): Cluster.Point {
//     const { tileWidth, tileHeight } = this;
//     return {
//       x: mapPosition.x * tileWidth,
//       y: mapPosition.y * tileHeight,
//     };
//   }

//   /**
//    * tileAtMapPosition():
//    * returns the tile at a given map position
//    * @param mapPosition the map position to check for a tile
//    * @returns the tile at the map position
//    */
//   tileAtMapPosition(mapPosition: Cluster.Point): Rect | undefined {
//     return this.tiles.get(mapPosition.y * this.mapWidth + mapPosition.x);
//   }

//   /**
//    * tileAtPixelPosition():
//    * returns the tile at a given pixel position
//    * @param pixelPosition the pixel position to check for a tile
//    * @returns the tile at the pixel position
//    */
//   tileAtPixelPosition(pixelPosition: Cluster.Point): Rect | undefined {
//     return this.tileAtMapPosition(this.pixelToMapPosition(pixelPosition));
//   }

//   /**
//    * deleteTileAtMapPosition():
//    * deletes the tile at a given map position
//    * @param mapPosition the map position to delete the tile
//    */
//   deleteTileAtMapPosition(mapPosition: Cluster.Point) {
//     const tile = this.tileAtMapPosition(mapPosition);
//     if (tile) {
//       this.remove(tile);
//       tile.dead = true;
//     }
//   }

//   /**
//    * deleteTileAtPixelPosition():
//    * deletes the tile at a given pixel position
//    * @param pixelPosition the pixel position to delete the tile
//    */
//   deleteTileAtPixelPosition(pixelPosition: Cluster.Point) {
//     this.deleteTileAtMapPosition(this.pixelToMapPosition(pixelPosition));
//   }

//   /**
//    * tilesAtRectCorners():
//    * returns the tiles at the corners of a given bounding box
//    * @param x the x position of the bounding box
//    * @param y the y position of the bounding box
//    * @param width the width of the bounding box
//    * @param height the height of the bounding box
//    * @param offsetX the x offset of the bounding box
//    * @param offsetY the y offset of the bounding box
//    * @returns the tiles within the bounding box
//    */
//   tilesAtBoxCorners(
//     pixelPosition: Cluster.Point,
//     width: number,
//     height: number,
//     offsetX: number = 0,
//     offsetY: number = 0
//   ): (Rect | undefined)[] {
//     let { x, y } = pixelPosition;
//     return [
//       [x, y], // top left
//       [x + width, y], // top right
//       [x, y + height], // bottom left
//       [x + width, y + height], // bottom right
//     ].map(([x, y]) =>
//       this.tileAtPixelPosition({
//         x: x + offsetX,
//         y: y + offsetY,
//       })
//     );
//   }
// }

// ------------------------------------------------------------
// import { GAME_CONFIG } from "../config/GameConfig";
// import { Container, Vector, Rect, Cmath } from "../cluster";
// const gameW = GAME_CONFIG.width;
// const gameH = GAME_CONFIG.height;

// export class Level extends Container {
//   private _tileSize = 32;

//   constructor() {
//     super();
//     this._createTiledLevel();
//   }

//   private _getTile() {
//     return new Rect({
//       position: new Vector(0, 0),
//       width: this._tileSize,
//       height: this._tileSize,
//       style: {
//         fill: "transparent",
//         stroke: "white",
//       },
//     });
//   }

//   private _createTiledFloor() {
//     const floorTiles = GAME_CONFIG.width / this._tileSize;
//     for (let i = 0; i < floorTiles; i++) {
//       const tile = this._getTile();
//       tile.position.set(i * 32, gameH - 32);
//       this.add(tile);
//     }
//   }

//   private _createTiledLeftWall() {
//     const wallTiles = GAME_CONFIG.height / this._tileSize;
//     for (let i = 0; i < wallTiles; i++) {
//       const tile = this._getTile();
//       tile.position.set(0, i * 32);
//       this.add(tile);
//     }
//   }

//   private _createTiledRightWall() {
//     const wallTiles = GAME_CONFIG.height / this._tileSize;
//     for (let i = 0; i < wallTiles; i++) {
//       const tile = this._getTile();
//       tile.position.set(gameW - 32, i * 32);
//       this.add(tile);
//     }
//   }

//   private _createTiledVerticalPlatform() {
//     const platformTiles = Cmath.rand(3, 10);
//     const platformX =
//       Cmath.rand(1, GAME_CONFIG.width / 32 - platformTiles) * 32;
//     const platformY =
//       Cmath.rand(1, GAME_CONFIG.height / 32 - platformTiles) * 32;
//     for (let i = 0; i < platformTiles; i++) {
//       const tile = this._getTile();
//       tile.position.set(platformX, platformY + i * 32);
//       this.add(tile);
//     }
//   }

//   private _createTiledHorizontalPlatform() {
//     const platformTiles = Cmath.rand(3, 10);
//     const platformX =
//       Cmath.rand(1, GAME_CONFIG.width / 32 - platformTiles) * 32;
//     const platformY =
//       Cmath.rand(1, GAME_CONFIG.height / 32 - platformTiles) * 32;
//     for (let i = 0; i < platformTiles; i++) {
//       const tile = this._getTile();
//       tile.position.set(platformX + i * 32, platformY);
//       this.add(tile);
//     }
//   }

//   private _createTiledLeftStairs() {
//     const bankTiles = Cmath.rand(3, 10);
//     const bankX = Cmath.rand(1, GAME_CONFIG.width / 32 - bankTiles) * 32;
//     const bankY = Cmath.rand(1, GAME_CONFIG.height / 32 - bankTiles) * 32;
//     for (let i = 0; i < bankTiles; i++) {
//       const tile = this._getTile();
//       tile.position.set(bankX + i * 32, bankY + i * 32);
//       this.add(tile);
//     }
//   }

//   private _createTiledRightStairs() {
//     const bankTiles = Cmath.rand(3, 10);
//     const bankX = Cmath.rand(1, GAME_CONFIG.width / 32 - bankTiles) * 32;
//     const bankY = Cmath.rand(1, GAME_CONFIG.height / 32 - bankTiles) * 32;
//     for (let i = 0; i < bankTiles; i++) {
//       const tile = this._getTile();
//       tile.position.set(bankX + i * 32, bankY - i * 32);
//       this.add(tile);
//     }
//   }

//   private _createTiledClosedRectangle() {
//     const rectTiles = Cmath.rand(3, 6);
//     const rectX = Cmath.rand(1, GAME_CONFIG.width / 32 - rectTiles) * 32;
//     const rectY = Cmath.rand(1, GAME_CONFIG.height / 32 - rectTiles) * 32;
//     for (let i = 0; i < rectTiles; i++) {
//       for (let j = 0; j < rectTiles; j++) {
//         const tile = this._getTile();
//         tile.position.set(rectX + i * 32, rectY + j * 32);
//         this.add(tile);
//       }
//     }
//   }

//   private _createTiledLevel() {
//     this._createTiledFloor();
//     this._createTiledLeftWall();
//     this._createTiledRightWall();
//     this._createTiledVerticalPlatform();
//     this._createTiledHorizontalPlatform();
//     this._createTiledLeftStairs();
//     this._createTiledRightStairs();
//     this._createTiledClosedRectangle();
//   }
// }

// ------------------------------------------------------------
// import { GAME_CONFIG } from "../config/GameConfig";
// import { Keyboard, Vector, World, Rect, State } from "../cluster";
// const gameW = GAME_CONFIG.width;
// const gameH = GAME_CONFIG.height;

// const STATES = {
//   JUMP: "JUMP",
//   IDLE: "IDLE",
//   FALL: "FALL",
//   RUN: "RUN",
// };

// // DON'T DELETE THIS LINES
// // getJumpVoByDistance() {
// //   return (2 * this.jumpHeight * this.speed) / this.jumpPeak;
// // }

// // getJumpGByDistance() {
// //   return (
// //     (2 * this.jumpHeight * this.speed * this.speed) /
// //     (this.jumpPeak * this.jumpPeak)
// //   );
// // }

// // getJumpV0ByDuration() {
// //   return (2 * this.jumpHeight) / this.jumpDuration;
// // }

// // getJumpGByDuration() {
// //   return (2 * this.jumpHeight) / (this.jumpDuration * this.jumpDuration);
// // }
// // DON'T DELETE THIS LINES

// export class Player extends Rect {
//   input = new Keyboard();
//   state = new State(STATES.FALL);
//   speed = 500;
//   jumpPeak = 100;
//   jumpHeight = 150;
//   jumpDuration = 0.5;

//   constructor() {
//     super({
//       width: 32,
//       height: 32,
//       position: new Vector(64, gameH - 32 * 16),
//       mass: 1,
//       style: {
//         fill: "white",
//         stroke: "white",
//       },
//     });
//   }

//   get jumpVelocity() {
//     return (2 * this.jumpHeight * this.speed) / this.jumpPeak;
//   }

//   get jumpGravity() {
//     return (
//       (2 * this.jumpHeight * this.speed * this.speed) /
//       (this.jumpPeak * this.jumpPeak)
//     );
//   }

//   jump() {
//     this.velocity.y = -this.jumpVelocity;
//   }

//   run() {
//     World.Physics.applyForce(this, { x: this.input.x * 4000, y: 0 });
//   }

//   update(dt: number, t: number) {
//     let { state } = this;

//     if (this.input.x && Math.abs(this.velocity.x) < this.speed) {
//       this.run();
//     }

//     World.Physics.applyGravity(this, this.jumpGravity);

//     World.Physics.applyVerticalFriction(this, 2);

//     state.update(dt);
//     switch (state.get()) {
//       case STATES.IDLE:
//         if (this.state.first) {
//           this.velocity.x = 0;
//         }
//         if (this.input.action) {
//           this.jump();
//           this.state.set(STATES.JUMP);
//         }
//         if (Math.abs(this.velocity.x) > 0.1) state.set(STATES.RUN);
//         break;
//       case STATES.JUMP:
//         if (this.velocity.y > 0) state.set(STATES.FALL);
//         break;
//       case STATES.RUN:
//         if (!this.input.x) {
//           World.Physics.applyFriction(this, 15);
//         }
//         if (this.input.action) {
//           this.jump();
//           this.state.set(STATES.JUMP);
//         }
//         if (Math.abs(this.velocity.x) < 0.1) state.set(STATES.IDLE);
//         break;
//       case STATES.FALL:
//         World.Physics.applyVerticalFriction(this, 2);
//         if (this.velocity.y === 0) state.set(STATES.RUN);
//         break;
//     }

//     World.Physics.integrate(this, dt);
//   }
// }
