import ares from "./ares";
import Player from "./entities/Player";
// import Flame from "./entities/Flame";

// GAME
const { Game, Container, Sound, Camera, Rect, Vector, Cmath } = ares;
const game = new Game({
  version: "0.0.1",
  title: "Ares",
  width: 600,
  height: 400,
});

// WORLD
const world = new Container();
const worldW = game.width * 3;
const worldH = game.height * 3;
const worldBackground = new Rect({
  width: worldW,
  height: worldH,
  fill: "black",
});
world.add(worldBackground);
for (let i = 0; i < 100; i++) {
  const block = new Rect({
    width: Cmath.rand(4, 12),
    height: Cmath.rand(4, 12),
    fill: "lightGrey",
    position: new Vector(Cmath.rand(0, worldW), Cmath.rand(0, worldH)),
  });
  world.add(block);
}

// PLAYER
const player = new Player({
  input: game.keyboard,
});

// const flame = new Flame();

// CAMERA
const camera = new Camera({
  viewSize: { width: game.width, height: game.height },
  worldSize: { width: game.width, height: game.height },
  subject: player,
});

export default () => {
  camera.add(world);
  camera.add(player);
  game.scene.add(camera);
  game.start(() => {
    player.position.x = Cmath.clamp(
      player.position.x,
      24,
      game.width - player.width
    );
    player.position.y = Cmath.clamp(
      player.position.y,
      0,
      game.height - player.height
    );

    if (game.keyboard.action) {
      camera.shake();
    }
  });
};
