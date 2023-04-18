import Particle from "../cluster/fx/Particle";
import Circle from "../cluster/shapes/Circle";
import math from "../cluster/utils/math";

class BloodParticle extends Particle {
  constructor() {
    super(
      0.5,
      new Circle({
        radius: math.randf(5, 2),
        style: { fill: "red" },
      })
    );
  }
}

export default BloodParticle;
