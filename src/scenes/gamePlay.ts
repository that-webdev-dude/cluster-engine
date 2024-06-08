import { Scene, Systems } from "../cluster";
import { Background } from "../entities/Background";
import { Spaceship } from "../entities/Spaceship";

// entities
const background = new Background();
const spaceship = new Spaceship();
const entities = [background, spaceship];

// systems
const renderSystem = new Systems.Render();
const speedSystem = new Systems.Speed();
const inputSystem = new Systems.Input(entities);
const systems = [inputSystem, speedSystem, renderSystem];

const gameplay = new Scene("gameplay");
gameplay.entities.add(...entities);
gameplay.systems.add(...systems);

export { gameplay };
