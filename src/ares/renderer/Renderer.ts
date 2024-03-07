/**
 * that.webdev.dude - 2024
 */

type Renderable = {
  type: string;
} & Partial<{
  position: { x: number; y: number };
  anchor: { x: number; y: number };
  scale: { x: number; y: number };
  pivot: { x: number; y: number };
  angle: number;
  alpha: number;
  visible: boolean;
}>;

type RenderableRect = Renderable & {
  width: number;
  height: number;
  style: Partial<{
    fill: string;
    stroke: string;
    lineWidth: number;
  }>;
};

type RenderableImage = Renderable & {
  width: number;
  height: number;
  image: HTMLImageElement;
};

type RenderableText = Renderable & {
  text: string;
  style: Partial<{
    font: string;
    fill: string;
    stroke: string;
    lineWidth: number;
    align: CanvasTextAlign;
  }>;
};

type RenderableEntity = RenderableRect | RenderableImage | RenderableText;

function drawText(ctx: CanvasRenderingContext2D, renderable: RenderableText) {
  ctx.font = renderable.style.font || '24px "Press Start 2P"';
  ctx.fillStyle = renderable.style.fill || "black";
  ctx.strokeStyle = renderable.style.stroke || "black";
  ctx.lineWidth = renderable.style.lineWidth || 1;
  ctx.textAlign = renderable.style.align || "center";
  ctx.strokeText(renderable.text, 0, 0);
  ctx.fillText(renderable.text, 0, 0);
}

import {
  EntityType,
  ContainerType,
  CircleType,
  RectType,
  LineType,
  TextType,
  SpriteType,
} from "../types";

class CanvasArtist {
  static drawCircle(ctx: CanvasRenderingContext2D, circle: CircleType) {
    ctx.beginPath();
    ctx.arc(0, 0, circle.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = circle.fill;
    ctx.fill();
    ctx.lineWidth = circle.lineWidth;
    ctx.strokeStyle = circle.stroke;
    ctx.stroke();
  }

  static drawRect(ctx: CanvasRenderingContext2D, rect: RectType) {
    ctx.beginPath();
    ctx.rect(0, 0, rect.width / rect.scale.x, rect.height / rect.scale.y);
    ctx.fillStyle = rect.fill;
    ctx.fill();
    ctx.lineWidth = rect.lineWidth;
    ctx.strokeStyle = rect.stroke;
    ctx.stroke();
  }

  static drawLine(ctx: CanvasRenderingContext2D, line: LineType) {
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.lineWidth = line.lineWidth;
    ctx.strokeStyle = line.stroke;
    ctx.stroke();
  }

  static drawText(ctx: CanvasRenderingContext2D, text: TextType) {
    ctx.font = text.font;
    ctx.fillStyle = text.fill;
    ctx.strokeStyle = text.stroke;
    ctx.lineWidth = text.lineWidth;
    ctx.textAlign = text.align as CanvasTextAlign;
    ctx.strokeText(text.text, 0, 0);
    ctx.fillText(text.text, 0, 0);
  }

  static drawSprite(ctx: CanvasRenderingContext2D, tileSprite: SpriteType) {
    ctx.drawImage(
      tileSprite.image,
      (tileSprite.frame.x * tileSprite.width) / tileSprite.scale.x,
      (tileSprite.frame.y * tileSprite.height) / tileSprite.scale.y,
      tileSprite.width / tileSprite.scale.x,
      tileSprite.height / tileSprite.scale.y,
      0,
      0,
      tileSprite.width / tileSprite.scale.x,
      tileSprite.height / tileSprite.scale.y
    );
  }

  static draw(ctx: CanvasRenderingContext2D, entity: EntityType) {
    if ("tag" in entity && entity.tag) {
      switch (entity.tag) {
        case "rect":
          this.drawRect(ctx, entity as RectType);
          break;
        case "circle":
          this.drawCircle(ctx, entity as CircleType);
          break;
        case "line":
          this.drawLine(ctx, entity as LineType);
          break;
        case "text":
          this.drawText(ctx, entity as TextType);
          break;
        case "sprite":
          this.drawSprite(ctx, entity as SpriteType);
          break;
        default:
          break;
      }
    }
  }
}

type RendererConfig = {
  height?: number;
  width?: number;
};

class Renderer {
  readonly height: number;
  readonly width: number;
  readonly view: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;

  constructor({ height = 640, width = 832 }: RendererConfig = {}) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get 2D context");
    }

    // TODO: Fix this
    // neet to account for the pixel ratio?

    canvas.width = width;
    canvas.height = height;

    this.context = context;
    this.height = canvas.height;
    this.width = canvas.width;
    this.view = canvas;

