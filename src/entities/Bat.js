import tilesImageURL from "../images/tiles_pixel.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";

class Bat extends TileSprite {
  constructor() {
    super(new Texture(tilesImageURL), 48, 48);
    this.frame = { x: 3, y: 1 };
    this.speed = 100;
    this.waypoint = { x: 0, y: 0 };
    this.setWaypoint = () => {};
    this.hitbox = {
      x: 0,
      y: 0,
      width: 48,
      height: 48,
    };
    this.animation.add(
      "fly",
      [
        { x: 3, y: 1 },
        { x: 4, y: 1 },
      ],
      0.25
    );
    this.animation.play("fly");
  }

  lookLeft() {
    this.anchor = { x: 0, y: 0 };
    this.scale = { x: 1, y: 1 };
  }

  lookRight() {
    this.anchor = { x: 48, y: 0 };
    this.scale = { x: -1, y: 1 };
  }

  update(dt, t) {
    super.update(dt, t);

    const { waypoint, position, speed } = this;

    let waypointDistanceX = waypoint.x - position.x;
    let waypointDistanceY = waypoint.y - position.y;
    let step = speed * dt;

    let isCloseX = Math.abs(waypointDistanceX) <= step;
    let isCloseY = Math.abs(waypointDistanceY) <= step;

    let dx = speed * (waypointDistanceX > 0 ? 1 : -1) * dt;
    let dy = speed * (waypointDistanceY > 0 ? 1 : -1) * dt;

    if (dx < 0) {
      this.lookLeft();
    } else if (dx > 0) {
      this.lookRight();
    }

    if (!isCloseX) {
      position.x += dx;
    }

    if (!isCloseY) {
      position.y += dy;
    }

    if (isCloseX && isCloseY) {
      this.waypoint = this.setWaypoint();
    }
  }
}

export default Bat;
