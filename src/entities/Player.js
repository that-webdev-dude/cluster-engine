import playerImageURL from "../images/player.png";
import cluster from "../cluster";

const { Sprite, Texture, math } = cluster;

class Player extends Sprite {
  constructor(game, input) {
    super(new Texture(playerImageURL));
    this.gameHeight = game.height;
    this.gameWidth = game.width;
    this.input = input;
    this.speed = 200;
    this.position.set(100, this.gameHeight / 2 - this.width);
  }

  update(dt, t) {
    const { input, speed, position } = this;
    if (input.keys.x) {
      position.x += input.keys.x * speed * dt;
    }
    if (input.keys.y) {
      position.y += input.keys.y * speed * dt;
    }

    position.set(
      math.clamp(position.x, 0, this.gameWidth - this.width),
      math.clamp(position.y, 0, this.gameHeight - this.height)
    );
  }
}

export default Player;
