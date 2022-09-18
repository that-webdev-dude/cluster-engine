function bounce(targetEntity, bounds, dx, dy, offset = 0) {
  const { position, velocity, width, height } = targetEntity;

  let x = position.x + dx;
  let y = position.y + dy;
  let xo = dx;
  let yo = dy;

  if (x <= bounds.left + offset || x >= bounds.right - width - offset) {
    xo = 0;
    velocity.x *= -1;
  }

  if (y <= bounds.top + offset || y >= bounds.bottom - height - offset) {
    yo = 0;
    velocity.y *= -1;
  }

  return { x: xo, y: yo };
}

export default bounce;
