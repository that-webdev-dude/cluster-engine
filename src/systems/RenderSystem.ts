import { Container, Entity, System, Cmath } from "../cluster";
import { Transform } from "../components/Transform";
import { Text } from "../components/Text";
import { Size } from "../components/Size";
import { Colour } from "../components/Colour";
import { Texture } from "../components/Texture";
import { Visibility } from "../components/Visibility";
import { Renderer } from "../components/Renderer";

// system dependencies
const SystemComponents = {
  Transform,
  Text,
  Size,
  Colour,
  Texture,
  Visibility,
  Renderer,
};

// system errors
enum SystemErrors {
  NoContext = "[RenderSystem Error] Canvas context not available.",
  NoEntities = "[RenderSystem Error] No entities to render.",
}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
  output: null as CanvasRenderingContext2D | null,
  layers: new Map<number, OffscreenCanvasRenderingContext2D>(),
};

/**
 * RenderSystem
 * @components Transform, Size, Colour, Texture, Text, Visibility, Renderer
 */
export class RenderSystem extends System {
  private _getContext(): CanvasRenderingContext2D {
    if (!SystemCache.output) {
      const context = document.querySelector("canvas")?.getContext("2d");
      if (!context) {
        throw new Error(SystemErrors.NoContext);
      }
      SystemCache.output = context;
    }
    return SystemCache.output;
  }

  private _getLayerContext(layer: number): OffscreenCanvasRenderingContext2D {
    if (!SystemCache.layers.has(layer)) {
      const outputContext = this._getContext();
      const offscreenCanvas = new OffscreenCanvas(
        outputContext.canvas.width,
        outputContext.canvas.height
      );
      const offscreenContext = offscreenCanvas.getContext(
        "2d"
      ) as OffscreenCanvasRenderingContext2D;
      SystemCache.layers.set(layer, offscreenContext);
    }
    return SystemCache.layers.get(layer) as OffscreenCanvasRenderingContext2D;
  }

  private _isVisible(entity: Entity): boolean {
    const visibility = entity.getComponent(SystemComponents.Visibility);
    return visibility ? visibility.visible && visibility.opacity > 0 : true;
  }

