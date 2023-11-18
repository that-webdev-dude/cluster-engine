import Container from "../core/Container";
import { Entity } from "../core/Entity";

const DEFAULTS = {
  strokeStyle: "transparent",
  lineWidth: 1,
  fillStyle: "#68c3d4",
  textAlign: "center",
  font: '10px "Press Start 2P"',
};

type CanvasRendererOptions = {
  height?: number;
  width?: number;
};

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
    if (container.size === 0) return;

    this.context.save();

    if (container.position.magnitude !== 0) {
      this.context.translate(
        Math.round(container.position.x),
        Math.round(container.position.y)
      );
    }

    container.foreach((child) => {
      // child is another container
      if (child instanceof Container) {
        this._renderRecursive(child);
      }

      //   child is an entity
      if (child instanceof Entity && child?.render) {
        if (!child.visible || child.alpha <= 0) {
          return;
        }

        if (
          child.position.x + child.width < 0 ||
          child.position.x > this.width ||
          child.position.y + child.height < 0 ||
          child.position.y > this.height
        ) {
          return;
        }

        this.context.save();

        if (child.alpha) {
          this.context.globalAlpha = child.alpha;
        }

        if (child.position.magnitude !== 0) {
          this.context.translate(
            Math.round(child.position.x),
            Math.round(child.position.y)
          );
        }

        if (child.anchor.magnitude !== 0) {
          this.context.translate(child.anchor.x, child.anchor.y);
        }

        if (child.scale.magnitude !== 0) {
          this.context.scale(child.scale.x, child.scale.y);
        }

        if (child.angle !== 0) {
          const { x: px, y: py } = child.pivot || { x: 0, y: 0 };
          this.context.translate(px, py);
          this.context.rotate(child.angle);
          this.context.translate(-px, -py);
        }

        child.render(this.context);

        this.context.restore();
      }
    });

    this.context.restore();
  }

  public render(container: Container, clear: boolean = true) {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }
    this._renderRecursive(container);
  }
}

export default Renderer;
