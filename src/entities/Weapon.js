import weaponImageURL from "../images/weapon.png";
import cluster from "../cluster";

const { Sprite, Texture, Vector } = cluster;

class Weapon extends Sprite {
  constructor(position = new Vector()) {
    super(new Texture(weaponImageURL));
    this.position = position;
    this.fireRate = 0.1;
  }
}

export default Weapon;
