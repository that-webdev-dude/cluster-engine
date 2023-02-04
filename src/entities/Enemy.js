import charactersImageURL from "../images/characters.png";
import Physics from "../cluster/utils/Physics";
import Vector from "../cluster/utils/Vector";
import State from "../cluster/core/State";
import Entity from "./Entity";
import wallslide from "../cluster/movement/wallslide";
// import cluster from "../cluster";
import entity from "../cluster/utils/entity";

const ENEMY_ACCELERATION = 2500;
const ENEMY_FRICTION = ENEMY_ACCELERATION / 2;
const ENEMY_VELOCITY = ENEMY_ACCELERATION / 6;
const ENEMY_GRAVITY = 2800;

class Enemy extends Entity {
  constructor(target, level) {
    super({
      textureURL: charactersImageURL,
      spriteW: 32,
      spriteH: 32,
      animations: [
        {
          name: "idle",
          rate: 0.25,
          frames: [
            { x: 1, y: 3 },
            { x: 2, y: 3 },
          ],
        },
        {
          name: "walk",
          rate: 0.25,
          frames: [
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 1, y: 3 },
          ],
        },
      ],
      hitbox: {
        x: 0,
        y: 0,
        width: 32,
        height: 31,
      },
      acceleration: new Vector(),
      velocity: new Vector(),
      position: new Vector(32 * 10, 32),
    });

    this.state = new State();
    this.level = level;
    this.target = target;

    this.animation.play("walk");

    // debug props
    this.firstUpdate = true;
  }

  update(dt, t) {
    super.update(dt, t);

    const { target, level, velocity, position } = this;

    Physics.World.applyFriction(this, ENEMY_FRICTION);
    Physics.World.applyGravity(this, ENEMY_GRAVITY);

    const targetVector = position.clone().to(target.position).unit();
    if (targetVector.x >= 0) this.lookRight();
    if (targetVector.x < 0) this.lookLeft();

    const { x: dx, y: dy } = Physics.World.getDisplacement(this, dt);
    const r = wallslide(this, level, dx, dy);
    if (r.hits.down || r.hits.up) {
      velocity.set(velocity.x, 0);
    }
    if (r.hits.left || r.hits.right) {
      velocity.set(0, velocity.y);
    }
    if (this.velocity.magnitude <= 10) {
      velocity.set(0, 0);
    }
    position.add(r);

    if (this.firstUpdate) {
      // ...
    }

    this.firstUpdate = false;
  }
}

export default Enemy;
