import weaponImageURL from "../images/weapon.png";
import Bullet from "./Bullet";
import cluster from "../cluster";

const { Sprite, Texture, Vector } = cluster;

class Weapon extends Sprite {
  constructor(level, position = new Vector()) {
    super(new Texture(weaponImageURL));
    this.level = level;
    this.position = position;
    this.fireRate = 0.2;
    this.ammo = 100;
  }

  fire(dt, position, direction) {
    if (this.ammo > 0) {
      const { level } = this;
      this.fireRate -= dt;
      if (this.fireRate < 0) {
        this.fireRate = 0.2;
        // this.ammo--;
        const bulletPos = position
          .clone()
          .add(this.position.clone().add(new Vector(direction * this.width, -4)));
        return new Bullet(level, bulletPos, direction);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

export default Weapon;
