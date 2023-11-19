// import ares from "./ares/index";
// import Vector from "./ares/tools/Vector";
// import Container from "./ares/core/Container";
// import spritesheetImageURL from "./images/spritesheet.png";
// import { TileSprite } from "./ares/core/Sprite";

// const { Game } = ares;

// const game = new Game({
//   title: "Game",
//   height: 640,
//   width: 832,
// });
// const scene = new Container();

// const ship = scene.add(
//   new TileSprite({
//     scale: new Vector(2, 2),
//     pivot: new Vector(16, 16),
//     textureURL: spritesheetImageURL,
//     frame: { x: 1, y: 3 },
//     tileW: 32,
//     tileH: 32,
//   })
// );
// if (ship instanceof TileSprite) {
//   ship.animation.add(
//     "idle",
//     [
//       { x: 0, y: 0 },
//       { x: 1, y: 0 },
//       { x: 2, y: 0 },
//       { x: 0, y: 1 },
//       { x: 1, y: 1 },
//       { x: 2, y: 1 },
//       { x: 0, y: 2 },
//       { x: 1, y: 2 },
//     ],
//     0.1
//   );
//   ship.animation.play("idle");
// }

// export default () => {
//   game.setScene(scene);
//   game.start((dt, t) => {
//     if (ship instanceof TileSprite) ship.update(dt, t);
//   });
// };

// =========================================================================================================

export default () => {
  console.log("Hello World!");
};
