import { IEntity, IEntityContainer } from "../types";

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

  private _render(child: IEntity) {
    if ("render" in child && child.render) {
      if (child.alpha <= 0) {
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

      child.render(this.context);

      this.context.restore();
    }
  }

  private _renderRecursive(container: IEntityContainer) {
    if (container.size === 0) return;

    this.context.save();

    if (container.position.x !== 0 || container.position.y !== 0) {
      this.context.translate(
        Math.round(container.position.x),
        Math.round(container.position.y)
      );
    }

    container.children.forEach((child: IEntity | IEntityContainer) => {
      // child is an array of IEntityContainer
      if ("children" in child) {
        this._renderRecursive(child as IEntityContainer);
      }

      // child is a IEntity
      this._render(child as IEntity);
    });

    this.context.restore();
  }

  public render(item: IEntityContainer | IEntity, clear: boolean = true) {
    if (clear) {
      this.context.clearRect(0, 0, this.width, this.height);
    }

    if ("children" in item) {
      this._renderRecursive(item as IEntityContainer);
    } else {
      this._render(item as IEntity);
    }
  }
}

export default Renderer;
