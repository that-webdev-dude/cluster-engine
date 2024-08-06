// import { Entity, EntityGroup, Vector } from "../cluster";
// import {
//   Transform,
//   Colour,
//   Size,
//   Input,
//   Physics,
//   Velocity,
// } from "../components";

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

//     this.attachComponent(transform);
//     this.attachComponent(size);
//     this.attachComponent(colour);
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

//     this.attachComponent(transform);
//     this.attachComponent(size);
//     this.attachComponent(colour);
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
//     const physics = new Physics({
//       mass: 1,
//       generators: [
//         () => {
//           let x: number = input.x * 100;
//           let y: number = input.y * 100;
//           return { x, y };
//         },
//       ],
//     });
//     const velocity = new Velocity({
//       maxSpeed: 400,
//     });

//     this.attachComponent(transform);
//     this.attachComponent(colour);
//     this.attachComponent(size);
//     // this.attachComponent(input);
//     // this.attachComponent(physics);
//     // this.attachComponent(velocity);

//     this.addEntity(new BlobbyEye());
//     this.addEntity(new BlobbyMouth());
//   }
// }

// export class Baddie extends Entity {
//   constructor() {
//     super("Baddie");

//     const transform = new Transform({
//       position: new Vector(200, 200),
//     });
//     const size = new Size({
//       width: 32,
//       height: 32,
//     });
//     const colour = new Colour({
//       fill: "red",
//     });

//     this.attachComponent(transform);
//     this.attachComponent(size);
//     this.attachComponent(colour);
//   }
// }
