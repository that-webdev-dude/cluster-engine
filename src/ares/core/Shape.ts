import Vector from "../tools/Vector";
import { Entity, EntityConfig, EntityType } from "./Entity";

// // RECT ENTITY
type RectType = EntityType & {
  height: number;
  width: number;
  fill: string;
  stroke: string;
  lineWidth: number;
  hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type RectConfig = EntityConfig &
  Partial<{
    height?: number;
    width?: number;
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    hitbox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;

class Rect extends Entity implements RectType {
  private _width: number;
  private _height: number;
  fill: string;
  stroke: string;
  lineWidth: number;
  hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  constructor(config: RectConfig = {}) {
    const {
      height = 32,
      width = 32,
      fill = "black",
      stroke = "black",
      lineWidth = 1,
      hitbox,
    } = config;

    super(config);
    this._height = height;
    this._width = width;
    this.fill = fill;
    this.stroke = stroke;
    this.lineWidth = lineWidth;
    this.hitbox = hitbox || {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  set width(width: number) {
    this._width = width;
  }

  get width(): number {
    return this._width * this.scale.x;
  }

  set height(height: number) {
    this._height = height;
  }

  get height(): number {
    return this._height * this.scale.y;
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  get hitBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x + this.hitbox.x,
      y: this.position.y + this.hitbox.y,
      width: this.hitbox.width,
      height: this.hitbox.height,
    };
  }
}

// CIRCLE ENTITY
interface ICircleConfig extends EntityConfig {
  radius?: number;
  style: Partial<{
    fill: string;
    stroke: string;
    lineWidth: number;
  }>;
  tag: string;
}

const CIRCLE_DEFAULTS = {
  radius: 100,
  style: {
    fill: "black",
    stroke: "transparent",
    lineWidth: 1,
  },
};

class Circle extends Entity {
  public radius: number;
  public style: {
    fill: string;
    stroke: string;
    lineWidth: number;
  };
  constructor(config: ICircleConfig) {
    super(config);
    const radius = config.radius || CIRCLE_DEFAULTS.radius;
    const style = {
      ...CIRCLE_DEFAULTS.style,
      ...config.style,
    };
    this.radius = radius;
    this.style = style;
  }

  get width(): number {
    return this.radius * 2 * this.scale.x;
  }

  get height(): number {
    return this.radius * 2 * this.scale.y;
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.radius * this.scale.x,
      this.position.y + this.radius * this.scale.y
    );
  }

  public render(context: CanvasRenderingContext2D) {
    if (!this.style.fill || !this.style.stroke || !this.style.lineWidth) return;
    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.style.fill;
    context.fill();
    context.lineWidth = this.style.lineWidth;
    context.strokeStyle = this.style.stroke;
    context.stroke();
  }
}

// LINE ENTITY
interface ILineConfig extends EntityConfig {
  start?: Vector;
  end?: Vector;
  style: Partial<{
    stroke: string;
    lineWidth: number;
  }>;
}

const LINE_DEFAULTS = {
  start: new Vector(),
  end: new Vector(100, 100),
  style: {
    stroke: "black",
    lineWidth: 1,
  },
};

class Line extends Entity {
  public start: Vector;
  public end: Vector;
  public style: {
    stroke: string;
    lineWidth: number;
  };
  constructor(config: ILineConfig) {
    super(config);
    const start = config.start || LINE_DEFAULTS.start;
    const end = config.end || LINE_DEFAULTS.end;
    const style = {
      ...LINE_DEFAULTS.style,
      ...config.style,
    };
    this.start = start;
    this.end = end;
    this.style = style;
    this.position = start;
  }

  get width(): number {
    return Math.abs(this.end.x - this.position.x) * this.scale.x;
  }

  get height(): number {
    return Math.abs(this.end.y - this.position.y) * this.scale.y;
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.width * 0.5,
      this.position.y + this.height * 0.5
    );
  }

  public render(context: CanvasRenderingContext2D) {
    if (!this.style.stroke || !this.style.lineWidth) return;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.end.x, this.end.y);
    context.lineWidth = this.style.lineWidth;
    context.strokeStyle = this.style.stroke;
    context.stroke();
  }
}

export { Line, Rect, Circle };