    this._init();
  }

  private _init() {
    this.context.textBaseline = "top";
    this.context.imageSmoothingEnabled = false;
    document.addEventListener("keypress", (event) => {
      if (event.code === "KeyF") {
        this._toggleFullscreen();
      }
    });
  }

  private _toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.view.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  private _render(child: EntityType) {
    if (child.alpha <= 0) {
      return;
    }

    // TODO: Fix this
    // find a hack to prevent rendering of entities that are outside the viewport

    this.context.save();

    if (child.alpha) {
      this.context.globalAlpha = child.alpha;
    }

    if (child.position.x !== 0 || child.position.y !== 0) {
      this.context.translate(
        Math.round(child.position.x),
        Math.round(child.position.y)
      );
    }

    if (child.anchor.x !== 0 || child.anchor.y !== 0) {
      this.context.translate(child.anchor.x, child.anchor.y);
    }

    if (child.scale.x !== 1 || child.scale.y !== 1) {
      this.context.scale(child.scale.x, child.scale.y);
    }

    if (child.angle !== 0) {
      const { x: px, y: py } = child.pivot || { x: 0, y: 0 };
      this.context.translate(px, py);
      this.context.rotate(child.angle);
      this.context.translate(-px, -py);
    }

    CanvasArtist.draw(this.context, child);

    this.context.restore();
  }

  private _renderRecursive(container: ContainerType) {
    if (container.size === 0) return;

    this.context.save();

    if (container.position.x !== 0 || container.position.y !== 0) {
      this.context.translate(
        Math.round(container.position.x),
        Math.round(container.position.y)
      );
    }

    container.children.forEach((child) => {
      if ("children" in child) {
        this._renderRecursive(child as ContainerType);
      } else {
        this._render(child as EntityType);
      }
    });

    this.context.restore();
  }

  public render(item: ContainerType | EntityType, clear: boolean = true) {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    if ("children" in item) {
      this._renderRecursive(item as ContainerType);
    } else {
      this._render(item as EntityType);
    }
  }

  // DEV
  // a way to test/improve the renderer
  // ------------------------------------------------------------------------------------------
  private _drawRect(rect: RenderableRect) {
    this.context.beginPath();
    this.context.rect(0, 0, rect.width, rect.height);
    this.context.fillStyle = rect.style.fill || "black";
    this.context.fill();
    this.context.lineWidth = rect.style.lineWidth || 1;
    this.context.strokeStyle = rect.style.stroke || "black";
    this.context.stroke();
  }

  private _drawImage(renderable: RenderableImage) {
    this.context.drawImage(
      renderable.image,
      0,
      0,
      renderable.width,
      renderable.height
    );
  }

  private _drawText(renderable: RenderableText) {
    const { text, style } = renderable;
    if (!text) throw new Error("Text is required");
    this.context.font = renderable.style.font || '24px "Press Start 2P"';
    this.context.fillStyle = renderable.style.fill || "black";
    this.context.strokeStyle = renderable.style.stroke || "black";
    this.context.lineWidth = renderable.style.lineWidth || 1;
    this.context.textAlign = renderable.style.align || "center";
    this.context.strokeText(renderable.text, 0, 0);
    this.context.fillText(renderable.text, 0, 0);
  }

  public d_render(renderable: Renderable, clear: boolean = true) {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    if (renderable.alpha && renderable.alpha <= 0) {
      return;
    }

    if (renderable.visible === false) {
      console.log("not visible");
      return;
    }

    this.context.save();

    if (renderable.alpha && renderable.alpha < 1) {
      this.context.globalAlpha = renderable.alpha;
    }

    if (renderable.position) {
      this.context.translate(
        Math.round(renderable.position.x),
        Math.round(renderable.position.y)
      );
    }

    if (renderable.anchor) {
      if (renderable.anchor.x !== 0 || renderable.anchor.y !== 0) {
        this.context.translate(renderable.anchor.x, renderable.anchor.y);
      }
    }

    if (renderable.scale) {
      if (renderable.scale.x !== 1 || renderable.scale.y !== 1) {
        this.context.scale(renderable.scale.x, renderable.scale.y);
      }
    }

    if (renderable.angle) {
      const { x: px, y: py } = renderable.pivot || { x: 0, y: 0 };
      this.context.translate(px, py);
      this.context.rotate(renderable.angle);
      this.context.translate(-px, -py);
    }

    // here draws the entity
    if ("type" in renderable && renderable.type === "Rect") {
      this._drawRect(renderable as RenderableRect);
    }

    if ("type" in renderable && renderable.type === "Image") {
      this._drawImage(renderable as RenderableImage);
    }

    if ("type" in renderable && renderable.type === "Text") {
      // this._drawText(renderable as RenderableText);
    }

    this.context.restore();
  }
}

export default Renderer;
