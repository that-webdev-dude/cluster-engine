import ares from "./ares";
import GamePlay from "./screens/GamePlay";

// GAME
const { Game } = ares;
const game = new Game({
  version: "0.0.1",
  title: "Ares",
  width: 600,
  height: 400,
});

// WORLD
// const world = new Container();
// const worldW = game.width * 3;
// const worldH = game.height * 3;
// const worldBackground = new Rect({
//   width: worldW,
//   height: worldH,
//   fill: "black",
// });
// world.add(worldBackground);
// for (let i = 0; i < 100; i++) {
//   const block = new Rect({
//     width: Cmath.rand(4, 12),
//     height: Cmath.rand(4, 12),
//     fill: "lightGrey",
//     position: new Vector(Cmath.rand(0, worldW), Cmath.rand(0, worldH)),
//   });
//   world.add(block);
// }

game.scene.add(new GamePlay(game));

export default () => {
  game.start((dt) => {
    // ...
  });
};
