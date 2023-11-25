import Vector from "../tools/Vector";
import { IEntity, IEntityConfig, IENTITY_DEFAULTS } from "../types";

interface IShape extends IEntity {
  fill: string;
  stroke: string;
  lineWidth: number;
}

interface IShapeConfig extends IEntityConfig {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
}

const ISHAPE_DEFAULTS = {
  fill: "#68c3d4",
  stroke: "transparent",
  lineWidth: 1,
};

class Shape implements IShape {
  public fill: string;
  public stroke: string;
  public lineWidth: number;
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public height: number;
  public width: number;
  public angle: number;
  public alpha: number;
  public dead: boolean;

  constructor(config: IShapeConfig = {}) {
    const {
      position,
      anchor,
      scale,
      pivot,
      height,
      width,
      angle,
      alpha,
      dead,
      fill,
      stroke,
      lineWidth,
    } = { ...IENTITY_DEFAULTS, ...ISHAPE_DEFAULTS, ...config };

    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.height = height;
    this.width = width;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
    this.fill = fill;
    this.stroke = stroke;
    this.lineWidth = lineWidth;
  }

  public render(context: CanvasRenderingContext2D) {}

  public update(delta: number, elapsed: number) {}
}

// RECT
class Rect extends Shape {
  public render(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.rect(0, 0, this.width, this.height);
    context.fillStyle = this.fill;
    context.fill();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.stroke;
    context.stroke();
  }
}

// CIRCLE
class Circle extends Shape {
  radius: number;

  constructor(config: IShapeConfig & { radius: number }) {
    super({
      ...config,
      width: config.radius * 2,
      height: config.radius * 2,
    });
    this.radius = config.radius;
    this.anchor = new Vector(this.radius, this.radius);
  }

  render(context: CanvasRenderingContext2D): void {
    const { fill, stroke, lineWidth } = this;
    const { radius } = this;
    context.fillStyle = fill;
    context.lineWidth = lineWidth;
    context.strokeStyle = stroke;
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
  }

  public update(dt: number, t: number): void {}
}

export { Rect, Circle };
