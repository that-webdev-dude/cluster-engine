// import { Engine } from "./cluster/engine/Engine";
// import { Vector } from "./cluster";
// import {
//   XComponentType,
//   XComponent,
//   XContainer,
//   XEntity,
//   XSystem,
// } from "./XContainer";

// class Transform extends XComponent {
//   position: Vector;
//   scale: Vector;
//   constructor(entity: string) {
//     super(entity);
//     this.position = new Vector(0, 0);
//     this.scale = new Vector(1, 1);
//   }
// }
// class Size extends XComponent {
//   height: number;
//   width: number;
//   constructor(entity: string) {
//     super(entity);
//     this.height = 100;
//     this.width = 100;
//   }
// }

// class Rect extends XEntity {
//   constructor() {
//     super();
//     this.attach(new Transform(this.id));
//     this.attach(new Size(this.id));
//   }
// }

// const r1 = new Rect();
// const r2 = new Rect();
// const r3 = new Rect();
// const container = new XContainer();
// container.add(r1);
// container.add(r2);
// container.add(r3);

import { Game } from "./x";

const game = new Game();

export default () => {
  game.start(() => {
    console.log("update");
  });
};
