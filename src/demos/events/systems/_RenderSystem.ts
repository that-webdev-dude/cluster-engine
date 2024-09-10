import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { store } from "../store";

/** Renderer system
 * @required Transform, Zindex
 * @supports Alpha, Sprite, Rect, Text
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

    // Sort buffers by zindex
    if (this._buffers)
      this._buffers = new Map([...this._buffers].sort((a, b) => a[0] - b[0]));

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
    // sprite support
    const sprite = entity.get<Components.SpriteComponent>("Sprite");
    if (sprite) {
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

    // rect support
    const rect = entity.get<Components.RectComponent>("Rect");
    if (rect) {
      const { width, height, radius, fill, stroke } = rect;
      context.fillStyle = fill;
      context.strokeStyle = stroke;
      context.beginPath();
      context.roundRect(0, 0, width, height, radius);
      context.fill();
      context.stroke();
    }

    // text support
    const text = entity.get<Components.TextComponent>("Text");
    if (text) {
      context.font = text.font;
      context.fillStyle = text.fill;
      context.textAlign = text.align;
      context.fillText(text.text, 0, 0);
    }

    //debug
    const collision = entity.get<Components.CollisionComponent>("Collision");
    if (collision) {
      const hitbox = collision.hitbox;
      context.strokeStyle = "yellow";
      context.strokeRect(0, 0, hitbox.width, hitbox.height);
    }
  }

  update(entities: Set<Cluster.Entity>) {
    if (entities.size === 0) return;

    this._clear();

    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      const zindex =
        entity.get<Components.ZindexComponent>("Zindex")?.zindex || 0;

      let context = this._buffers?.get(zindex);
      if (!context) context = this._createNewBuffer(zindex);

      context.save();

      try {
        const alpha =
          entity.get<Components.AlphaComponent>("Alpha")?.alpha || 1;

        const transform =
          entity.get<Components.TransformComponent>("Transform")!;

        this._setGlobalAlpha(context, alpha);
        this._setTransform(context, transform);
        this._renderEntity(context, entity);
      } catch (error) {
        context.restore();
        // store.emit<Events.SystemErrorEvent>(
        //   {
        //     type: "system-error",
        //     data: {
        //       origin: this.constructor.name,
        //       error,
        //     },
        //   },
        //   true
        // );
      } finally {
        context.restore();
      }
    }

    this._buffers?.forEach((context) => {
      this._context?.drawImage(context.canvas, 0, 0);
    });
  }
}
