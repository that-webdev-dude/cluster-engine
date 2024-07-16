import { Container, Entity, System, Cmath } from "../cluster";
import { Transform } from "../components/Transform";
import { Text } from "../components/Text";
import { Size } from "../components/Size";
import { Colour } from "../components/Colour";
import { Texture } from "../components/Texture";
import { Visibility } from "../components/Visibility";

// system dependencies
const SystemComponents = {
  Transform,
  Text,
  Size,
  Colour,
  Texture,
  Visibility,
};

// system errors
enum SystemErrors {
  NoContext = "[RenderSystem] Canvas context not available.",
  NoEntities = "[RenderSystem] No entities to render.",
}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

export class RenderSystem extends System {
  private _getContext(): CanvasRenderingContext2D {
    const context = document.querySelector("canvas")?.getContext("2d");
    if (!context) {
      throw new Error(SystemErrors.NoContext);
    }
    return context;
  }

  private _isVisible(entity: Entity): boolean {
    const visibility = entity.getComponent(SystemComponents.Visibility);
    return visibility ? visibility.visible && visibility.opacity > 0 : true;
  }

  private _applyTransform(context: CanvasRenderingContext2D, entity: Entity) {
    const transform = entity.getComponent(SystemComponents.Transform);
    if (transform) {
      context.translate(
        Math.round(transform.position.x),
        Math.round(transform.position.y)
      );
      context.translate(
        Math.round(transform.anchor.x),
        Math.round(transform.anchor.y)
      );
      context.scale(transform.scale.x, transform.scale.y);
      if (transform.angle !== 0) {
        context.translate(transform.pivot.x, transform.pivot.y);
        context.rotate(Cmath.deg2rad(transform.angle));
        context.translate(-transform.pivot.x, -transform.pivot.y);
      }
    }
  }

  private _drawEntity(context: CanvasRenderingContext2D, entity: Entity) {
    const size = entity.getComponent(SystemComponents.Size);
    const colour = entity.getComponent(SystemComponents.Colour);
    const texture = entity.getComponent(SystemComponents.Texture);
    const text = entity.getComponent(SystemComponents.Text);

    if (size && colour) {
      context.fillStyle = colour.fill;
      context.strokeStyle = colour.stroke;
      context.fillRect(0, 0, size.width, size.height);
      context.strokeRect(0, 0, size.width, size.height);
    } else if (text && colour) {
      context.fillStyle = colour.fill;
      context.font = text.font;
      context.textAlign = text.align;
      context.fillText(text.string, 0, 0);
    } else if (texture) {
      context.drawImage(texture.image, 0, 0);
    }
  }

  update(entities: Container<Entity>): void {
    const context = this._getContext();

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if (!entities.size) return;

    SystemCache.entities = entities.filter(
      (entity) =>
        entity.hasComponent(SystemComponents.Transform) &&
        (entity.hasComponent(SystemComponents.Size) ||
          entity.hasComponent(SystemComponents.Text) ||
          entity.hasComponent(SystemComponents.Texture))
    );
    if (!SystemCache.entities.size) return;

    SystemCache.entities.forEach((entity) => {
      if (!this._isVisible(entity)) return;

      context.save();

      const visibility = entity.getComponent(SystemComponents.Visibility);
      if (visibility) {
        context.globalAlpha = visibility.opacity;
      }

      this._applyTransform(context, entity);
      this._drawEntity(context, entity);

      context.restore();
    });

    SystemCache.entities.clear();
  }
}
