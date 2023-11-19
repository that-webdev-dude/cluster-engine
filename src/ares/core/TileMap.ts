// import Vector from "../tools/Vector";
// import Container from "./Container";
// import TileSprite from "../core/TileSprite";

// interface Hitbox {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }

// class TileMap extends Container {
//   mapW: number;
//   mapH: number;
//   tileW: number;
//   tileH: number;
//   children: any[];

//   constructor(
//     tiles: any[],
//     mapW: number,
//     mapH: number,
//     tileW: number,
//     tileH: number,
//     texture: any = null
//   ) {
//     super();
//     this.mapW = mapW;
//     this.mapH = mapH;
//     this.tileW = tileW;
//     this.tileH = tileH;
//     this.children = tiles.map((frame: any, index: number) => {
//       const column = index % mapW;
//       const row = Math.floor(index / mapW);
//       const s = texture
//         ? new TileSprite({ textureURL: texture, tileW, tileH })
//         : frame;
//       s.position = new Vector(column * tileW, row * tileH);
//       s.frame = frame;
//       s.hitbox = {
//         x: 0,
//         y: 0,
//         width: tileW,
//         height: tileH,
//       };
//       return s;
//     });
//   }

//   get width(): number {
//     return this.mapW * this.tileW;
//   }

//   get height(): number {
//     return this.mapH * this.tileH;
//   }

//   pixelToMapPosition(pixelPosition: Vector): Vector {
//     const { tileW, tileH } = this;
//     return new Vector(
//       Math.floor(pixelPosition.x / tileW),
//       Math.floor(pixelPosition.y / tileH)
//     );
//   }

//   mapToPixelPosition(mapPosition: Vector): Vector {
//     const { tileW, tileH } = this;
//     return new Vector(mapPosition.x * tileW, mapPosition.y * tileH);
//   }

//   tileAtMapPosition(mapPosition: Vector): any {
//     return this.children[mapPosition.y * this.mapW + mapPosition.x];
//   }

//   tileAtPixelPosition(position: Vector): any {
//     return this.tileAtMapPosition(this.pixelToMapPosition(position));
//   }

//   tilesAtCorners(bounds: Hitbox, xo = 0, yo = 0): any[] {
//     return [
//       [bounds.x, bounds.y], // top left
//       [bounds.x + bounds.width, bounds.y], // top right
//       [bounds.x, bounds.y + bounds.height], // bottom left
//       [bounds.x + bounds.width, bounds.y + bounds.height], // bottom right
//     ].map(([x, y]) => this.tileAtPixelPosition(new Vector(x + xo, y + yo)));
//   }

//   setFrameAtMapPosition(mapPosition: Vector, frame: any): any {
//     const tile = this.tileAtMapPosition(mapPosition);
//     tile.frame = frame;
//     return tile;
//   }

//   setFrameAtPixelPosition(position: Vector, frame: any): any {
//     return this.setFrameAtMapPosition(this.pixelToMapPosition(position), frame);
//   }
// }

// export default TileMap;
