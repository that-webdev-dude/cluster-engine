import { Camera, Scene, Game } from "../ares";
import { Vector } from "../ares";
import { Rect } from "../ares";
import { Circle } from "../ares";
import { Line } from "../ares";
import { Text } from "../ares";
import { Sprite, TileSprite } from "../ares";
import spritesheetImageURL from "../images/spritesheet.png";
import barrelImageURL from "../images/barrel.png";

class GamePlay extends Scene {
  camera: Camera;
  r1: Rect;
  c1: Circle;
  l1: Line;
  t1: Text;
  sp1: Sprite;
  tsp1: TileSprite;
  constructor(
    game: Game,
    transitions: {
      toNext: () => void;
      toFirst: () => void;
    }
  ) {
    const { width, height } = game;
    super(game, transitions);
    this.camera = new Camera({
      worldSize: { width, height },
      viewSize: { width, height },
    });
    this.add(this.camera);

    this.r1 = new Rect({
      position: new Vector(200, 200),
      pivot: new Vector(50, 50),
      width: 100,
      height: 100,
      fill: "blue",
    });

    this.c1 = new Circle({
      anchor: new Vector(50, 50),
      radius: 50,
      fill: "red",
    });

    this.l1 = new Line({
      start: new Vector(0, 0),
      end: new Vector(100, 100),
      stroke: "black",
    });

    this.t1 = new Text({
      position: new Vector(400, 400),
      text: "Hello World",
      fill: "black",
    });

    this.sp1 = new Sprite({
      position: new Vector(500, 300),
      scale: new Vector(2, 2),
      textureURL: barrelImageURL,
      hitbox: {
        x: 2,
        y: 2,
        width: 28,
        height: 28,
      },
    });

    this.tsp1 = new TileSprite({
      position: new Vector(100, 500),
      textureURL: spritesheetImageURL,
      tileW: 32,
      tileH: 32,
      frame: { x: 0, y: 0 },
    });
    this.tsp1.animation.add(
      "idle",
      [
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      0.25
    );
    this.tsp1.animation.play("idle");

    // console.table(this.r1);
    // console.table(this.c1);
    // console.table(this.l1);
    console.table(this.sp1);

    this.camera.add(this.r1);
    this.camera.add(this.c1);
    this.camera.add(this.l1);
    this.camera.add(this.t1);
    this.camera.add(this.sp1);
    this.camera.add(this.tsp1);
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
    this.r1.angle += 0.025;
  }
}

export default GamePlay;
