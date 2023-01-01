import weaponImageURL from "../images/weapon.png";
import cluster from "../cluster";

const { Sprite, Texture, Vector } = cluster;

class Weapon extends Sprite {
  constructor() {
    super(new Texture(weaponImageURL));
    this.pivot = new Vector(6, 6);
    this.anchor = new Vector(-3, -3);
    this.position = new Vector(16, 16);
    this.reloadProgress = 100;
    this.reloadSpeed = 750;
    this.loaded = true;
  }

  fire(done = () => {}) {
    this.reloadProgress = 0;
    this.loaded = false;
    done();
  }

  update(dt, t) {
    if (!this.loaded && this.reloadProgress < 100) {
      this.reloadProgress += this.reloadSpeed * dt;
    }
    if (this.reloadProgress >= 100) {
      this.reloadProgress = 100;
      this.loaded = true;
    }
  }
}

export default Weapon;
