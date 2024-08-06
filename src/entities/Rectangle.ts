// import { Entity, EntityGroup, Vector } from "../cluster";
// import { Transform, Size, Colour, Input } from "../components";
// import { store } from "../store";

// export class Background extends Entity {
//   constructor() {
//     super("Background");

//     const transform = new Transform({
//       position: new Vector(0, 0),
//     });
//     const colour = new Colour({
//       fill: "black",
//     });
//     const size = new Size({
//       width: store.get("screenWidth"),
//       height: store.get("screenHeight"),
//     });

//     this.attachComponent(transform);
//     this.attachComponent(colour);
//     this.attachComponent(size);
//   }
// }

// export class Tile extends Entity {
//   constructor(x: number, y: number) {
//     super("Tile");

//     const transform = new Transform({
//       position: new Vector(x, y),
//     });
//     const colour = new Colour({
//       fill: "transparent",
//       stroke: "white",
//     });
//     const size = new Size({
//       width: 32,
//       height: 32,
//     });
//     this.attachComponent(transform);
//     this.attachComponent(colour);
//     this.attachComponent(size);
//   }
// }

// export class Player extends Entity {
//   constructor() {
//     super("Player");

//     const transform = new Transform({
//       position: new Vector(100, 100),
//     });
//     const colour = new Colour({
//       fill: "red",
//     });
//     const size = new Size({
//       width: 32,
//       height: 32,
//     });

//     this.attachComponent(transform);
//     this.attachComponent(colour);
//     this.attachComponent(size);
//   }
// }

// export class BlobbyEye extends Entity {
//   constructor() {
//     super("BlobbyEye");

//     const transform = new Transform({
//       position: new Vector(20, 4),
//     });
//     const size = new Size({
//       width: 8,
//       height: 8,
//     });
//     const colour = new Colour({
//       fill: "white",
//     });

//     this.attachComponents(transform, size, colour);
//   }
// }

// export class BlobbyMouth extends Entity {
//   constructor() {
//     super("BlobbyMouth");

//     const transform = new Transform({
//       position: new Vector(20, 20),
//     });
//     const size = new Size({
//       width: 8,
//       height: 2,
//     });
//     const colour = new Colour({
//       fill: "black",
//     });

//     this.attachComponents(transform, size, colour);
//   }
// }

// export class Blobby extends EntityGroup {
//   constructor() {
//     super("Blobby");

//     const transform = new Transform({
//       position: new Vector(100, 100),
//     });
//     const size = new Size({
//       width: 32,
//       height: 32,
//     });
//     const colour = new Colour({
//       fill: "green",
//     });
//     const input = new Input({
//       action: "Space",
//     });

//     this.attachComponent(transform);
//     this.attachComponent(size);
//     this.attachComponent(colour);
//     this.attachComponent(input);

//     this.addEntity(new BlobbyEye());
//     this.addEntity(new BlobbyMouth());
//   }
// }
