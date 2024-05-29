import { System } from "../x";
import { Container } from "../x";
import { Transform } from "../xcomponents/Transform";
import { Size } from "../xcomponents/Size";
import { Radius } from "../xcomponents/Radius";
import { ShapeStyle } from "../xcomponents/Style";

export class RenderSystem extends System {
  private _container: Container;
  private _context: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D, container: Container) {
    super();
    this._context = context;
    this._container = container;
  }

  update() {
    this._context.clearRect(
      0,
      0,
      this._context.canvas.width,
      this._context.canvas.height
    );

    this._container.forEach((entity) => {
      // rect entity
      if (entity.hasAll(["Transform", "Size", "ShapeStyle"])) {
        const { position } = entity.getComponent("Transform") as Transform;
        const { width, height } = entity.getComponent("Size") as Size;
        const { fill, stroke } = entity.getComponent(
          "ShapeStyle"
        ) as ShapeStyle;
        this._context.fillStyle = fill;
        this._context.strokeStyle = stroke;
        this._context.fillRect(position.x, position.y, width, height);
        return;
      }

      // circle entity
      if (entity.hasAll(["Transform", "Radius", "ShapeStyle"])) {
        const { position } = entity.getComponent("Transform") as Transform;
        const { radius } = entity.getComponent("Radius") as Radius;
        const { fill, stroke } = entity.getComponent(
          "ShapeStyle"
        ) as ShapeStyle;
        this._context.fillStyle = fill;
        this._context.strokeStyle = stroke;
        this._context.beginPath();
        this._context.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
        this._context.closePath();
        this._context.fill();
        this._context.stroke();
        return;
      }
    });
  }
}
