
# Collision Component Documentation

## Overview
The `CollisionComponent` is a class that implements the `Component` interface. It is responsible for managing collision data for an entity in a game or simulation. This component tracks collisions and defines collision layers and masks for entities.

## Imports
```typescript
import { Component } from "../../core/Component";
import { Entity } from "../../core/Entity";
```

## Interfaces

### CollisionData
The `CollisionData` interface represents data for a single collision.
```typescript
interface CollisionData {
  entity: Entity;
}
```

### CollisionOptions
The `CollisionOptions` interface defines the properties that can be passed to the `CollisionComponent` constructor.
```typescript
export interface CollisionOptions {
  layer?: number;
  mask?: number;
}
```

## CollisionComponent Class
The `CollisionComponent` class implements the `Component` interface and handles collision properties for an entity.

### Properties
- `collisions: Array<CollisionData>`: An array that stores collision data.
- `layer: number`: The collision layer of this entity (read-only).
- `mask: number`: The layers with which this entity can collide (read-only).

### Constructor
The constructor accepts an optional `CollisionOptions` object to initialize the component with specific layer and mask values.
```typescript
constructor({ layer = 0, mask = 1 }: CollisionOptions = {}) {
  this.collisions = [];
  this.layer = layer;
  this.mask = mask;
}
```

#### Parameters
- `layer` (optional, default = 0): The collision layer of this entity.
- `mask` (optional, default = 1): The layers with which this entity can collide.

### Example Usage
```typescript
import { CollisionComponent } from "./path/to/CollisionComponent";
import { Entity } from "../../core/Entity";

// Creating a new collision component with default options
const defaultCollisionComponent = new CollisionComponent();

// Creating a new collision component with custom options
const customCollisionComponent = new CollisionComponent({ layer: 2, mask: 3 });

// Accessing the properties
console.log(defaultCollisionComponent.layer); // Output: 0
console.log(customCollisionComponent.mask);   // Output: 3
```

## Summary
The `CollisionComponent` class is used to manage collision data for entities, allowing you to define and track collision layers and masks. By using the provided options, you can customize the collision behavior for different entities in your application.
