// import { Vector } from "./cluster";
// import { Engine } from "./cluster/engine/Engine";

// type Entity = number;
// class EntityManager {
//   private _nextEntityId: number = 0;
//   private _entities: Set<Entity> = new Set();

//   create: () => Entity = () => {
//     const entity = this._nextEntityId++;
//     this._entities.add(entity);
//     return entity;
//   };

//   delete: (entity: Entity) => void = (entity) => {
//     this._entities.delete(entity);
//   };

//   has: (entity: Entity) => boolean = (entity) => {
//     return this._entities.has(entity);
//   };
// }

// interface IComponent {
//   entity: Entity;
// }
// class TransformComponent implements IComponent {
//   entity: Entity;
//   position: Vector;
//   scale: Vector;
//   constructor(
//     entity: Entity,
//     position = new Vector(0, 0),
//     scale = new Vector(1, 1)
//   ) {
//     this.entity = entity;
//     this.position = position;
//     this.scale = scale;
//   }
// }
// class SizeComponent implements IComponent {
//   entity: Entity;
//   width: number;
//   height: number;
//   constructor(entity: Entity, width = 100, height = 100) {
//     this.entity = entity;
//     this.width = width;
//     this.height = height;
//   }
// }
// class PhysicsComponent implements IComponent {
//   entity: Entity;
//   velocity: Vector;
//   acceleration: Vector;
//   mass: number;
//   constructor(
//     entity: Entity,
//     velocity = new Vector(0, 0),
//     acceleration = new Vector(0, 0),
//     mass = 1
//   ) {
//     this.entity = entity;
//     this.velocity = velocity;
//     this.acceleration = acceleration;
//     this.mass = mass;
//   }
// }
// class ComponentManager<T extends IComponent> {
//   private _components: Map<Entity, T> = new Map();

//   add: (component: T) => void = (component) => {
//     this._components.set(component.entity, component);
//   };

//   get: (entity: Entity) => T | undefined = (entity) => {
//     return this._components.get(entity);
//   };

//   getAll: () => T[] = () => {
//     return Array.from(this._components.values());
//   };

//   delete: (entity: Entity) => void = (entity) => {
//     this._components.delete(entity);
//   };
// }

// interface ISystem {
//   update: (delta: number, t?: number) => void;
// }
// class PhysicsSystem implements ISystem {
//   private _entities: EntityManager;
//   private _physics: ComponentManager<PhysicsComponent>;
//   private _transforms: ComponentManager<TransformComponent>;

//   constructor(
//     entities: EntityManager,
//     physics: ComponentManager<PhysicsComponent>,
//     transforms: ComponentManager<TransformComponent>
//   ) {
//     this._entities = entities;
//     this._physics = physics;
//     this._transforms = transforms;
//   }

//   update: (delta: number, t?: number) => void = (delta, t) => {
//     for (const physics of this._physics.getAll()) {
//       const transform = this._transforms.get(physics.entity);
//       if (transform) {
//         physics.velocity.x += physics.acceleration.x * delta;
//         physics.velocity.y += physics.acceleration.y * delta;
//         transform.position.x += physics.velocity.x * delta;
//         transform.position.y += physics.velocity.y * delta;
//       }
//     }
//   };
// }
// class RenderingSystem implements ISystem {
//   private _entities: EntityManager;
//   private _transforms: ComponentManager<TransformComponent>;
//   private _sizes: ComponentManager<SizeComponent>;
//   context: CanvasRenderingContext2D;
//   height: number;
//   width: number;
//   view: HTMLCanvasElement;

//   constructor(
//     entities: EntityManager,
//     transforms: ComponentManager<TransformComponent>,
//     sizes: ComponentManager<SizeComponent>
//   ) {
//     this._entities = entities;
//     this._transforms = transforms;
//     this._sizes = sizes;

//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");

//     if (!context) throw new Error("Failed to get 2D context");

//     const width = 832;
//     const height = 640;
//     let appElement = document.querySelector("#app") as HTMLElement;
//     canvas.width = width;
//     canvas.height = height;
//     appElement.appendChild(canvas);

//     this.context = context;
//     this.height = height;
//     this.width = width;
//     this.view = canvas;

//     this.context.textBaseline = "top";
//     this.context.imageSmoothingEnabled = false;
//   }

//   update: (delta: number, t?: number) => void = (delta, t) => {
//     for (const transform of this._transforms.getAll()) {
//       const size = this._sizes.get(transform.entity);
//       if (size) {
//         this.context.fillStyle = "black";
//         this.context.fillRect(
//           transform.position.x,
//           transform.position.y,
//           size.width,
//           size.height
//         );
//       }
//     }
//   };
// }

// // GAME
// // const entities = new EntityManager();
// // const transforms = new ComponentManager<TransformComponent>();
// // const sizes = new ComponentManager<SizeComponent>();
// // const physics = new ComponentManager<PhysicsComponent>();
// // const physicsSystem = new PhysicsSystem(entities, physics, transforms);
// // const renderingSystem = new RenderingSystem(entities, transforms, sizes);

// class Game {
//   engine = new Engine();
//   entityContainer = new EntityManager();
//   transforms = new ComponentManager<TransformComponent>();
//   sizes = new ComponentManager<SizeComponent>();
//   physics = new ComponentManager<PhysicsComponent>();
//   physicsSystem = new PhysicsSystem(
//     this.entityContainer,
//     this.physics,
//     this.transforms
//   );
//   renderingSystem = new RenderingSystem(
//     this.entityContainer,
//     this.transforms,
//     this.sizes
//   );

//   addEntity() {
//     const entity = this.entityContainer.create();
//     this.transforms.add(new TransformComponent(entity));
//     this.sizes.add(new SizeComponent(entity));
//     this.physics.add(new PhysicsComponent(entity));
//     return entity;
//   }

//   start() {
//     this.engine.update = (delta: number, t?: number) => {
//       this.physicsSystem.update(delta, t);
//     };
//     this.engine.render = () => {
//       this.renderingSystem.update(0);
//     };
//     this.engine.start();
//   }
// }

export default () => {
  // const game = new Game();
  // game.addEntity();
  // game.start();
};
