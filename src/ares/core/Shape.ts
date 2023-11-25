import { Entity, EntityConfig, ENTITY_DEFAULTS } from "./Entity";

// Shape Interface
interface ShapeConfig extends EntityConfig {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
}

const SHAPE_DEFAULTS = {
  fill: "#68c3d4",
  stroke: "transparent",
  lineWidth: 1,
};

class Shape extends Entity {
  public fill: string;
  public stroke: string;
  public lineWidth: number;

  constructor(
    config: ShapeConfig = {
      ...ENTITY_DEFAULTS,
      ...SHAPE_DEFAULTS,
    }
  ) {
    super(config);
    this.fill = config.fill || SHAPE_DEFAULTS.fill;
    this.stroke = config.stroke || SHAPE_DEFAULTS.stroke;
    this.lineWidth = config.lineWidth || SHAPE_DEFAULTS.lineWidth;
  }
}

// rect
class Rect extends Shape {
  constructor(config: ShapeConfig & { width: number; height: number }) {
    super(config);
  }
  render(context: CanvasRenderingContext2D): void {
    const { fill, stroke, lineWidth } = this;
    const { width, height } = this;
    context.fillStyle = fill;
    context.lineWidth = lineWidth;
    context.strokeStyle = stroke;
    context.beginPath();
    context.rect(0, 0, width, height);
    context.stroke();
    context.fill();
  }

  public update(dt: number, t: number): void {}
}

// circle
class Circle extends Shape {
  radius: number;

  constructor(config: ShapeConfig & { radius: number }) {
    super({
      ...config,
      width: config.radius * 2,
      height: config.radius * 2,
    });
    this.radius = config.radius;
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
