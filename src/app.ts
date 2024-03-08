import Engine from "./ares/engine/Engine";
import Vector from "./ares/tools/Vector";
import Assets from "./ares/core/Assets";
import Animation from "./ares/core/Animation";
import barrelImageURL from "./images/barrel.png";
import spritesheetImageURL from "./images/spritesheet.png";
import { Cluster } from "./cluster.types";

// ENTITY -------------------------------------------------------------
abstract class EntityClass implements Cluster.EntityType {
  readonly tag: Cluster.EntityTag; // Discriminant property
  constructor(tag: Cluster.EntityTag, options: Cluster.EntityOptions = {}) {
    Object.assign(this, options);
    this.tag = tag;
  }
}
class RectClass extends EntityClass implements Cluster.RectType {
  public width: number;
  public height: number;
  constructor(options: Cluster.RectOptions) {
    const { width = 32, height = 32, ...optionals } = options;
    super(Cluster.EntityTag.RECT, optionals as Cluster.EntityOptions);
    this.width = width;
    this.height = height;
  }
}
class CircleClass extends EntityClass implements Cluster.CircleType {
  public radius: number;
  constructor(options: Cluster.CircleOptions) {
    const { radius = 16, ...optionals } = options;
    super(Cluster.EntityTag.CIRCLE, optionals as Cluster.EntityOptions);
    this.radius = radius;
  }
}
class LineClass extends EntityClass implements Cluster.LineType {
  public start: Vector;
  public end: Vector;
  constructor(options: Cluster.LineOptions) {
    const {
      start = new Vector(0, 0),
      end = new Vector(32, 32),
      ...optionals
    } = options;
    super(Cluster.EntityTag.LINE, optionals as Cluster.EntityOptions);
    this.start = start;
    this.end = end;
  }
}
class TextClass extends EntityClass implements Cluster.TextType {
  public text: string;
  constructor(options: Cluster.TextOptions) {
    const { text = "text", ...optionals } = options;
    super(Cluster.EntityTag.TEXT, optionals as Cluster.EntityOptions);
    this.text = text;
  }
}
class SpriteClass extends EntityClass implements Cluster.SpriteType {
  public image: HTMLImageElement;
  constructor(options: Cluster.SpriteOptions) {
    const { image = new Image(), ...optionals } = options;
    super(Cluster.EntityTag.SPRITE, optionals as Cluster.EntityOptions);
    this.image = image;
  }
}
class TileSpriteClass extends SpriteClass implements Cluster.TileSpriteType {
  readonly tag: Cluster.EntityTag = Cluster.EntityTag.TILESPRITE; // Shadowing the sprite tag
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly animation: Animation;
  constructor(options: Cluster.TileSpriteOptions) {
    const { tileWidth = 32, tileHeight = 32, ...optionals } = options;
    super(optionals as Cluster.SpriteOptions);
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
class EntityContainerClass
  extends EntityClass
  implements Cluster.EntityContainerType
{
  public children: Array<Cluster.EntityType | Cluster.EntityContainerType>;
  constructor(options: Cluster.EntityContainerOptions = {}) {
    super(Cluster.EntityTag.CONTAINER, options as Cluster.EntityOptions);
    this.children = [];
  }

  add(
    entity: Cluster.EntityType | Cluster.EntityContainerType
  ): Cluster.EntityType | Cluster.EntityContainerType {
    this.children.push(entity);
    return entity;
  }

  remove(
    entity: Cluster.EntityType | Cluster.EntityContainerType
  ): Cluster.EntityType | Cluster.EntityContainerType {
    const index = this.children.indexOf(entity);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return entity;
  }

  update(dt: number, t: number) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if ("update" in child && child.update) {
        (child.update as (dt: number, t: number) => void)(dt, t);
      }

      // TODO
      // Use of Array.splice() in EntityContainer.update():
      // This can be performance-intensive for large arrays.
      // Consider using a different data structure, like a linked list,
      // for better performance when removing elements.
      if ("dead" in child && child.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}
// ENTITY -------------------------------------------------------------

// RENDERER -----------------------------------------------------------
const STYLES = {
  lineWidth: 1,
  stroke: "black",
  align: "center" as CanvasTextAlign,
  font: '24px "Press Start 2P"',
  fill: "lightblue",
};

type Renderable = Cluster.EntityType;
type RenderableContainer = Cluster.EntityContainerType;
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

  drawRectangle(renderable: Cluster.RectType) {
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.rect(0, 0, renderable.width, renderable.height);
    this.context.fill();
    this.context.stroke();
  }

  drawCircle(renderable: Cluster.CircleType) {
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.arc(0, 0, renderable.radius, 0, Math.PI * 2, false);
    this.context.fill();
    this.context.stroke();
  }

  drawLine(renderable: Cluster.LineType) {
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.moveTo(renderable.start.x, renderable.start.y);
    this.context.lineTo(renderable.end.x, renderable.end.y);
    this.context.closePath();
    this.context.stroke();
  }

  drawText(renderable: Cluster.TextType) {
    this.context.font = renderable.style?.font || STYLES.font;
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.strokeStyle = renderable.style?.stroke || "transparent";
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.textAlign =
      (renderable.style?.align as CanvasTextAlign) || STYLES.align;
    this.context.strokeText(renderable.text, 0, 0);
    this.context.fillText(renderable.text, 0, 0);
  }

  drawSprite(renderable: Cluster.SpriteType) {
    this.context.drawImage(renderable.image, 0, 0);
  }

  drawTileSprite(renderable: Cluster.TileSpriteType) {
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

    switch (renderable.tag as Cluster.EntityTag) {
      case Cluster.EntityTag.RECT:
        this.drawRectangle(renderable as Cluster.RectType);
        break;
      case Cluster.EntityTag.CIRCLE:
        this.drawCircle(renderable as Cluster.CircleType);
        break;
      case Cluster.EntityTag.LINE:
        this.drawLine(renderable as Cluster.LineType);
        break;
      case Cluster.EntityTag.SPRITE:
        this.drawSprite(renderable as Cluster.SpriteType);
        break;
      case Cluster.EntityTag.TEXT:
        this.drawText(renderable as Cluster.TextType);
        break;
      case Cluster.EntityTag.TILESPRITE:
        this.drawTileSprite(renderable as Cluster.TileSpriteType);
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
      if ("tag" in child && child.tag === "container") {
        this.renderRenderableContainer(child as RenderableContainer);
      } else {
        this.renderRenderable(child as Renderable);
      }
    });

    this.context.restore();
  }

  render(
    renderable: Renderable | RenderableContainer,
    clear: boolean = true
  ): void {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    // TODO
    // refactor these into small functions
    // for the entity container case, transform the context
    if ("tag" in renderable && renderable.tag === "container") {
      this.renderRenderableContainer(renderable as RenderableContainer);
    } else {
      this.renderRenderable(renderable as Renderable);
    }
  }
}
// RENDERER -----------------------------------------------------------

const e = new TileSpriteClass({
  image: Assets.image(spritesheetImageURL),
  position: new Vector(500, 200),
  tileWidth: 32,
  tileHeight: 32,
});
e.animation.add(
  "idle",
  [
    { x: 4, y: 0 },
    { x: 5, y: 0 },
  ],
  0.25
);
e.animation.play("idle");

const scene = new EntityContainerClass();
scene.add(e);

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
