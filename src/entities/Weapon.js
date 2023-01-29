import weaponImageURL from "../images/weapon.png";
import cluster from "../cluster";

const { Sprite, Texture, Vector } = cluster;

class Weapon extends Sprite {
  constructor() {
    super(new Texture(weaponImageURL));
    this.loaded = true;
    this.pivot = new Vector(6, 6);
    this.anchor = new Vector(-3, -3);
    this.position = new Vector(16, 16);
  }

  fire(done = () => {}) {
    // ...
    done();
  }
}

export default Weapon;
