import playerImageUrl from "../images/player.png";
import cluster from "../cluster";
const { Texture, TileSprite } = cluster;

const texture = new Texture(playerImageUrl);

class Player extends TileSprite {
  constructor() {
    super(texture, 32, 32);
  }

  update(dt, t) {
    // Math.floor(t / 0.1) % 4 → timing trick
    // will cycle & return a value from 0:3 every 0.1s
    this.frame.x = Math.floor(t / 0.25) % 4;
  }
}

export default Player;
