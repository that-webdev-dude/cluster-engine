import weaponImageURL from "../images/weapon.png";
import Bullet from "./Bullet";
import cluster from "../cluster";

const { Sprite, Texture, Vector } = cluster;

class Weapon extends Sprite {
  constructor(position) {
    super(new Texture(weaponImageURL));
    this.loaded = true;
    this.anchor = new Vector(-this.width / 2, 0);
    this.position = position;
    this.fireRate = 0.1;
  }

  fire(position, direction, dt) {
    this.fireRate -= dt;
    if (this.fireRate < 0) {
      this.fireRate = 0.1;
      return new Bullet(
        Vector.from(position).add(new Vector(this.width * direction + 8, 0)),
        direction
      );
    } else {
      return null;
    }
  }
}

export default Weapon;
