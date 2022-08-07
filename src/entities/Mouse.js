import Texture from "../cluster/core/Texture";
import Sprite from "../cluster/core/Sprite";
import mouseImageURL from "../images/mouse.png";

class Mouse extends Sprite {
  constructor(controller) {
    super(new Texture(mouseImageURL));
    this.controller = controller;
    this.height = 51;
    this.width = 100;
    this.hitbox = {
      x: 18,
      y: 6,
      width: 72,
      height: 38,
    };
  }

  update(dt, t) {
    const { position, controller } = this;
    const { x, y } = controller;
    const speed = 100;
    position.x += x * dt * speed;
    position.y += y * dt * speed;
  }
}

export default Mouse;
