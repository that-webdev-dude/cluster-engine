import Engine from "./ares/engine/Engine";
import Vector from "./ares/tools/Vector";
import Assets from "./ares/core/Assets";
import barrelImageURL from "./images/barrel.png";

//
//
// ENTITY -------------------------------------------------------------
namespace CLUSTER {
  export type Properties<T> = {
    [K in keyof T]: T[K];
  };

  export type LineStyle = {
    stroke?: string;
  };

  export type ShapeStyle = Properties<
    {
      fill?: string;
      lineWidth?: number;
    } & LineStyle
  >;

  export type TextStyle = Properties<
    {
      font?: string;
      align?: CanvasTextAlign;
    } & ShapeStyle
  >;

  // TODO
  // change the "type" to "tag" to avoid confusion with the built-in "type" property
  // use the tag enum to avoid typos
  export type EntityConfig = Properties<Entity>;
  export type Entity = Properties<
    {
      tag: string; // REQUIRED discriminant property
    } & {
      acceleration?: Vector;
      velocity?: Vector;
      position?: Vector;
      anchor?: Vector;
      scale?: Vector;
      pivot?: Vector;
      angle?: number;
      alpha?: number;
      dead?: boolean;
      visible?: boolean;
    }
  >;

  export type RectConfig = Omit<Rect, "tag">;
  export type Rect = Properties<
    Entity & {
      width: number;
      height: number;
      style?: ShapeStyle;
    }
  >;

  export type CircleConfig = Omit<Circle, "tag">;
  export type Circle = Properties<
    Entity & {
      radius: number;
      style?: ShapeStyle;
    }
  >;

  export type LineConfig = Omit<Line, "tag">;
  export type Line = Properties<
    Entity & {
      start: Vector;
      end: Vector;
      style?: LineStyle;
    }
  >;

  export type TextConfig = Omit<Text, "tag">;
  export type Text = Properties<
    Entity & {
      text: string;
      style?: TextStyle;
    }
  >;

  export type SpriteConfig = Omit<Sprite, "tag">;
  export type Sprite = Properties<
    Entity & {
      image: HTMLImageElement;
    }
  >;

  export enum EntityTag {
    CIRCLE = "circle",
    RECT = "rectangle",
    LINE = "line",
    TEXT = "text",
    SPRITE = "sprite",
  }
}

abstract class Entity implements CLUSTER.Entity {
  abstract readonly tag: string; // Discriminant property
  acceleration?: Vector | undefined;
  velocity?: Vector | undefined;
  position?: Vector | undefined;
  anchor?: Vector | undefined;
  scale?: Vector | undefined;
  pivot?: Vector | undefined;
  angle?: number | undefined;
  alpha?: number | undefined;
  dead?: boolean | undefined;
  visible?: boolean | undefined;
  constructor(config: CLUSTER.EntityConfig) {
    Object.assign(this, config);
  }
}
class Rect extends Entity implements CLUSTER.Rect {
  readonly tag: CLUSTER.EntityTag = CLUSTER.EntityTag.RECT; // Discriminant property
  public style: CLUSTER.ShapeStyle;
  public width: number;
  public height: number;
  constructor(config: CLUSTER.RectConfig) {
    const { style = {}, width = 32, height = 32, ...optionals } = config;
    super(optionals as CLUSTER.EntityConfig);
    this.style = style;
    this.width = width;
    this.height = height;
  }
}
class Circle extends Entity implements CLUSTER.Circle {
  readonly tag: CLUSTER.EntityTag = CLUSTER.EntityTag.CIRCLE; // Discriminant property
  public style: CLUSTER.ShapeStyle;
  public radius: number;
  constructor(config: CLUSTER.CircleConfig) {
    const { style = {}, radius = 16, ...optionals } = config;
    super(optionals as CLUSTER.EntityConfig);
    this.style = style;
    this.radius = radius;
  }
}
class Line extends Entity implements CLUSTER.Line {
  readonly tag: CLUSTER.EntityTag = CLUSTER.EntityTag.LINE; // Discriminant property
  public style: CLUSTER.LineStyle;
  public start: Vector;
  public end: Vector;
  constructor(config: CLUSTER.LineConfig) {
    const {
      style = {},
      start = new Vector(0, 0),
      end = new Vector(32, 32),
      ...optionals
    } = config;
    super(optionals as CLUSTER.EntityConfig);
    this.style = style;
    this.start = start;
    this.end = end;
  }
}
class Text extends Entity implements CLUSTER.Text {
  readonly tag: CLUSTER.EntityTag = CLUSTER.EntityTag.TEXT; // Discriminant property
  public style: CLUSTER.TextStyle;
  public text: string;
  constructor(config: CLUSTER.TextConfig) {
    const { style = {}, text = "text", ...optionals } = config;
    super(optionals as CLUSTER.EntityConfig);
    this.style = style;
    this.text = text;
  }
}
class Sprite extends Entity implements CLUSTER.Sprite {
  readonly tag: CLUSTER.EntityTag = CLUSTER.EntityTag.SPRITE; // Discriminant property
  public image: HTMLImageElement;
  constructor(config: CLUSTER.SpriteConfig) {
    const { image = new Image(), ...optionals } = config;
    super(optionals as CLUSTER.EntityConfig);
    this.image = image;
  }
}
// ENTITY -------------------------------------------------------------
//
//

