import tilesImageURL from "../images/tiles_pixel.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";

class Ghost extends TileSprite {
  constructor() {
    super(new Texture(tilesImageURL), 48, 48);
    this.frame = { x: 5, y: 1 };
    this.speed = 75;
    this.counter = 0;
    this.waypoints = [];
    this.setWaypoints = () => {};
    this.waypoint = { x: 0, y: 0 };
    this.hitbox = {
      x: 1,
      y: 1,
      width: 48,
      height: 48,
    };
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
    return this.waypoints.pop();
  }

  followPath(dt, t) {
    const { waypoints, position, speed } = this;
    console.log("file: Ghost.js ~ line 38 ~ Ghost ~ followPath ~ waypoints", waypoints);
    if (!waypoints.length) {
      return;
    }
    const waypoint = this.waypoints.pop();
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
      this.waypoint = this.waypoints.pop();
      if (waypoints.length === 0) {
        this.setWaypoints();
      }
    }
  }

  update(dt, t) {
    super.update(dt, t);
    // this.followPath(dt, t);
    // this.counter -= dt;
    // if (this.counter < 0) {
    //   this.counter = 10;
    //   this.waypoints = this.setWaypoints().map((waypoint) => {
    //     return {
    //       x: waypoint.x * this.tileW,
    //       y: waypoint.y * this.tileH,
    //     };
    //   });
    //   this.waypoint = this.waypoints.pop();
    // }

    // const { waypoints, waypoint, position, speed } = this;
    // let waypointDistanceX = waypoint.x - position.x;
    // let waypointDistanceY = waypoint.y - position.y;
    // let step = speed * dt;
    // let isCloseX = Math.abs(waypointDistanceX) <= step;
    // let isCloseY = Math.abs(waypointDistanceY) <= step;
    // let dx = speed * (waypointDistanceX > 0 ? 1 : -1) * dt;
    // let dy = speed * (waypointDistanceY > 0 ? 1 : -1) * dt;

    // if (dx < 0) {
    //   this.lookLeft();
    // } else if (dx > 0) {
    //   this.lookRight();
    // }
    // if (!isCloseX) {
    //   position.x += dx;
    // }

    // if (!isCloseY) {
    //   position.y += dy;
    // }

    // if (isCloseX && isCloseY) {
    //   this.waypoint = this.waypoints.pop();
    // }
  }
}

export default Ghost;
