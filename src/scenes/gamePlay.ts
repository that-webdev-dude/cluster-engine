import { Scene, Systems } from "../cluster";
import { Background } from "../entities/Background";
import { Spaceship } from "../entities/Spaceship";

const background = new Background();
const spaceship = new Spaceship();

const gameplay = new Scene("gameplay");
gameplay.entities.add(background, spaceship);
gameplay.systems.add(new Systems.MovementSystem(), new Systems.RenderSystem());

export { gameplay };
