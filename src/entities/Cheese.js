import Texture from "../cluster/core/Texture";
import Sprite from "../cluster/core/Sprite";
import cheeseImageURL from "../images/cheese.png";

class Cheese extends Sprite {
  constructor() {
    super(new Texture(cheeseImageURL));
    this.width = 74;
    this.height = 50;
    this.hitbox = {
      x: 4,
      y: 8,
      width: 66,
      height: 42,
    };
  }
}

export default Cheese;
