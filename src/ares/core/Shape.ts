import Vector from "../tools/Vector";
import Cmath from "../tools/Cmath";

// FIX THIS
// alpha shoud be on the style object?
// text need the w/h properties computed properly
// EXPORT THIS TEXT CLASS

interface IPhysics {
  mass: number;
}

interface IEntityConfig {
  acceleration?: Vector;
  velocity?: Vector;
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
  dead?: boolean;
  alpha?: number;
  visible?: boolean;
  physics?: Partial<IPhysics>;
}

abstract class GameEntity {
  public acceleration: Vector;
  public velocity: Vector;
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public dead: boolean;
  public alpha: number;
  public visible: boolean;
  public physics: Partial<IPhysics>;

  constructor(config: IEntityConfig) {
    const {
      acceleration = new Vector(0, 0),
      velocity = new Vector(0, 0),
      position = new Vector(0, 0),
      anchor = new Vector(0, 0),
      scale = new Vector(1, 1),
      pivot = new Vector(0, 0),
      angle = 0,
      dead = false,
      alpha = 1,
      visible = true,
      physics = {},
    } = config;

    this.acceleration = acceleration;
    this.velocity = velocity;
    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.dead = dead;
    this.alpha = alpha;
    this.visible = visible;

    const { mass = 1 } = physics;
    this.physics = { mass };
  }

  get direction(): Vector {
    return this.velocity.clone().normalize();
  }

  distanceTo(entity: GameEntity): number {
    return Cmath.distance(this.center, entity.center);
  }

  angleTo(entity: GameEntity): number {
    return Cmath.angle(this.center, entity.center);
  }

  abstract get width(): number;
  abstract get height(): number;
  abstract get center(): Vector;
  abstract render(context: CanvasRenderingContext2D): void;
}

// RECT ENTITY
interface IRectConfig extends IEntityConfig {
  size?: Vector;
  style?: Partial<{
    fill: string;
    stroke: string;
    lineWidth: number;
  }>;
  hitbox?: Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

const RECT_DEFAULTS = {
  size: new Vector(50, 50),
  style: {
    fill: "black",
    stroke: "transparent",
    lineWidth: 1,
  },
};

class Rect extends GameEntity {
  public size: Vector;
  public style: {
    fill: string;
    stroke: string;
    lineWidth: number;
  };
  public hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  constructor(config: IRectConfig) {
    super(config);
    const size = config.size || RECT_DEFAULTS.size;
    const style = {
      ...RECT_DEFAULTS.style,
      ...config.style,
    };
    const hitbox = {
      ...{ x: 0, y: 0, width: size.x, height: size.y }, // default hitbox
      ...config.hitbox,
    };
    this.size = size;
    this.style = style;
    this.hitbox = hitbox;
  }

  get width(): number {
    return this.size.x * this.scale.x;
  }

  get height(): number {
    return this.size.y * this.scale.y;
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.width * 0.5,
      this.position.y + this.height * 0.5
    );
  }

  get hitBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const { position, hitbox } = this;
    return {
      x: position.x + hitbox.x,
      y: position.y + hitbox.y,
      width: hitbox.width,
      height: hitbox.height,
    };
  }

  public render(context: CanvasRenderingContext2D) {
    if (!this.style.fill || !this.style.stroke || !this.style.lineWidth) return;
    context.beginPath();
    context.rect(0, 0, this.width, this.height);
    context.fillStyle = this.style.fill;
    context.fill();
    context.lineWidth = this.style.lineWidth;
    context.strokeStyle = this.style.stroke;
    context.stroke();
  }
}

// CIRCLE ENTITY
interface ICircleConfig extends IEntityConfig {
  radius?: number;
  style: Partial<{
    fill: string;
    stroke: string;
    lineWidth: number;
  }>;
}

const CIRCLE_DEFAULTS = {
  radius: 100,
  style: {
    fill: "black",
    stroke: "transparent",
    lineWidth: 1,
  },
};

class Circle extends GameEntity {
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
interface ILineConfig extends IEntityConfig {
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

class Line extends GameEntity {
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

// TEXT ENTITY
interface ITextConfig extends IEntityConfig {
  text: string;
  style: Partial<{
    font: string;
    fill: string;
    stroke: string;
    lineWidth: number;
    align: CanvasTextAlign;
  }>;
}

const TEXT_DEFAULTS = {
  text: " ",
  style: {
    font: "20px Arial",
    fill: "black",
    stroke: "transparent",
    lineWidth: 1,
    align: "center" as CanvasTextAlign,
  },
};

class Text extends GameEntity {
  public text: string;
  public style: {
    font: string;
    fill: string;
    stroke: string;
    lineWidth: number;
    align: CanvasTextAlign;
  };
  constructor(config: ITextConfig) {
    super(config);
    const text = config.text || TEXT_DEFAULTS.text;
    const style = {
      ...TEXT_DEFAULTS.style,
      ...config.style,
    };
    this.text = text;
    this.style = style;
  }

  get width(): number {
    return 0;
  }

  get height(): number {
    return 0;
  }

  get center(): Vector {
    return new Vector(0, 0);
  }

  public render(context: CanvasRenderingContext2D) {
    const { text } = this;
    const { font, fill, stroke, lineWidth, align } = this.style;
    context.font = font;
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.textAlign = align;
    context.strokeText(text, 0, 0);
    context.fillText(text, 0, 0);
  }
}

export { Line, Rect, Circle };
