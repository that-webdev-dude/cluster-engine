// components
import { VisibilityComponent } from "./components/VisibilityComponent";
import { TransformComponent } from "./components/TransformComponent";
import { TextureComponent } from "./components/TextureComponent";
import { RadiusComponent } from "./components/RadiusComponent";
import { ColourComponent } from "./components/ColourComponent";
import { TextComponent } from "./components/TextComponent";
import { SizeComponent } from "./components/SizeComponent";
import { SpeedComponent } from "./components/SpeedComponent";
import { PhysicsComponent } from "./components/PhysicsComponent";
import { KeyboardComponent } from "./components/KeyboardComponent";

namespace Components {
  export const Visibility = VisibilityComponent;
  export const Transform = TransformComponent;
  export const Texture = TextureComponent;
  export const Colour = ColourComponent;
  export const Radius = RadiusComponent;
  export const Text = TextComponent;
  export const Size = SizeComponent;
  export const Speed = SpeedComponent;
  export const Physics = PhysicsComponent;
  export const Keyboard = KeyboardComponent;
}

export { Components };

// systems
import { SpeedSystem } from "./systems/SpeedSystem";
import { RenderSystem } from "./systems/RenderSystem";
import { InputSystem } from "./systems/InputSystem";

namespace Systems {
  export const Render = RenderSystem;
  export const Speed = SpeedSystem;
  export const Input = InputSystem;
}

export { Systems };
