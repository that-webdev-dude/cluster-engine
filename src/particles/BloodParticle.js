import cluster from "../cluster/index";
const { Particle, Vector, Circle, math } = cluster;

class BloodParticle extends Particle {
  constructor(direction, fill = "red") {
    super({
      alpha: 1,
      lifeSpan: 2,
      velocity: new Vector(math.randf(direction * 1, direction * 10), math.randf(-15, -2.5)),
      gravity: true,
      renderable: new Circle({
        radius: math.randf(1.5, 5.5),
        style: { fill: fill },
      }),
    });
  }
}

export default BloodParticle;
