import Screen from "./Screen";
import cluster from "../cluster";

// background
import backgroundImageURL from "../images/background.png";
import ScrollingBackground from "../entities/ScrollingBackground";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";

const { Texture, Sprite, Pool } = cluster;

class GameScreen extends Screen {
  constructor(game, input) {
    super(game, input);

    const enemies = new Pool(() => new Enemy(game, input), 10);
    const player = new Player(game, input);

    const backgroundTexture = new Texture(backgroundImageURL);
    const background = new ScrollingBackground(
      backgroundTexture,
      game.width,
      200
    );

    this.add(background);
    this.add(player);
    this.add(enemies.next());

    this.firstUpdate = true;
  }

  update(dt, t) {
    super.update(dt, t);

    if (this.firstUpdate) {
      this.firstUpdate = false;
    }
  }
}

export default GameScreen;
