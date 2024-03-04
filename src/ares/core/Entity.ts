import Cmath from "../tools/Cmath";
import Vector from "../tools/Vector";
import Assets from "./Assets";
import Animation from "./Animation";
import { EntityType, Box, Point } from "../types";

abstract class Entity implements EntityType {
  readonly id: string = Cmath.randId(9);
  public acceleration: Vector = new Vector();
  public velocity: Vector = new Vector();
  public position: Vector = new Vector();
  public anchor: Vector = new Vector();
  public scale: Vector = new Vector(1, 1);
  public pivot: Vector = new Vector();
  public angle: number = 0;
  public alpha: number = 1;
  public dead: boolean = false;
  public visible: boolean = true;
}

const STYLES = {
  fill: "fill",
  stroke: "transparent",
  align: "center" as CanvasTextAlign,
  font: '24px "Press Start 2P"',
  lineWidth: 1,
};

type Rect2DConfig = Partial<Entity> &
  Partial<{
    size: Vector;
    fill: string;
    stroke: string;
    lineWidth: number;
    hitbox: Box;
  }>;
class Rect extends Entity {
  readonly tag: string = "rect";
  public size: Vector = new Vector();
  public fill: string = STYLES.fill;
  public stroke: string = STYLES.stroke;
  public lineWidth: number = STYLES.lineWidth;
  public hitbox: Box | null = null;
  constructor(config: Rect2DConfig = {}) {
    super();
    Object.assign(this, config);
  }

  get width() {
    return this.size.x * this.scale.x;
  }

  get height() {
    return this.size.y * this.scale.y;
  }

  get x() {
    return this.position.x - this.anchor.x;
  }

  get y() {
    return this.position.y - this.anchor.y;
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.width;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.height;
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  get center() {
    return new Vector(this.centerX, this.centerY);
  }

  get bounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  get hitBounds() {
    if (this.hitbox) {
      return {
        x: this.x + this.hitbox.x * this.scale.x,
        y: this.y + this.hitbox.y * this.scale.y,
        width: this.hitbox.width * this.scale.x,
        height: this.hitbox.height * this.scale.y,
      };
    }
    return this.bounds;
  }
}

type Circle2DConfig = Partial<Entity> &
  Partial<{
    radius: number;
    fill: string;
    stroke: string;
    lineWidth: number;
  }>;
class Circle extends Entity {
  readonly tag: string = "circle";
  public radius: number = 0;
  public fill: string = STYLES.fill;
  public stroke: string = STYLES.stroke;
  public lineWidth: number = STYLES.lineWidth;
  constructor(config: Circle2DConfig = {}) {
    super();
    Object.assign(this, config);
  }

  get diameter() {
    return this.radius * 2;
  }

  get width() {
    return this.diameter * this.scale.x;
  }

  get height() {
    return this.diameter * this.scale.y;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get left() {
    return this.position.x - this.width * 0.5;
  }

  get right() {
    return this.position.x + this.width * 0.5;
  }

  get top() {
    return this.position.y - this.height * 0.5;
  }

  get bottom() {
    return this.position.y + this.height * 0.5;
  }

  get centerX() {
    return this.position.x;
  }

  get centerY() {
    return this.position.y;
  }

  get center() {
    return new Vector(this.centerX, this.centerY);
  }

  get bounds() {
    return {
      x: this.left,
      y: this.top,
      width: this.width,
      height: this.height,
    };
  }

  get hitBounds() {
    return this.bounds;
  }
}

type Line2DConfig = Partial<Entity> &
  Partial<{
    start: Vector;
    end: Vector;
    stroke: string;
    lineWidth: number;
  }>;
class Line extends Entity {
  readonly tag: string = "line";
  public start: Vector = new Vector();
  public end: Vector = new Vector();
  public stroke: string = STYLES.stroke;
  public lineWidth: number = STYLES.lineWidth;
  constructor(config: Line2DConfig = {}) {
    super();
    Object.assign(this, config);
  }

