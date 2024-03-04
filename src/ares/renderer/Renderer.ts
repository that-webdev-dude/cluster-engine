/**
 * that.webdev.dude - 2024
 */

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

    // const devicePixelRatio = window.devicePixelRatio || 1;
    // canvas.width = width * devicePixelRatio;
    // canvas.height = height * devicePixelRatio;
    // canvas.style.width = `${width}px`;
    // canvas.style.height = `${height}px`;
    // context.scale(devicePixelRatio, devicePixelRatio);

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
    // This is a hack to prevent rendering of entities that are outside the viewport
    // This is not a good solution because it will not work for games with world size bigger that camera size
    // if ("width" in child && "height" in child) {
    //   const { width, height } = child as EntityType & {
    //     width: number;
    //     height: number;
    //   };
    //   if (
    //     child.position.x + width < 0 ||
    //     child.position.x > this.width ||
    //     child.position.y + height < 0 ||
    //     child.position.y > this.height
    //   ) {
    //     return;
    //   }
    // }

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
}

export default Renderer;
