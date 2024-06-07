import { Scene, Systems } from "../cluster";
import { Circle } from "../entities/Circle";
import { Rect } from "../entities/Rect";
import { Image } from "../entities/Image";
import spaceshipImageURL from "../images/spaceship.png";

// entities
const circle = new Circle();
const rect = new Rect();
const image = new Image(spaceshipImageURL);

// systems
const renderSystem = new Systems.Render();

const gameplay = new Scene("gameplay");
gameplay.entities.add(image, rect, circle);
gameplay.systems.add(renderSystem);

export { gameplay };
