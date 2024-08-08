// import { Component } from "../cluster";
// import { Vector } from "../cluster";

// // Interface for component properties
// export interface TransformOptions {
//   position?: Vector;
//   anchor?: Vector;
//   scale?: Vector;
//   pivot?: Vector;
// }

// // Transform Component
// export class Transform implements Component {
//   readonly name = "Transform";
//   public position: Vector;
//   public anchor: Vector;
//   public scale: Vector;
//   public pivot: Vector;

//   constructor({
//     position = new Vector(0, 0),
//     anchor = new Vector(0, 0),
//     scale = new Vector(1, 1),
//     pivot = new Vector(0, 0),
//   }: TransformOptions = {}) {
//     this.position = Vector.from(position);
//     this.anchor = Vector.from(anchor);
//     this.scale = Vector.from(scale);
//     this.pivot = Vector.from(pivot);
//   }
// }
