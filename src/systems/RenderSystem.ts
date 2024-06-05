/**
 * @File RenderSystem.ts
 * @Description This file contains the RenderSystem class, which is responsible for rendering entities on a canvas.
 * @Author @that.webdev.dude
 * @Year 2024
 */

import { Entity, System, Cmath, Vector } from "../cluster";
import { Container } from "../cluster";
import { Transform } from "../components/Transform";
import { Size } from "../components/Size";
import { Alpha } from "../components/Alpha";
import { Radius } from "../components/Radius";
import { Message } from "../components/Message";
import { Visibility } from "../components/Visibility";
import { ShapeStyle } from "../components/Style";
import { TextStyle } from "../components/Style";

/**
 * The RenderSystem class is responsible for rendering entities on a canvas.
 */
export class RenderSystem extends System {
  /**
   * Checks if an entity is visible.
   * @param entity - The entity to check.
   * @returns True if the entity is visible, false otherwise.
   */
  private _isVisible(entity: Entity): boolean {
    const visibility = entity.getComponent("Visibility") as Visibility;
    return visibility ? visibility.visible : true;
  }

  /**
   * Checks if an entity is transparent.
   * @param entity - The entity to check.
   * @returns True if the entity is transparent, false otherwise.
   */
  private _isTransparent(entity: Entity): boolean {
    const alpha = entity.getComponent("Alpha") as Alpha;
    return alpha ? alpha.alpha === 0 : false;
  }

  /**
   * Sets the alpha value for the canvas rendering context.
   * @param context - The canvas rendering context.
   * @param entity - The entity to set the alpha for.
   */
  private _setAlpha(context: CanvasRenderingContext2D, entity: Entity) {
    const alpha = entity.getComponent("Alpha") as Alpha;
    if (alpha) {
      context.globalAlpha = alpha.alpha;
    }
  }

  /**
   * Sets the position transform for the canvas rendering context.
   * @param context - The canvas rendering context.
   * @param position - The position vector.
   */
  private _setTransformPosition(
    context: CanvasRenderingContext2D,
    position: Vector
  ) {
    if (position.x !== 0 || position.y !== 0) {
      context.translate(Math.round(position.x), Math.round(position.y));
    }
  }

  /**
   * Sets the anchor transform for the canvas rendering context.
   * @param context - The canvas rendering context.
   * @param anchor - The anchor vector.
   */
  private _setTransformAnchor(
    context: CanvasRenderingContext2D,
    anchor: Vector
  ) {
    if (anchor.x !== 0 || anchor.y !== 0) {
      context.translate(Math.round(anchor.x), Math.round(anchor.y));
    }
  }

  /**
   * Sets the scale transform for the canvas rendering context.
   * @param context - The canvas rendering context.
   * @param scale - The scale vector.
   */
  private _setTransformScale(context: CanvasRenderingContext2D, scale: Vector) {
    if (scale.x !== 1 || scale.y !== 1) {
      context.scale(scale.x, scale.y);
    }
  }

  /**
   * Sets the angle transform for the canvas rendering context.
   * @param context - The canvas rendering context.
   * @param pivot - The pivot vector.
   * @param angle - The angle in degrees.
   */
  private _setTransformAngle(
    context: CanvasRenderingContext2D,
    pivot: Vector,
    angle: number
  ) {
    if (angle !== 0) {
      context.translate(pivot.x, pivot.y);
      context.rotate(Cmath.deg2rad(angle));
      context.translate(-pivot.x, -pivot.y);
    }
  }

  /**
   * Sets the transform for the canvas rendering context based on the entity's Transform component.
   * @param context - The canvas rendering context.
   * @param entity - The entity to set the transform for.
   */
  private _setTransform(context: CanvasRenderingContext2D, entity: Entity) {
    const transform = entity.getComponent("Transform") as Transform;
    if (transform) {
      this._setTransformPosition(context, transform.position);
      this._setTransformAnchor(context, transform.anchor);
      this._setTransformScale(context, transform.scale);
      this._setTransformAngle(context, transform.pivot, transform.angle);
    }
  }

  /**
   * Draws a rectangle on the canvas rendering context based on the entity's Size and ShapeStyle components.
   * @param context - The canvas rendering context.
   * @param entity - The entity to draw the rectangle for.
   */
  private _drawRect(context: CanvasRenderingContext2D, entity: Entity) {
    const size = entity.getComponent("Size") as Size;
    const style = entity.getComponent("ShapeStyle") as ShapeStyle;
    context.fillStyle = style.fill;
    context.strokeStyle = style.stroke;
    context.fillRect(0, 0, size.width, size.height);
    context.strokeRect(0, 0, size.width, size.height);
  }

  /**
   * Draws a circle on the canvas rendering context based on the entity's Radius and ShapeStyle components.
   * @param context - The canvas rendering context.
   * @param entity - The entity to draw the circle for.
   */
  private _drawCircle(context: CanvasRenderingContext2D, entity: Entity) {
    const radius = entity.getComponent("Radius") as Radius;
    const style = entity.getComponent("ShapeStyle") as ShapeStyle;
    context.fillStyle = style.fill;
    context.strokeStyle = style.stroke;
    context.beginPath();
    context.arc(0, 0, radius.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  /**
   * Draws text on the canvas rendering context based on the entity's Message and TextStyle components.
   * @param context - The canvas rendering context.
   * @param entity - The entity to draw the text for.
   */
  private _drawText(context: CanvasRenderingContext2D, entity: Entity) {
    const message = entity.getComponent("Message") as Message;
    const style = entity.getComponent("TextStyle") as TextStyle;
    context.font = style.font;
    context.fillStyle = style.fill;
    context.strokeStyle = style.stroke;
    context.fillText(message.text, 0, 0);
    context.strokeText(message.text, 0, 0);
  }

  /**
   * Updates the render system by rendering entities on the canvas.
   * @param entities - The collection of entities to render.
   */
  update(entities: Container<Entity>): void {
    const context = document.querySelector("canvas")?.getContext("2d");
    if (!context) {
      return;
    } else {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      entities.forEach((entity) => {
        if (!this._isVisible(entity) || this._isTransparent(entity)) return;

        context.save();
        this._setAlpha(context, entity);
        this._setTransform(context, entity);

        if (entity.hasAll(["Transform", "Size", "ShapeStyle"])) {
          this._drawRect(context, entity);
        }
        if (entity.hasAll(["Transform", "Radius", "ShapeStyle"])) {
          this._drawCircle(context, entity);
        }
        if (entity.hasAll(["Transform", "Message", "TextStyle"])) {
          this._drawText(context, entity);
        }
        context.restore();
      });
    }
  }
}
