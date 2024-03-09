import { TileSprite, TileMap, Vector, Game } from "./cluster";
import spritesheetImageURL from "./images/spritesheet.png";

const game = new Game();

const mapSpritesheet = spritesheetImageURL;
const mapLayout = [
  ["0", "0", "0", "0", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "0", "0", "0", "0"],
];
const mapDictionary = {
  "0": { x: 2, y: 3 },
  "1": { x: 4, y: 3 },
} as const;
const map = new TileMap(mapSpritesheet, mapDictionary, mapLayout, 32, 32);

class Player extends TileSprite {
  constructor() {
    super({
      imageURL: spritesheetImageURL,
      position: new Vector(0, 0),
      tileWidth: 32,
      tileHeight: 32,
      anchor: new Vector(-16, 0),
    });
    this.animation.add(
      "idle",
      [
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      0.25
    );
    this.animation.play("idle");
  }

  public update(dt: number): void {
    super.update(dt);
    const { keyboard } = game;
    if (keyboard.x) {
      this.scale.x = keyboard.x;
      this.anchor.x = -keyboard.x * 16;
    }
    if (keyboard.x || keyboard.y) {
      this.position.x += keyboard.x * dt * 200;
      this.position.y += keyboard.y * dt * 200;
    }
  }
}

const player = new Player();

export default () => {
  game.scene.add(map);
  game.scene.add(player);
  game.start();
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
