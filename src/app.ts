import { Game } from "./cluster";
import { GameMenu } from "./scenes/GameMenu";
import { GamePlay } from "./scenes/GamePlay";
import { store } from "./store";

const scenes = store.get("gameScenes");
const height = store.get("screenHeight");
const width = store.get("screenWidth");

const game = new Game({
  height,
  width,
  scenes: new Map([
    [scenes.GameMenu, () => new GameMenu()],
    [scenes.GamePlay, () => new GamePlay()],
  ]),
});

store.on("gameScene-changed", () => {
  game.setScene(store.get("gameScene"));
});

export default () => {
  game.setScene(scenes.GameMenu);
  game.start();
};
