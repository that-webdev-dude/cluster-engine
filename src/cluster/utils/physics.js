function applyForce(entity, force) {
  const { acceleration: acc, mass = 1 } = entity;
  acc.x += force.x / mass;
  acc.y += force.y / mass;
}

function applyImpulse(entity, force, dt) {
  //   const { acceleration: acc, mass = 1 } = entity;
  //   acc.x += force.x / mass;
  //   acc.y += force.y / mass;
  applyForce(entity, { x: force.x / dt, y: force.y / dt });
}

function integrate(entity, dt) {
  const { position: pos, velocity: vel, acceleration: acc } = entity;
  // velocity vertlex intagration
  const vx = vel.x + acc.x * dt;
  const vy = vel.y + acc.y * dt;
  const x = ((vel.x + vx) / 2) * dt;
  const y = ((vel.y + vy) / 2) * dt;
  pos.add({ x, y });
  vel.set(vx, vy);
  acc.set(0, 0);
}

export default {
  applyForce,
  applyImpulse,
  integrate,
};