//
//
// RENDERER -----------------------------------------------------------
// TODO
// better defaults for shapes ant text?
const STYLES = {
  lineWidth: 1,
  stroke: "black",
  align: "center" as CanvasTextAlign,
  font: '24px "Press Start 2P"',
  fill: "lightblue",
};

type Renderable = Omit<CLUSTER.Entity, "acceleration" | "velocity">;
type RendererConfig = {
  parentElementId?: string;
  height?: number;
  width?: number;
};
class Renderer {
  readonly height: number;
  readonly width: number;
  readonly view: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;

  constructor({
    parentElementId = "",
    height = 640,
    width = 832,
  }: RendererConfig = {}) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Failed to get 2D context");

    if (parentElementId) {
      let appElement = document.querySelector(parentElementId) as HTMLElement;
      canvas.width = width;
      canvas.height = height;
      appElement.appendChild(canvas);
    }

    this.context = context;
    this.height = canvas.height;
    this.width = canvas.width;
    this.view = canvas;

    this.initialize();
  }

  initialize() {
    this.context.textBaseline = "top";
    this.context.imageSmoothingEnabled = false;
    document.addEventListener("keypress", (event) => {
      if (event.code === "KeyF") {
        this.toggleFullScreen();
      }
    });
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.view.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  isVisible(renderable: Renderable) {
    if ("visible" in renderable && !renderable.visible) {
      return false;
    }
    return true;
  }

  isTransparent(renderable: Renderable) {
    if ("alpha" in renderable && renderable.alpha) {
      if (renderable.alpha <= 0) {
        return true;
      }
    }
    return false;
  }

  setAlpha(renderable: Renderable) {
    if ("alpha" in renderable && renderable.alpha) {
      this.context.globalAlpha = renderable.alpha;
    }
  }

  setTransformPosition(renderable: Renderable) {
    if ("position" in renderable && renderable.position) {
      if (renderable.position.x !== 0 || renderable.position.y !== 0) {
        this.context.translate(
          Math.round(renderable.position.x),
          Math.round(renderable.position.y)
        );
      }
    }
  }

  setTransformAnchor(renderable: Renderable) {
    if ("anchor" in renderable && renderable.anchor) {
      if (renderable.anchor.x !== 0 || renderable.anchor.y !== 0) {
        this.context.translate(renderable.anchor.x, renderable.anchor.y);
      }
    }
  }

  setTransformScale(renderable: Renderable) {
    if ("scale" in renderable && renderable.scale) {
      if (renderable.scale.x !== 1 || renderable.scale.y !== 1) {
        this.context.scale(renderable.scale.x, renderable.scale.y);
      }
    }
  }

  setTransformAngle(renderable: Renderable) {
    let p = { x: 0, y: 0 };
    if ("pivot" in renderable && renderable.pivot) {
      p.x = renderable.pivot.x;
      p.y = renderable.pivot.y;
    }
    if ("angle" in renderable && renderable.angle) {
      if (renderable.angle !== 0) {
        this.context.translate(p.x, p.y);
        this.context.rotate(renderable.angle);
        this.context.translate(-p.x, -p.y);
      }
    }
  }

  drawRectangle(renderable: CLUSTER.Rect) {
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.rect(0, 0, renderable.width, renderable.height);
    this.context.fill();
    this.context.stroke();
  }

  drawCircle(renderable: CLUSTER.Circle) {
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.arc(0, 0, circle.radius, 0, Math.PI * 2, false);
    this.context.fill();
    this.context.stroke();
  }

  drawLine(renderable: CLUSTER.Line) {
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.moveTo(renderable.start.x, renderable.start.y);
    this.context.lineTo(renderable.end.x, renderable.end.y);
    this.context.closePath();
    this.context.stroke();
  }

  drawText(renderable: CLUSTER.Text) {
    this.context.font = renderable.style?.font || STYLES.font;
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.textAlign =
      (renderable.style?.align as CanvasTextAlign) || STYLES.align;
    this.context.strokeText(renderable.text, 0, 0);
    this.context.fillText(renderable.text, 0, 0);
  }

  drawSprite(renderable: CLUSTER.Sprite) {
    this.context.drawImage(renderable.image, 0, 0);
  }

  renderRenderable(renderable: Renderable): void {
    if (!this.isVisible(renderable) || this.isTransparent(renderable)) {
      return;
    }

    this.context.save();

    this.setAlpha(renderable);
    this.setTransformPosition(renderable);
    this.setTransformAnchor(renderable);
    this.setTransformScale(renderable);
    this.setTransformAngle(renderable);

    switch (renderable.tag as CLUSTER.EntityTag) {
      case CLUSTER.EntityTag.RECT:
        this.drawRectangle(renderable as CLUSTER.Rect);
        break;
      case CLUSTER.EntityTag.CIRCLE:
        this.drawCircle(renderable as CLUSTER.Circle);
        break;
      case CLUSTER.EntityTag.LINE:
        this.drawLine(renderable as CLUSTER.Line);
        break;
      case CLUSTER.EntityTag.SPRITE:
        this.drawSprite(renderable as CLUSTER.Sprite);
        break;
      case CLUSTER.EntityTag.TEXT:
        this.drawText(renderable as CLUSTER.Text);
        break;
      default:
        throw new Error("Unknown renderable type");
    }

    this.context.restore();
  }

  renderRenderableArray(renderables: Renderable[]): void {
    if (renderables.length === 0) {
      return;
    }

    this.context.save();

    // if there's a position property in the array, then translate the context
    // this will work only for a container case

    renderables.forEach((renderable: Renderable[] | Renderable) => {
      if (Array.isArray(renderable) && renderable.length !== 0) {
        this.renderRenderableArray(renderable as Renderable[]);
      } else {
        this.renderRenderable(renderable as Renderable);
      }
    });

    this.context.restore();
  }

  // add support for container
  render(renderable: Renderable, clear?: boolean): void;
  render(renderable: Renderable[], clear?: boolean): void;
  render(renderable: Renderable | Renderable[], clear: boolean = true): void {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    if (Array.isArray(renderable) && renderable.length !== 0) {
      this.renderRenderableArray(renderable as Renderable[]);
    } else {
      this.renderRenderable(renderable as Renderable);
    }
  }
}
// RENDERER -----------------------------------------------------------
//
//

const rectangle = new Rect({
  position: new Vector(100, 100),
  width: 100,
  height: 100,
});

const circle = new Circle({
  position: new Vector(400, 400),
  radius: 50,
  alpha: 0.5,
  style: {
    fill: "lightgreen",
    stroke: "darkgreen",
  },
});

const line = new Line({
  start: new Vector(50, 0),
  end: new Vector(100, 100),
  position: new Vector(100, 200),
});

const image = new Sprite({
  position: new Vector(200, 200),
  image: Assets.image(barrelImageURL),
});

const text = new Text({
  position: new Vector(200, 400),
  text: "Hello, World!",
});

const renderer = new Renderer({
  width: 800,
  height: 600,
  parentElementId: "#app",
});
const engine = new Engine({
  update: (dt, t) => {},
  render: () => {
    renderer.render([text, rectangle, image, circle, line]);
  },
});

export default () => {
  Assets.onReady(() => {
    engine.start();
  });
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
