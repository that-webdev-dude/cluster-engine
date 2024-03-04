import { Camera, Scene, Game } from "../ares";
import { Vector } from "../ares";
import { Rect } from "../ares";
import { Circle } from "../ares";
import { Line } from "../ares";
import { Text } from "../ares";
import { Sprite } from "../ares";
import spritesheetImageURL from "../images/spritesheet.png";
import barrelImageURL from "../images/barrel.png";
import { RectType } from "../ares/types";

class GamePlay extends Scene {
  camera: Camera;
  e: Sprite;
  debugBounds: Rect;
  debugPoint: Circle;
  debugHitBounds: Rect;
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

    this.e = new Sprite({
      imageURL: spritesheetImageURL,
      position: new Vector(100, 100),
      scale: new Vector(2, 2),
      hitbox: {
        x: 4,
        y: 4,
        width: 24,
        height: 24,
      },
      tileH: 32,
      tileW: 32,
      tile: { x: 3, y: 1 },
    });

    this.debugPoint = new Circle({
      radius: 4,
      fill: "black",
      anchor: new Vector(),
    });

    this.debugBounds = new Rect({
      stroke: "lightgreen",
      fill: "transparent",
      lineWidth: 2,
    });

    this.debugHitBounds = new Rect({
      stroke: "transparent",
      alpha: 0.5,
      fill: "cyan",
    });

    this.camera.add(this.e);
    this.camera.add(this.debugPoint);
    this.camera.add(this.debugBounds);
    this.camera.add(this.debugHitBounds);
    this.camera.add(
      new Text({
        text: "Hello World",
        position: new Vector(500, 100),
      })
    );
  }

  pointVsRect(point: Vector, rect: RectType): boolean {
    return (
      point.x >= rect.position.x &&
      point.x <= rect.position.x + rect.width &&
      point.y >= rect.position.y &&
      point.y <= rect.position.y + rect.height
    );
  }

  update(dt: number, t: number): void {
    super.update(dt, t);
    if (this.game.keyboard.x) {
      this.e.position.x += this.game.keyboard.x * 5;
    }
    if (this.game.keyboard.y) {
      this.e.position.y += this.game.keyboard.y * 5;
    }

    this.debugBounds.position = Vector.from(this.e.bounds);
    this.debugBounds.size.x = this.e.bounds.width;
    this.debugBounds.size.y = this.e.bounds.height;

    this.debugHitBounds.position = Vector.from(this.e.hitBounds);
    this.debugHitBounds.size.x = this.e.hitBounds.width;
    this.debugHitBounds.size.y = this.e.hitBounds.height;

    this.debugPoint.position = this.e.center;

    this.game.mouse.update();
  }
}

export default GamePlay;