  get x() {
    return this.position.x + Math.min(this.start.x, this.end.x);
  }

  get y() {
    return this.position.y + Math.min(this.start.y, this.end.y);
  }

  get width() {
    return Math.abs(this.end.x - this.start.x);
  }

  get height() {
    return Math.abs(this.end.y - this.start.y);
  }

  get centerX() {
    return this.bounds.x + this.bounds.width * 0.5;
  }

  get centerY() {
    return this.bounds.y + this.bounds.height * 0.5;
  }

  get center() {
    return new Vector(
      this.bounds.x + this.bounds.width * 0.5,
      this.bounds.y + this.bounds.height * 0.5
    );
  }

  get bounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

type Text2DConfig = Partial<Entity> &
  Partial<{
    text: string;
    font: string;
    fill: string;
    stroke: string;
    lineWidth: number;
    align: CanvasTextAlign;
  }>;
class Text extends Entity {
  readonly tag: string = "text";
  public text: string = "";
  public font: string = STYLES.font;
  public fill: string = STYLES.fill;
  public stroke: string = STYLES.stroke;
  public lineWidth: number = STYLES.lineWidth;
  public align: CanvasTextAlign = STYLES.align;
  constructor(config: Text2DConfig = {}) {
    super();
    Object.assign(this, config);
  }
}

type Sprite2DConfig = Partial<Entity> &
  Partial<{
    hitbox: Box;
    tileW: number;
    tileH: number;
    tile: Point;
  }> & {
    imageURL: string; // required
  };
class Sprite extends Entity {
  public hitbox: Box | null = null;
  readonly tag: string = "sprite";
  readonly image: HTMLImageElement;
  readonly animation: Animation;
  readonly tileW: number = 0;
  readonly tileH: number = 0;
  protected tile: Point = { x: 0, y: 0 };
  constructor(config: Sprite2DConfig) {
    super();
    Object.assign(this, config);
    this.image = Assets.image(config.imageURL);
    this.tileW = config.tileW || this.image.width;
    this.tileH = config.tileH || this.image.height;
    this.animation = new Animation({
      frame: config.tile || { x: 3, y: 0 },
    });

    // if the division of the image width and height by the tile width and height
    // is not a whole number, then we have a problem, so we throw a warning
    if (this.image.width % this.tileW !== 0) {
      console.warn(
        `The width of the image is not a multiple of the tile width: ${this.image.width} % ${this.tileW}`
      );
    }
    if (this.image.height % this.tileH !== 0) {
      console.warn(
        `The height of the image is not a multiple of the tile height: ${this.image.height} % ${this.tileH}`
      );
    }
  }

  get frame(): Point {
    return this.tile;
  }

  set frame(frame: Point) {
    this.tile = frame;
    this.animation.frame = frame;
  }

  get width() {
    return this.tileW * this.scale.x;
  }

  get height() {
    return this.tileH * this.scale.y;
  }

  get x() {
    return this.position.x - this.anchor.x;
  }

  get y() {
    return this.position.y - this.anchor.y;
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.width;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.height;
  }

  get centerX() {
    return this.x + this.width * 0.5;
  }

  get centerY() {
    return this.y + this.height * 0.5;
  }

  get center() {
    return new Vector(this.centerX, this.centerY);
  }

  get bounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  get hitBounds() {
    if (this.hitbox) {
      return {
        x: this.x + this.hitbox.x * this.scale.x,
        y: this.y + this.hitbox.y * this.scale.y,
        width: this.hitbox.width * this.scale.x,
        height: this.hitbox.height * this.scale.y,
      };
    }
    return this.bounds;
  }

  update(dt: number, t: number) {
    if (this.animation.length) this.animation.update(dt);
  }
}

export {
  Rect2DConfig,
  Circle2DConfig,
  Line2DConfig,
  Text2DConfig,
  Sprite2DConfig,
};

export { Rect, Circle, Line, Text, Sprite };
