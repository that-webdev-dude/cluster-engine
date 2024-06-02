import { Entity, System } from "../cluster";
import { Container } from "../cluster";
import { Transform } from "../components/Transform";
import { Size } from "../components/Size";
import { Radius } from "../components/Radius";
import { ShapeStyle } from "../components/Style";

export class RenderSystem extends System {
  update(entities: Container<Entity>): void {
    const context = document.querySelector("canvas")?.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    entities.forEach((entity) => {
      // rect entity
      if (entity.hasAll(["Transform", "Size", "ShapeStyle"])) {
        const { position } = entity.getComponent("Transform") as Transform;
        const { width, height } = entity.getComponent("Size") as Size;
        const { fill, stroke } = entity.getComponent(
          "ShapeStyle"
        ) as ShapeStyle;

        context.fillStyle = fill;
        context.strokeStyle = stroke;
        context.fillRect(position.x, position.y, width, height);
        return;
      }
    });
  }
}
