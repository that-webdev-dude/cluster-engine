import { Cluster } from "../types/cluster.types";
import { Entity } from "../core/Entity";
import { Container } from "../core/Container";
import { Rect } from "../entities/Rect";
import { Circle } from "../entities/Circle";
import { Line } from "../entities/Line";
import { Text } from "../entities/Text";
import { Sprite, TileSprite } from "../entities/Sprite";

const STYLES = {
  lineWidth: 1,
  stroke: "black",
  align: "center" as CanvasTextAlign,
  font: '24px "Press Start 2P"',
  fill: "lightblue",
};

type Renderable = Entity | Container;
type RenderableContainer = Container;
type RendererOptions = {
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
  }: RendererOptions = {}) {
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
    this.height = height;
    this.width = width;
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

  isContainer(renderable: Renderable) {
    if ("tag" in renderable && renderable.tag === "container") {
      return true;
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

  drawRectangle(renderable: Rect) {
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.rect(0, 0, renderable.width, renderable.height);
    this.context.fill();
    this.context.stroke();
  }

  drawCircle(renderable: Circle) {
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.arc(0, 0, renderable.radius, 0, Math.PI * 2, false);
    this.context.fill();
    this.context.stroke();
  }

  drawLine(renderable: Line) {
    this.context.strokeStyle = renderable.style?.stroke || STYLES.stroke;
    this.context.beginPath();
    this.context.moveTo(renderable.start.x, renderable.start.y);
    this.context.lineTo(renderable.end.x, renderable.end.y);
    this.context.closePath();
    this.context.stroke();
  }

  drawText(renderable: Text) {
    this.context.font = renderable.style?.font || STYLES.font;
    this.context.fillStyle = renderable.style?.fill || STYLES.fill;
    this.context.strokeStyle = renderable.style?.stroke || "transparent";
    this.context.lineWidth = renderable.style?.lineWidth || STYLES.lineWidth;
    this.context.textAlign =
      (renderable.style?.align as CanvasTextAlign) || STYLES.align;
    this.context.strokeText(renderable.text, 0, 0);
    this.context.fillText(renderable.text, 0, 0);
  }

  drawSprite(renderable: Sprite) {
    this.context.drawImage(renderable.image, 0, 0);
  }

  drawTileSprite(renderable: TileSprite) {
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
    this.setTransform(renderable);

    if ("tag" in renderable && renderable.tag) {
      switch (renderable.tag as Cluster.EntityTag) {
        case Cluster.EntityTag.RECT:
          this.drawRectangle(renderable as Rect);
          break;
        case Cluster.EntityTag.CIRCLE:
          this.drawCircle(renderable as Circle);
          break;
        case Cluster.EntityTag.LINE:
          this.drawLine(renderable as Line);
          break;
        case Cluster.EntityTag.SPRITE:
          this.drawSprite(renderable as Sprite);
          break;
        case Cluster.EntityTag.TEXT:
          this.drawText(renderable as Text);
          break;
        case Cluster.EntityTag.TILESPRITE:
          this.drawTileSprite(renderable as TileSprite);
          break;
        default:
          throw new Error("Unknown renderable type");
      }
    }

    this.context.restore();
  }

  renderRenderableContainer(renderable: RenderableContainer): void {
    if (renderable.children.length === 0) {
      return;
    }

    this.context.save();

    this.setAlpha(renderable);
    this.setTransform(renderable);

    renderable.children.forEach((child) => {
      if ("tag" in child && child.tag === "container") {
        this.renderRenderableContainer(child as RenderableContainer);
      } else {
        this.renderRenderable(child as Renderable);
      }
    });

    this.context.restore();
  }

  render(renderable: Renderable, clear: boolean = true): void {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    if (this.isContainer(renderable)) {
      this.renderRenderableContainer(renderable as RenderableContainer);
    } else {
      this.renderRenderable(renderable);
    }
  }
}

export default Renderer;
