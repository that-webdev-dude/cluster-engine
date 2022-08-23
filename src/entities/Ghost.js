import tilesImageURL from "../images/tiles_pixel.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import wallslide from "../cluster/movement/wallslide";

class Ghost extends TileSprite {
  constructor(setPath) {
    super(new Texture(tilesImageURL), 48, 48);
    // this.level = level;
    this.frame = { x: 5, y: 1 };
    this.speed = 100;
    this.hitbox = {
      x: 0,
      y: 0,
      width: 48,
      height: 48,
    };

    this.path = [];
    this.waypoint = null;
    this.setPath = setPath;
  }

  lookLeft() {
    this.anchor = { x: 0, y: 0 };
    this.scale = { x: 1, y: 1 };
  }

  lookRight() {
    this.anchor = { x: 48, y: 0 };
    this.scale = { x: -1, y: 1 };
  }

  setWaypoint() {
    this.waypoint = this.path.pop();
  }

  update(dt, t) {
    super.update(dt, t);

    let { path, position, speed } = this;

    if (path.length === 0) {
      this.path = this.setPath();
      this.setWaypoint();
    }

    let waypointDistanceX = this.waypoint.x - position.x;
    let waypointDistanceY = this.waypoint.y - position.y;
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
      this.setWaypoint();
    }
  }
}

export default Ghost;
