import Container from "../cluster/core/Container";
import Dummy from "../entities/Dummy";
import math from "../cluster/utils/math";

class GameScreen extends Container {
  constructor(game, input) {
    super();
    const { width, height } = game;
    const bounds = {
      top: 0,
      right: width,
      bottom: height,
      left: 0,
    };

    this.dummies = this.add(new Container());
    this.bounds = bounds;
    this.init(bounds);
  }

  init(bounds) {
    for (let i = 0; i < 30; i++) {
      const dummy = this.dummies.add(new Dummy(bounds));
      // prettier-ignore
      dummy.position.set(
        math.rand(48, bounds.right - 96),
        math.rand(48, bounds.bottom - 96)
      );
    }
  }

  // test update
  update(dt, t) {
    super.update(dt, t);
    const dummies = this.dummies.children;

    for (let i = 0; i < dummies.length; i++) {
      const a = dummies[i];
      for (let j = i + 1; j < dummies.length; j++) {
        const b = dummies[j];

        const difference = b.position.clone().subtract(a.position);
        const distance = a.radius + b.radius;

        // collision detection (circle)
        if (difference.magnitude <= distance) {
          // resolve a & b positions
          const direction = difference.normalize();
          const midpoint = a.position.clone().add(b.position).scale(0.5);
          a.position.set(midpoint.x - a.radius * direction.x, midpoint.y - a.radius * direction.y);
          b.position.set(midpoint.x + b.radius * direction.x, midpoint.y + b.radius * direction.y);

          // now project the difference between a & b velocities on the normal between them
          // 1. compute the normal vector to the a & b velocities (subtract)
          // 2. add the components projected to the normal direction (dot)
          // 3. scale the direction vector by the power (displacement)
          // 4. resolve a & b velocities
          const power = b.velocity.clone().subtract(a.velocity).dot(direction);
          const displacement = direction.multiply(power);
          b.velocity.subtract(displacement);
          a.velocity.add(displacement);
        }
      }
    }
  }
}

export default GameScreen;
