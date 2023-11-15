import Container from "../core/Container";
import { Entity } from "../core/Entity";
import { CanvasCircle, CanvasRect } from "../core/Shape";
import CanvasText from "../core/Text";

const DEFAULTS = {
  strokeStyle: "transparent",
  lineWidth: 1,
  fillStyle: "#68c3d4",
  // textAlign: "center",
  font: '10px "Press Start 2P"',
};

interface CanvasRendererOptions {
  height?: number;
  width?: number;
}

class Renderer {
  readonly height: number;
  readonly width: number;
  readonly view: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;

  constructor({ height = 640, width = 832 }: CanvasRendererOptions = {}) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get 2D context");
    }

    this.context = context;
    this.height = canvas.height = height;
    this.width = canvas.width = width;
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

  private _renderRecursive(container: Container) {
    if (!container.visible) {
      return;
    }

    if (container.alpha <= 0) {
      return;
    } else {
      this.context.save();
      this.context.globalAlpha = container.alpha;
    }

    container.foreach((child) => {
      if (!child.visible || child.alpha <= 0) {
        return;
      }

      if (
        child instanceof Entity &&
        (child.position.x + child.width < 0 ||
          child.position.x > this.width ||
          child.position.y + child.height < 0 ||
          child.position.y > this.height)
      ) {
        return;
      }

      this.context.save();

      if (child.alpha) {
        this.context.globalAlpha = child.alpha;
      }

      if (child.position) {
        this.context.translate(
          Math.round(child.position.x),
          Math.round(child.position.y)
        );
      }

      if (child instanceof Entity && child.anchor) {
        this.context.translate(child.anchor.x, child.anchor.y);
      }

      if (child instanceof Entity && child.scale) {
        this.context.scale(child.scale.x, child.scale.y);
      }

      if (child instanceof Entity && child.angle) {
        const { x: px, y: py } = child.pivot || { x: 0, y: 0 };
        this.context.translate(px, py);
        this.context.rotate(child.angle);
        this.context.translate(-px, -py);
      }

      // CanvasRect
      if (child instanceof CanvasRect) {
        const { style } = child;
        const { stroke, fill, lineWidth } = style;
        const { width, height } = child;
        this.context.fillStyle = fill || DEFAULTS.fillStyle;
        this.context.lineWidth = lineWidth || DEFAULTS.lineWidth;
        this.context.strokeStyle = stroke || DEFAULTS.strokeStyle;
        this.context.beginPath();
        this.context.rect(0, 0, width, height);
        this.context.stroke();
        this.context.fill();
      }

      // CanvasCircle
      if (child instanceof CanvasCircle) {
        const { style } = child;
        const { stroke, fill, lineWidth } = style;
        const { radius } = child;
        this.context.fillStyle = fill || DEFAULTS.fillStyle;
        this.context.lineWidth = lineWidth || DEFAULTS.lineWidth;
        this.context.strokeStyle = stroke || DEFAULTS.strokeStyle;

        this.context.beginPath();
        this.context.arc(0, 0, radius, 0, Math.PI * 2);
        this.context.stroke();
        this.context.fill();
      }

      if (child instanceof CanvasText) {
        const { text, style } = child;
        const { fill, font, align } = style;
        this.context.font = font || DEFAULTS.font;
        this.context.fillStyle = fill || DEFAULTS.fillStyle;
        this.context.textAlign = align || "left";
        this.context.fillText(text, 0, 0);
      }

      if (child instanceof Container) {
        this._renderRecursive(child);
      }

      this.context.restore();
    });

    if (container.alpha) {
      this.context.restore();
    }
  }

  public render(container: Container, clear: boolean = true) {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }
    this._renderRecursive(container);
  }
}

export default Renderer;
