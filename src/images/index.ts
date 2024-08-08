import playerImageURL from "./player.png";
import bulletsImageURL from "./bullets.png";
import enemiesImageURL from "./enemies.png";
import { Assets } from "../cluster";

const playerImage = Assets.image(playerImageURL);
const bulletsImage = Assets.image(bulletsImageURL);
const enemiesImage = Assets.image(enemiesImageURL);

export { playerImage, bulletsImage, enemiesImage };
