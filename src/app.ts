import ares from "./ares";
const { Game } = ares;

const game = new Game({
  version: "0.0.1",
  title: "Ares",
  width: 832,
  height: 640,
});

export default () => {
  game.start(() => {
    console.log("game started");
  });
};
