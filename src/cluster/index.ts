export { Game } from "./core/Game";
export { Store } from "./core/Store";
export { Assets } from "./core/Assets";

export { Component } from "./core/ECS";
export { Entity } from "./core/ECS";
export { System } from "./core/ECS";
export { Scene } from "./core/ECS";
export { EventQueue } from "./core/ECS";

export { Keyboard } from "./input";

export { Pool } from "./tools/Pool";
export { Cmath } from "./tools/Cmath";
export { Vector } from "./tools/Vector";
export { Container } from "./tools/Container";

// enums
export enum SystemEvents {
  COMPONENT_ATTACHED = "componentAttached",
  COMPONENT_DETACHED = "componentDetached",
  ENTITY_DESTROYED = "entityDestroyed",
  ENTITY_CREATED = "entityCreated",
  SYSTEM_UPDATED = "systemUpdated",
  SYSTEM_ERROR = "systemError",
}

// types
export type EntityId = number;
