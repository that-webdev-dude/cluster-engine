import ares from "./ares";
import Player from "./entities/Player";

const game = new ares.Game({
  version: "0.0.1",
  title: "Ares",
  width: 832,
  height: 640,
});

// const player = new Player({
//   input: game.keyboard,
//   onFire: () => {
//     console.log("fire");
//   },
// });
// game.scene.add(player);

export default () => {
  game.start(() => {});
};
