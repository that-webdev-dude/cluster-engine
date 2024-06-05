import { Scene, Texture, RenderSystem, InputSystem } from "../cluster";
import backgroundImageURL from "../images/background.png";
import spaceshipImageURL from "../images/spaceship.png";

const background = new Texture({
  imageURL: backgroundImageURL,
});

const spaceship = new Texture({
  imageURL: spaceshipImageURL,
});

const gameplay = new Scene("gameplay");
gameplay.entities.add(background, spaceship);
gameplay.systems.add(new InputSystem(), new RenderSystem());

export { gameplay };
