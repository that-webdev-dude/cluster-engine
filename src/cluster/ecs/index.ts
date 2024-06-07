// components
import { VisibilityComponent } from "./components/VisibilityComponent";
import { TransformComponent } from "./components/TransformComponent";
import { TextureComponent } from "./components/TextureComponent";
import { RadiusComponent } from "./components/RadiusComponent";
import { ColourComponent } from "./components/ColourComponent";
import { InputComponent } from "./components/InputComponent";
import { TextComponent } from "./components/TextComponent";
import { SizeComponent } from "./components/SizeComponent";

namespace Components {
  export const Visibility = VisibilityComponent;
  export const Transform = TransformComponent;
  export const Texture = TextureComponent;
  export const Colour = ColourComponent;
  export const Radius = RadiusComponent;
  export const Input = InputComponent;
  export const Text = TextComponent;
  export const Size = SizeComponent;
}

export { Components };

// systems
import { RenderSystem } from "./systems/RenderSystem";

namespace Systems {
  export const Render = RenderSystem;
}

export { Systems };
