import * as Cluster from "../../cluster";
import * as Components from "../components";

/**
 * Renderer system
 * @required Transform, Zindex
 * @supports Alpha, Texture, Sprite, Rect, Text
 * @emits systemStarted, systemUpdated, systemError
 */
export class RendererSystem extends Cluster.System {
  private _buffers: Map<number, OffscreenCanvasRenderingContext2D> | null =
    null;
  private _context: CanvasRenderingContext2D | null = null;

  constructor() {
    super(["Transform", "Zindex"]);

    const canvas = document.querySelector("canvas");
    if (!canvas) throw new Error("[Renderer Error] No canvas element found");

    this._context = canvas.getContext("2d");
    this._buffers = new Map();
  }

  private _clear() {
    this._buffers?.forEach((context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });
    this._context?.clearRect(
      0,
      0,
      this._context.canvas.width,
      this._context.canvas.height
    );
  }

  private _createNewBuffer(zindex: number): OffscreenCanvasRenderingContext2D {
    const offscreenCanvas = new OffscreenCanvas(
      this._context!.canvas.width,
      this._context!.canvas.height
    );
    const context = offscreenCanvas.getContext("2d")!;
    this._buffers?.set(zindex, context);
    return context;
  }

  private _setGlobalAlpha(
    context: OffscreenCanvasRenderingContext2D,
    alpha: number
  ) {
    context.globalAlpha = alpha;
  }

  private _setTransform(
    context: OffscreenCanvasRenderingContext2D,
    transform: Components.TransformComponent
  ) {
    context.translate(
      Math.round(transform.position.x),
      Math.round(transform.position.y)
    );
    context.translate(
      Math.round(transform.anchor.x),
      Math.round(transform.anchor.y)
    );
    context.scale(transform.scale.x, transform.scale.y);

    context.translate(transform.pivot.x, transform.pivot.y);
    context.rotate(Cluster.Cmath.deg2rad(transform.angle));
    context.translate(-transform.pivot.x, -transform.pivot.y);
  }

  private _renderEntity(
    context: OffscreenCanvasRenderingContext2D,
    entity: Cluster.Entity
  ) {
    const texture = entity.components.get("Texture") as
      | Components.TextureComponent
      | undefined;
    const rect = entity.components.get("Rect") as
      | Components.RectComponent
      | undefined;
    const text = entity.components.get("Text") as
      | Components.TextComponent
      | undefined;
    const sprite = entity.components.get("Sprite") as
      | Components.SpriteComponent
      | undefined;

    if (texture) {
      context.drawImage(texture.image, 0, 0);
    } else if (rect) {
      context.fillStyle = rect.fill;
      context.strokeStyle = rect.stroke;
      context.fillRect(0, 0, rect.width, rect.height);
      context.strokeRect(0, 0, rect.width, rect.height);
    } else if (text) {
      context.fillStyle = text.fill;
      context.font = text.font;
      context.fillText(text.text, 0, 0);
    } else if (sprite) {
      const { x, y } = sprite.indexToCoords;
      context.drawImage(
        sprite.image,
        x,
        y,
        sprite.width,
        sprite.height,
        0,
        0,
        sprite.width,
        sprite.height
      );
    }
  }

  update(entities: Set<Cluster.Entity>) {
    if (entities.size === 0) return;

    this.emit("systemStarted");

    this._clear();

    for (let entity of entities) {
      try {
        const alpha = entity.components.get("Alpha") as
          | Components.AlphaComponent
          | undefined;
        if (alpha && alpha.alpha === 0) continue;

        const zindex = entity.components.get("Zindex") as
          | Components.ZindexComponent
          | undefined;
        if (zindex) {
          let context = this._buffers?.get(zindex.zindex);

          if (!context) context = this._createNewBuffer(zindex.zindex);

          context.save();

          if (alpha) this._setGlobalAlpha(context, alpha.alpha);
          const transform = entity.components.get("Transform") as
            | Components.TransformComponent
            | undefined;
          if (transform) this._setTransform(context, transform);

          this._renderEntity(context, entity);

          context.restore();
        }
      } catch (error) {
        this.emit("systemError", error);
      }
    }

    this._buffers?.forEach((context) => {
      this._context?.drawImage(context.canvas, 0, 0);
    });

    this.emit("systemUpdated");
  }
}
