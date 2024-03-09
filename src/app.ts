import Assets from "./ares/core/Assets";
import spritesheetImageURL from "./images/spritesheet.png";

import { TileSprite, Container, Vector } from "./cluster";
import Renderer from "./cluster/renderer/Renderer";
import Engine from "./cluster/engine/Engine";

const e = new TileSprite({
  imageURL: spritesheetImageURL,
  position: new Vector(500, 200),
  tileWidth: 32,
  tileHeight: 32,
});
e.animation.add(
  "idle",
  [
    { x: 4, y: 0 },
    { x: 5, y: 0 },
  ],
  0.25
);
e.animation.play("idle");

const scene = new Container();
scene.add(e);

const renderer = new Renderer({
  width: 800,
  height: 600,
  parentElementId: "#app",
});

const engine = new Engine({
  update: (dt, t) => {
    scene.update(dt, t);
  },
  render: () => {
    renderer.render(scene);
  },
});

export default () => {
  Assets.onReady(() => {
    engine.start();
  });
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
