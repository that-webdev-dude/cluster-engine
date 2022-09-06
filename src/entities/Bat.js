import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import State from "../cluster/core/State";
import entity from "../cluster/utils/entity";
import math from "../cluster/utils/math";

const states = {
  ATTACK: 0,
  EVADE: 1,
  WANDER: 2,
};

class Bat extends TileSprite {
  constructor(target) {
    super(new Texture(tilesImageURL), 48, 48);
    this.state = new State(states.ATTACK);
    this.frame = { x: 3, y: 1 };
    this.speed = 100;
    this.target = target;
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

  move(dt, t, speed) {
    const { waypoint, position } = this;

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
  }

  update(dt, t) {
    super.update(dt, t);

    const { state, target } = this;
    state.update(dt, t);

    const distance = entity.distance(target, this);
    switch (state.get()) {
      case states.ATTACK:
        if (state.first) {
          this.waypoint = this.setWaypoint(target.position);
        }
        this.move(dt, t, 100);
        if (distance < 60) {
          state.set(states.EVADE);
        }
        break;
      case states.EVADE:
        if (state.first) {
          this.waypoint = this.setWaypoint();
        }
        this.move(dt, t, 150);
        if (distance > 120) {
          state.set(math.rand(states.ATTACK, states.WANDER));
        }
        break;
      case states.WANDER:
        if (state.first) {
          this.waypoint = this.setWaypoint();
        }
        this.move(dt, t, 100);
        if (state.time > 5) {
          this.state.set(states.ATTACK);
        }
        break;
    }
  }
}

export default Bat;
