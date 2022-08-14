import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";

class Bat extends TileSprite {
  constructor() {
    super(new Texture(tilesImageURL), 48, 48);
    this.frame = { x: 3, y: 1 };
    this.speed = 100;
    this.waypoint = { x: 0, y: 0 };
    this.setWaypoint = () => {};
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

  update(dt, t) {
    super.update(dt, t);

    const { waypoint, position, speed } = this;

    let waypointDistanceX = waypoint.x - position.x;
    let waypointDistanceY = waypoint.y - position.y;
    let step = speed * dt;

    let isCloseX = Math.abs(waypointDistanceX) <= step;
    let isCloseY = Math.abs(waypointDistanceY) <= step;

    if (!isCloseX) {
      position.x += speed * (waypointDistanceX > 0 ? 1 : -1) * dt;
    }

    if (!isCloseY) {
      position.y += speed * (waypointDistanceY > 0 ? 1 : -1) * dt;
    }

    if (isCloseX && isCloseY) {
      this.waypoint = this.setWaypoint();
    }
  }
}

export default Bat;
