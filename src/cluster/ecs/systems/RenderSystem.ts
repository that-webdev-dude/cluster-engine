import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Cmath } from "../../tools/Cmath";
import { Vector } from "../../tools/Vector";
import { Components } from "../index";

export class RenderSystem extends System {
  private _isVisible(entity: Entity): boolean {
    const visibility = entity.getComponent(Components.Visibility);
    return visibility ? visibility.visible : true;
  }

  private _isTransparent(entity: Entity): boolean {
    const visibility = entity.getComponent(Components.Visibility);
    return visibility ? visibility.opacity === 0 : false;
  }

  private _setOpacity(context: CanvasRenderingContext2D, entity: Entity) {
    const visibility = entity.getComponent(Components.Visibility);
    if (visibility) {
      context.globalAlpha = visibility.opacity;
    }
  }

  private _setTransformPosition(
    context: CanvasRenderingContext2D,
    entity: Entity
  ) {
    const transform = entity.getComponent(Components.Transform);
    if (transform) {
      context.translate(
        Math.round(transform.position.x),
        Math.round(transform.position.y)
      );
    }
  }

  private _setTransformAnchor(
    context: CanvasRenderingContext2D,
    entity: Entity
  ) {
    const transform = entity.getComponent(Components.Transform);
    if (transform) {
      context.translate(
        Math.round(transform.anchor.x),
        Math.round(transform.anchor.y)
      );
    }
  }

  private _setTransformScale(
    context: CanvasRenderingContext2D,
    entity: Entity
  ) {
    const transform = entity.getComponent(Components.Transform);
    if (transform) {
      context.scale(transform.scale.x, transform.scale.y);
    }
  }

  private _setTransformAngle(
    context: CanvasRenderingContext2D,
    entity: Entity
  ) {
    const transform = entity.getComponent(Components.Transform);
    if (transform) {
      if (transform.angle !== 0) {
        context.translate(transform.pivot.x, transform.pivot.y);
        context.rotate(Cmath.deg2rad(transform.angle));
        context.translate(-transform.pivot.x, -transform.pivot.y);
      }
    }
  }

  private _setTransform(context: CanvasRenderingContext2D, entity: Entity) {
    this._setTransformPosition(context, entity);
    this._setTransformAnchor(context, entity);
    this._setTransformScale(context, entity);
    this._setTransformAngle(context, entity);
  }

  private _drawRect(context: CanvasRenderingContext2D, entity: Entity) {
    const size = entity.getComponent(Components.Size);
    const colour = entity.getComponent(Components.Colour);
    if (!size || !colour) return;
    context.fillStyle = colour.fill;
    context.strokeStyle = colour.stroke;
    context.fillRect(0, 0, size.width, size.height);
    context.strokeRect(0, 0, size.width, size.height);
  }

  private _drawCircle(context: CanvasRenderingContext2D, entity: Entity) {
    const radius = entity.getComponent(Components.Radius);
    const colour = entity.getComponent(Components.Colour);
    if (!radius || !colour) return;
    context.fillStyle = colour.fill;
    context.strokeStyle = colour.stroke;
    context.beginPath();
    context.arc(0, 0, radius.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  //   private _drawText(context: CanvasRenderingContext2D, entity: Entity) {
  //     const message = entity.getComponent("Message") as Message;
  //     const style = entity.getComponent("TextStyle") as TextStyle;
  //     context.font = style.font;
  //     context.fillStyle = style.fill;
  //     context.strokeStyle = style.stroke;
  //     context.fillText(message.text, 0, 0);
  //     context.strokeText(message.text, 0, 0);
  //   }

  private _drawImage(context: CanvasRenderingContext2D, entity: Entity) {
    const texture = entity.getComponent(Components.Texture);
    if (!texture) return;
    context.drawImage(texture.image, 0, 0);
  }

  update(entities: Container<Entity>): void {
    const context = document.querySelector("canvas")?.getContext("2d");
    if (!context) {
      return;
    } else {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      entities.forEach((entity) => {
        if (!this._isVisible(entity) || this._isTransparent(entity)) return;

        context.save();

        this._setOpacity(context, entity);
        this._setTransform(context, entity);

        if (entity.hasAllComponents([Components.Size, Components.Colour])) {
          this._drawRect(context, entity);
        }

        if (entity.hasAllComponents([Components.Radius, Components.Colour])) {
          this._drawCircle(context, entity);
        }

        // if (entity.hasAll(["Message", "TextStyle"])) {
        //   this._drawText(context, entity);
        // }

        if (entity.hasAllComponents([Components.Texture])) {
          this._drawImage(context, entity);
        }

        context.restore();
      });
    }
  }
}