  private _applyTransform(
    context: OffscreenCanvasRenderingContext2D,
    entity: Entity
  ) {
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

  private _drawEntity(
    context: OffscreenCanvasRenderingContext2D,
    entity: Entity
  ) {
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
    if (!entities.size) return;

    const outputContext = this._getContext();

    // Clear the main canvas
    outputContext.clearRect(
      0,
      0,
      outputContext.canvas.width,
      outputContext.canvas.height
    );

    // Filter entities that have necessary components
    SystemCache.entities = entities.filter(
      (entity) =>
        entity.hasComponent(SystemComponents.Transform) &&
        (entity.hasComponent(SystemComponents.Size) ||
          entity.hasComponent(SystemComponents.Text) ||
          entity.hasComponent(SystemComponents.Texture))
    );
    if (!SystemCache.entities.size) return;

    // Clear all layers
    SystemCache.layers.forEach((context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });

    // Render each entity to its corresponding layer
    SystemCache.entities.forEach((entity) => {
      if (!this._isVisible(entity)) return;

      const renderer = entity.getComponent(SystemComponents.Renderer);
      const layer = renderer ? renderer.layer : 0; // Default layer ID 0 for entities without Renderer component
      const layerContext = this._getLayerContext(layer);

      layerContext.save();

      const visibility = entity.getComponent(SystemComponents.Visibility);
      if (visibility) {
        layerContext.globalAlpha = visibility.opacity;
      }

      this._applyTransform(layerContext, entity);
      this._drawEntity(layerContext, entity);

      layerContext.restore();
    });

    // Composite all layers onto the main canvas
    const sortedLayerIds = Array.from(SystemCache.layers.keys()).sort(
      (a, b) => a - b
    );
    sortedLayerIds.forEach((layer) => {
      const layerContext = SystemCache.layers.get(layer);
      if (layerContext) {
        outputContext.drawImage(layerContext.canvas, 0, 0);
      }
    });

    // Clear the entities cache
    SystemCache.entities.clear();
  }
}

// import { Container, Entity, System, Cmath } from "../cluster";
// import { Transform } from "../components/Transform";
// import { Text } from "../components/Text";
// import { Size } from "../components/Size";
// import { Colour } from "../components/Colour";
// import { Texture } from "../components/Texture";
// import { Visibility } from "../components/Visibility";

// // system dependencies
// const SystemComponents = {
//   Transform,
//   Text,
//   Size,
//   Colour,
//   Texture,
//   Visibility,
// };

// // system errors
// enum SystemErrors {
//   NoContext = "[RenderSystem Error] Canvas context not available.",
//   NoEntities = "[RenderSystem Error] No entities to render.",
// }

// // system cache
// let SystemCache = {
//   entities: new Container<Entity>(),
//   output: null as CanvasRenderingContext2D | null,
//   buffer: null as OffscreenCanvasRenderingContext2D | null,
// };

// /**
//  * RenderSystem
//  * @components Transform, Size, Colour, Texture, Text, Visibility
//  */
// export class RenderSystem extends System {
//   private _getContext(): OffscreenCanvasRenderingContext2D {
//     if (!SystemCache.output) {
//       const context = document.querySelector("canvas")?.getContext("2d");
//       if (!context) {
//         throw new Error(SystemErrors.NoContext);
//       }
//       SystemCache.output = context;

//       SystemCache.buffer = new OffscreenCanvas(
//         SystemCache.output.canvas.width,
//         SystemCache.output.canvas.height
//       ).getContext("2d") as OffscreenCanvasRenderingContext2D;
//     }
//     return SystemCache.buffer as OffscreenCanvasRenderingContext2D;
//   }

//   private _isVisible(entity: Entity): boolean {
//     const visibility = entity.getComponent(SystemComponents.Visibility);
//     return visibility ? visibility.visible && visibility.opacity > 0 : true;
//   }

//   private _applyTransform(
//     context: OffscreenCanvasRenderingContext2D,
//     entity: Entity
//   ) {
//     const transform = entity.getComponent(SystemComponents.Transform);
//     if (transform) {
//       context.translate(
//         Math.round(transform.position.x),
//         Math.round(transform.position.y)
//       );
//       context.translate(
//         Math.round(transform.anchor.x),
//         Math.round(transform.anchor.y)
//       );
//       context.scale(transform.scale.x, transform.scale.y);
//       if (transform.angle !== 0) {
//         context.translate(transform.pivot.x, transform.pivot.y);
//         context.rotate(Cmath.deg2rad(transform.angle));
//         context.translate(-transform.pivot.x, -transform.pivot.y);
//       }
//     }
//   }

//   private _drawEntity(
//     context: OffscreenCanvasRenderingContext2D,
//     entity: Entity
//   ) {
//     const size = entity.getComponent(SystemComponents.Size);
//     const colour = entity.getComponent(SystemComponents.Colour);
//     const texture = entity.getComponent(SystemComponents.Texture);
//     const text = entity.getComponent(SystemComponents.Text);

//     if (size && colour) {
//       context.fillStyle = colour.fill;
//       context.strokeStyle = colour.stroke;
//       context.fillRect(0, 0, size.width, size.height);
//       context.strokeRect(0, 0, size.width, size.height);
//     } else if (text && colour) {
//       context.fillStyle = colour.fill;
//       context.font = text.font;
//       context.textAlign = text.align;
//       context.fillText(text.string, 0, 0);
//     } else if (texture) {
//       context.drawImage(texture.image, 0, 0);
//     }
//   }

//   update(entities: Container<Entity>): void {
//     const context = this._getContext();

//     context.clearRect(0, 0, context.canvas.width, context.canvas.height);

//     if (!entities.size) return;

//     SystemCache.entities = entities.filter(
//       (entity) =>
//         entity.hasComponent(SystemComponents.Transform) &&
//         (entity.hasComponent(SystemComponents.Size) ||
//           entity.hasComponent(SystemComponents.Text) ||
//           entity.hasComponent(SystemComponents.Texture))
//     );
//     if (!SystemCache.entities.size) return;

//     SystemCache.entities.forEach((entity) => {
//       if (!this._isVisible(entity)) return;

//       context.save();

//       const visibility = entity.getComponent(SystemComponents.Visibility);
//       if (visibility) {
//         context.globalAlpha = visibility.opacity;
//       }

//       this._applyTransform(context, entity);
//       this._drawEntity(context, entity);

//       context.restore();
//     });

//     SystemCache.output?.drawImage(context.canvas, 0, 0);

//     SystemCache.entities.clear();
//   }
// }
