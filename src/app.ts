import Engine from "./ares/engine/Engine";
import Vector from "./ares/tools/Vector";
import Assets from "./ares/core/Assets";
import Animation from "./ares/core/Animation";
import barrelImageURL from "./images/barrel.png";
import spritesheetImageURL from "./images/spritesheet.png";

// Your TypeScript code is well-structured and follows good practices. However, there are a few areas where you could make improvements for elegance and potentially performance:
// Use of Properties<T> type: This type is essentially equivalent to T itself. You can directly use the type T instead of Properties<T>.
// Use of EntityConfig and EntityContainerConfig: These types are equivalent to Entity and EntityContainer respectively. You can directly use Entity and EntityContainer instead of EntityConfig and EntityContainerConfig.
// Use of Omit<T, "tag">: This is unnecessary because the tag property is not optional in the Entity type. You can remove the Omit usage.
// Use of Object.assign(this, config): This is a potential performance bottleneck. It would be more performant to manually assign each property in the constructor.
// Use of Array.splice() in EntityContainer.update(): This can be performance-intensive for large arrays. Consider using a different data structure, like a linked list, for better performance when removing elements.

//
//
// ENTITY -------------------------------------------------------------
namespace CLUSTER {
  export type Properties<T> = {
    [K in keyof T]: T[K];
  };
  export type Milliseconds = number;

  export type Seconds = number;

  export type Point = {
    x: number;
    y: number;
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

  export type EntityContainerConfig = Omit<Entity, "tag">;
  export type EntityContainer = Properties<Entity> & {
    children: Array<Entity | EntityContainer>;
  };

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

  export type TileSpriteConfig = SpriteConfig & {
    tileWidth: number;
    tileHeight: number;
  };
  export type TileSprite = Properties<
    Sprite & {
      tileWidth: number;
      tileHeight: number;
      frame: Point;
    }
  >;

  export enum EntityTag {
    CIRCLE = "circle",
    RECT = "rectangle",
    LINE = "line",
    TEXT = "text",
    SPRITE = "sprite",
    TILESPRITE = "tileSprite",
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
class TileSprite extends Sprite implements CLUSTER.TileSprite {
  readonly tag: CLUSTER.EntityTag = CLUSTER.EntityTag.TILESPRITE; // Discriminant property
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly animation: Animation;
  constructor(config: CLUSTER.TileSpriteConfig) {
    const { tileWidth = 32, tileHeight = 32, ...optionals } = config;
    super(optionals as CLUSTER.SpriteConfig);
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.animation = new Animation({
      frame: { x: 0, y: 0 },
    });
  }

  get frame() {
    return this.animation.frame;
  }

  set frame(frame) {
    this.animation.frame = frame;
  }

  public update(dt: number) {
    this.animation.update(dt);
  }
}

class EntityContainer extends Entity implements CLUSTER.EntityContainer {
  readonly tag: string = "container"; // Discriminant property
  public children: Array<Entity | EntityContainer>;
  constructor(config: CLUSTER.EntityContainerConfig = {}) {
    super(config as CLUSTER.EntityConfig);
    this.children = [];
  }

  add(entity: Entity | EntityContainer): Entity | EntityContainer {
    this.children.push(entity);
    return entity;
  }

  remove(entity: Entity | EntityContainer): Entity | EntityContainer {
    const index = this.children.indexOf(entity);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return entity;
  }

  update(dt: CLUSTER.Milliseconds, t: CLUSTER.Seconds) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if ("update" in child && child.update) {
        child.update(dt, t);
      }
      if ("dead" in child && child.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}
// ENTITY -------------------------------------------------------------
//
//

//
//
// RENDERER -----------------------------------------------------------
const STYLES = {
  lineWidth: 1,
  stroke: "black",
  align: "center" as CanvasTextAlign,
  font: '24px "Press Start 2P"',
  fill: "lightblue",
};

type Renderable = CLUSTER.Entity;
type RenderableContainer = CLUSTER.EntityContainer;
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

  setTransform(renderable: Renderable) {
    this.setTransformPosition(renderable);
    this.setTransformAnchor(renderable);
    this.setTransformScale(renderable);
    this.setTransformAngle(renderable);
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
    this.context.strokeStyle = renderable.style?.stroke || "transparent";
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.textAlign =
      (renderable.style?.align as CanvasTextAlign) || STYLES.align;
    this.context.strokeText(renderable.text, 0, 0);
    this.context.fillText(renderable.text, 0, 0);
  }

  drawSprite(renderable: CLUSTER.Sprite) {
    this.context.drawImage(renderable.image, 0, 0);
  }

  drawTileSprite(renderable: CLUSTER.TileSprite) {
    const { tileWidth, tileHeight, frame, image } = renderable;
    this.context.drawImage(
      image,
      frame.x * tileWidth,
      frame.y * tileHeight,
      tileWidth,
      tileHeight,
      0,
      0,
      tileWidth,
      tileHeight
    );
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
      case CLUSTER.EntityTag.TILESPRITE:
        this.drawTileSprite(renderable as CLUSTER.TileSprite);
        break;
      default:
        throw new Error("Unknown renderable type");
    }

    this.context.restore();
  }

  renderRenderableContainer(renderable: RenderableContainer): void {
    if (renderable.children.length === 0) {
      return;
    }

    this.context.save();

    this.setTransform(renderable);

    renderable.children.forEach((child: Renderable) => {
      if (Array.isArray(child) && child.length !== 0) {
        this.renderRenderableArray(child as Renderable[]);
      } else if (
        "children" in child &&
        Array.isArray(child.children) &&
        child.children.length !== 0
      ) {
        this.renderRenderableArray(child.children);
      } else {
        this.renderRenderable(child as Renderable);
      }
    });

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
  render(renderable: RenderableContainer, clear?: boolean): void;
  render(renderable: Renderable | Renderable[], clear: boolean = true): void {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    // TODO
    // refactor these into small functions
    // for the entity container case, transform the context
    if (Array.isArray(renderable) && renderable.length !== 0) {
      this.renderRenderableArray(renderable as Renderable[]);
    } else if (
      "children" in renderable &&
      Array.isArray(renderable.children) &&
      renderable.children.length !== 0
    ) {
      this.renderRenderableContainer(renderable as RenderableContainer);
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

// TODO
// need a container update for a TileSprite
const tileSprite = new TileSprite({
  image: Assets.image(spritesheetImageURL),
  position: new Vector(500, 200),
  tileWidth: 32,
  tileHeight: 32,
});
tileSprite.animation.add(
  "idle",
  [
    { x: 4, y: 0 },
    { x: 5, y: 0 },
  ],
  0.25
);
tileSprite.animation.play("idle");

const scene = new EntityContainer({
  position: new Vector(200, 0),
});
scene.add(rectangle);
scene.add(circle);
scene.add(line);
scene.add(image);
scene.add(text);
scene.add(tileSprite);

const renderer = new Renderer({
  width: 800,
  height: 600,
  parentElementId: "#app",
});
const engine = new Engine({
  update: (dt, t) => {
    scene.update(dt, t);
  },
  render: () => {
    renderer.render(scene);
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
