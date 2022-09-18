import { Bodies, Body } from "../../vendor/matter";
import penguinImageURL from "../images/pengolfin.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import Vector from "../cluster/utils/Vector";

class Penguin extends TileSprite {
  constructor(position = new Vector(0, 0)) {
    super(new Texture(penguinImageURL), 32, 32);

    // in matter, default position and pivot are in
    // the center of the entity
    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.anchor = Vector.from(this.pivot).multiply(-1);

    // 1. create the body
    this.body = Bodies.circle(position.x, position.y, 10, { restitution: 0.7 });
    this.body.torque = 0.002;
  }

  fire(power, angle) {
    const { body } = this;
    Body.applyForce(
      body,
      { x: body.position.x, y: body.position.y },
      { x: power * Math.cos(angle), y: power * Math.sin(angle) }
    );
  }

  update(dt, t) {
    const { body } = this;

    // 2. sync the body and this Rect
    this.angle = body.angle * (180 / Math.PI);
    this.position.copy(body.position);
  }
}

export default Penguin;
