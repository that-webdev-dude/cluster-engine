import Container from "../core/Container";
// import Particle from "./Particle";

class ParticleEmitter extends Container {
  constructor(particles, position) {
    super();
    particles.forEach((particle) => this.add(particle));
    this.particles = particles;
    this.position = position;
  }

  play() {
    this.particles.forEach((p) => p.reset());
  }
}

export default ParticleEmitter;
