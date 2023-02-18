import barrelImageURL from "../images/barrel.png";
import cluster from "../cluster";
const { Sprite, Texture, Vector } = cluster;

class Barrel extends Sprite {
  constructor(position = new Vector()) {
    super(new Texture(barrelImageURL));

    this.position = position;
  }
}

export default Barrel;
