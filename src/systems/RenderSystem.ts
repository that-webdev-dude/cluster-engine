// import { Container, Entity, EntityGroup, System, Cmath } from "../cluster";
// import { Transform } from "../components/Transform";
// import { Text } from "../components/Text";
// import { Size } from "../components/Size";
// import { Colour } from "../components/Colour";
// import { Texture } from "../components/Texture";
// import { Visibility } from "../components/Visibility";
// import { Renderer } from "../components/Renderer";

// // system types
// type ContextType = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

// // system dependencies
// const SystemComponents = {
//   Transform,
//   Text,
//   Size,
//   Colour,
//   Texture,
//   Visibility,
//   Renderer,
// };

// // system errors
// enum SystemErrors {
//   NoContext = "[RenderSystem Error] Canvas context not available.",
//   NoEntities = "[RenderSystem Error] No entities to render.",
// }

// // system cache
// class SystemCache {
//   static entities = new Container<Entity>();
//   static context = null as ContextType | null;
// }

// export class RenderSystem implements System {
//   private _isVisible(entity: Entity): boolean {
//     const visibility = entity.getComponent(SystemComponents.Visibility);
//     return visibility ? visibility.visible && visibility.opacity > 0 : true;
//   }

//   private _setVisibility(context: ContextType, entity: Entity) {
//     const visibility = entity.getComponent(SystemComponents.Visibility);
//     if (visibility) {
//       context.globalAlpha = visibility.opacity;
//     }
//   }

//   private _setTransform(context: ContextType, entity: Entity) {
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

//   private _render(context: ContextType, entity: Entity) {
//     if (!this._isVisible(entity)) return;

//     context.save();

//     this._setVisibility(context, entity);
//     this._setTransform(context, entity);

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

//     if (entity instanceof EntityGroup) {
//       entity.entities.forEach((entity) => {
//         this._render(context, entity);
//       });
//     }

//     context.restore();
//   }

//   requiredComponents(): string[] {
//     return [
//       "Transform",
//       "Visibility",
//       "Renderer",
//       "Size",
//       "Colour",
//       "Texture",
//       "Text",
//     ];
//   }

//   public update(entities: Container<Entity>): void {
//     if (!entities.size) return;

//     SystemCache.entities = entities.filter((entity) =>
//       entity.hasComponents(SystemComponents.Transform)
//     );
//     if (!SystemCache.entities.size) return;

//     if (!SystemCache.context) {
//       const context = document.querySelector("canvas")?.getContext("2d");
//       if (!context) {
//         throw new Error(SystemErrors.NoContext);
//       }
//       SystemCache.context = context;
//     }
//     const { context } = SystemCache;
//     context.clearRect(0, 0, context.canvas.width, context.canvas.height);

//     SystemCache.entities.forEach((entity) => {
//       this._render(context, entity);
//     });

//     SystemCache.entities.clear();
//   }
// }
