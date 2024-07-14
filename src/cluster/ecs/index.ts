import { Vector } from "../tools/Vector";

// components
import { VisibilityComponent } from "./components/VisibilityComponent";
import { TransformComponent } from "./components/TransformComponent";
import { TextureComponent } from "./components/TextureComponent";
import { RadiusComponent } from "./components/RadiusComponent";
import { ColourComponent } from "./components/ColourComponent";
import { TextComponent } from "./components/TextComponent";
import { SizeComponent } from "./components/SizeComponent";
import { VelocityComponent } from "./components/VelocityComponent";
import { PhysicsComponent } from "./components/PhysicsComponent";
import { KeyboardComponent } from "./components/KeyboardComponent";
import { ScreenComponent } from "./components/ScreenComponent";
import { StatusComponent } from "./components/StatusComponent";
import { HitboxComponent } from "./components/HitboxComponent";
import { SpawnerComponent } from "./components/SpawnerComponent";
import { CollisionComponent } from "./components/CollisionComponent";

namespace Components {
  export const Visibility = VisibilityComponent;
  export const Transform = TransformComponent;
  export const Texture = TextureComponent;
  export const Colour = ColourComponent;
  export const Radius = RadiusComponent;
  export const Text = TextComponent;
  export const Size = SizeComponent;
  export const Velocity = VelocityComponent;
  export const Physics = PhysicsComponent;
  export const Keyboard = KeyboardComponent;
  export const Screen = ScreenComponent;
  export const Status = StatusComponent;
  export const Hitbox = HitboxComponent;
  export const Spawner = SpawnerComponent;
  export const Collision = CollisionComponent;
}

export { Components };

// systems
import { RenderSystem } from "./systems/RenderSystem";
import { InputSystem } from "./systems/InputSystem";
import { ScreenSystem } from "./systems/ScreenSystem";
import { SpawnSystem } from "./systems/SpawnSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { CollisionSystem, ResolutionSystem } from "./systems/CollisionSystem";

namespace Systems {
  export const Render = RenderSystem;
  export const Input = InputSystem;
  export const Spawn = SpawnSystem;
  export const Screen = ScreenSystem;
  export const Physics = PhysicsSystem;
  export const Movement = MovementSystem;
  export const Collision = CollisionSystem;
  export const Resolution = ResolutionSystem;
}

export { Systems };
