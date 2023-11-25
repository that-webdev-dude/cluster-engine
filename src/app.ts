import ares from "./ares";
import Vector from "./ares/tools/Vector";
import playerTextureURL from "./images/player.png";

const { Game, Sprite } = ares;

class Player extends Sprite {
  constructor() {
    super({
      position: new Vector(100, 100),
      textureURL: playerTextureURL,
    });
    this.pivot = new Vector(this.image.width / 2, this.image.height / 2);
  }

  public update(delta: number, elapsed: number): void {
    this.angle += 0.01;
  }
}

const game = new Game({
  version: "0.0.1",
  title: "Ares",
  width: 832,
  height: 640,
});

game.scene.add(new Player());

export default () => {
  game.start(() => {
    // console.log("game started");
  });
};
