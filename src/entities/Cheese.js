import Texture from "../cluster/core/Texture";
import Sprite from "../cluster/core/Sprite";
import cheeseImageURL from "../images/cheese.png";

class Cheese extends Sprite {
  constructor() {
    super(new Texture(cheeseImageURL));
    this.height = 50;
    this.width = 74;
  }
}

export default Cheese;
