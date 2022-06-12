import backgroundImageUrl from "./images/background.png";
import playerImageUrl from "./images/player.png";

import cluster from "./cluster/index.js";

const { TileSprite } = cluster;
const { Texture } = cluster;
const { Sprite } = cluster;
const { Game } = cluster;
const { math } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });

  // resources
  const textures = {
    background: new Texture(backgroundImageUrl),
    player: new Texture(playerImageUrl),
  };

  // controller
  // ...

  // game objects
  const background = game.scene.add(new Sprite(textures.background));

  const playerSprite = new TileSprite(textures.player, 32, 32);
  const player = game.scene.add(playerSprite);

  // start
  game.run((dt, t) => {
    // player walking
    // Math.floor(t / 0.1) % 4 → timing trick
    // will cycle & return a value from 0:3 every 0.1s
    player.frame.x = Math.floor(t / 0.25) % 4;

    // player blinking
    // Math.floor(t / 0.05) % 2 → timing trick
    // will cycle & return a value from 0:1 every 0.05s
    // player.visible = Math.floor(t / 0.05) % 2;
  });
};
