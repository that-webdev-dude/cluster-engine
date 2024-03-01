/**
 * that.webdev.dude - 2024
 */
import { Rect } from "../core/Shape";
import { EntityType, ContainerType } from "../types";

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
    if ("render" in child && child.render) {
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

      if ("render" in child && child.render) {
        child.render(this.context);
      }

      this.context.restore();
    }
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
      // child is an array of ContainerType
      if ("children" in child) {
        this._renderRecursive(child as ContainerType);
      }

      // child is a EntityType
      this._render(child as EntityType);
    });

    this.context.restore();
  }

  public render(item: ContainerType | EntityType, clear: boolean = true) {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    if ("children" in item) {
      this._renderRecursive(item as ContainerType);
    }

    this._render(item as EntityType);
  }
}

export default Renderer;
