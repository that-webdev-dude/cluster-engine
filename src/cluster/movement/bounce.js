function bounce(targetEntity, bounds, dx, dy, offset = 0) {
  const { position, velocity } = targetEntity;

  let posX = position.x + dx;
  let posY = position.y + dy;
  let xo = dx;
  let yo = dy;

  if (posX <= bounds.left || posX >= bounds.right) {
    xo = 0;
    velocity.x *= -1;
  }

  if (posY <= bounds.top || posY >= bounds.bottom) {
    yo = 0;
    velocity.y *= -1;
  }

  return { x: xo, y: yo };
}

export default bounce;
