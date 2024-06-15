import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Cmath } from "../../tools/Cmath";
import { Components } from "../index";

enum RenderErrors {
  NoContext = "[RenderSystem] Canvas context not available.",
  NoEntities = "[RenderSystem] No entities to render.",
}

export class RenderSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;
  }

  private _isVisible(entity: Entity): boolean {
    const visibility = entity.getComponent(Components.Visibility);
    return visibility ? visibility.visible && visibility.opacity > 0 : true;
  }

  private _applyTransformations(
    context: CanvasRenderingContext2D,
    entity: Entity
  ) {
    const transform = entity.getComponent(Components.Transform);
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
    const size = entity.getComponent(Components.Size);
    const colour = entity.getComponent(Components.Colour);
    const radius = entity.getComponent(Components.Radius);
    const texture = entity.getComponent(Components.Texture);
    const text = entity.getComponent(Components.Text);

    if (size && colour) {
      context.fillStyle = colour.fill;
      context.strokeStyle = colour.stroke;
      context.fillRect(0, 0, size.width, size.height);
      context.strokeRect(0, 0, size.width, size.height);
    } else if (radius && colour) {
      context.fillStyle = colour.fill;
      context.strokeStyle = colour.stroke;
      context.beginPath();
      context.arc(0, 0, radius.radius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    } else if (text && colour) {
      context.fillStyle = colour.fill;
      context.font = text.font;
      context.textAlign = text.align;
      context.fillText(text.string, 0, 0);
    } else if (texture) {
      context.drawImage(texture.image, 0, 0);
    }
  }

  update(): void {
    const context = document.querySelector("canvas")?.getContext("2d");
    if (!context) {
      console.warn(RenderErrors.NoContext);
      return;
    }

    if (!this._entities.size) {
      console.warn(RenderErrors.NoEntities);
      return;
    }

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    this._entities.forEach((entity) => {
      if (!this._isVisible(entity)) return;

      context.save();

      const visibility = entity.getComponent(Components.Visibility);
      if (visibility) {
        context.globalAlpha = visibility.opacity;
      }

      this._applyTransformations(context, entity);
      this._drawEntity(context, entity);

      context.restore();
    });
  }
}
